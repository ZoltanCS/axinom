import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { useKernel } from '../../kernel';

interface TermLine {
  type: 'input' | 'output' | 'system';
  text: string;
}

function normalizePath(cwd: string, target: string): string {
  if (target.startsWith('/')) return '/' + target.split('/').filter(Boolean).join('/');
  const base = cwd === '/' ? [] : cwd.split('/').filter(Boolean);
  const parts = target.split('/');
  for (const p of parts) {
    if (p === '..') base.pop();
    else if (p !== '.' && p !== '') base.push(p);
  }
  return '/' + base.join('/');
}

export function AXI_Terminal() {
  const { vfs, eventBus, spawnApp } = useKernel();
  const [lines, setLines] = useState<TermLine[]>([
    { type: 'system', text: '  Axinom Terminal v2.0' },
    { type: 'system', text: '  Type "help" for commands' },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/home/user');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); }, [lines]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const addOutput = useCallback((text: string, type: TermLine['type'] = 'output') => {
    setLines((prev) => [...prev, { type, text }]);
  }, []);

  const executeCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      setLines((prev) => [...prev, { type: 'input', text: `${cwd} > ${trimmed}` }]);
      setHistory((prev) => [...prev, trimmed]);
      setHistIdx(-1);
      const args = trimmed.split(/\s+/);
      const cmd = args[0];
      const rest = args.slice(1);

      switch (cmd) {
        case 'help': {
          addOutput('Available commands:', 'system');
          addOutput('  ls [-a]       List directory');
          addOutput('  cd [path]     Change directory');
          addOutput('  cat [file]    Display file');
          addOutput('  mkdir [name]  Create directory');
          addOutput('  touch [name]  Create file');
          addOutput('  rm [-rf] [p]  Remove file/dir');
          addOutput('  pwd           Working directory');
          addOutput('  echo [text]   Print text');
          addOutput('  clear         Clear terminal');
          addOutput('  neofetch      System info');
          addOutput('  open [app]    Launch app');
          addOutput('  reboot        Reboot system');
          addOutput('');
          break;
        }
        case 'ls': {
          const showAll = rest.includes('-a');
          const targetPath = rest.filter((a) => !a.startsWith('-'))[0];
          const dirPath = targetPath ? normalizePath(cwd, targetPath) : cwd;
          const items = vfs.listDetailed(dirPath);
          if (!items) { addOutput(`ls: cannot access '${dirPath}': No such directory`); }
          else {
            if (showAll) addOutput('.  ..');
            for (const item of items) {
              const icon = item.type === 'directory' ? '📁' : '📄';
              addOutput(`  ${icon} ${item.name}${item.type === 'directory' ? '/' : ''}`);
            }
            if (items.length === 0) addOutput('  (empty)');
          }
          addOutput('');
          break;
        }
        case 'cd': {
          const target = rest[0] || '/home/user';
          const newPath = normalizePath(cwd, target);
          if (vfs.isDirectory(newPath)) setCwd(newPath);
          else addOutput(`cd: ${target}: No such directory`);
          break;
        }
        case 'cat': {
          if (!rest[0]) { addOutput('cat: missing operand'); break; }
          const filePath = normalizePath(cwd, rest[0]);
          const content = vfs.read(filePath);
          if (content === null) addOutput(`cat: ${rest[0]}: No such file`);
          else content.split('\n').forEach((line) => addOutput(line));
          addOutput('');
          break;
        }
        case 'mkdir': {
          if (!rest[0]) { addOutput('mkdir: missing operand'); break; }
          if (!vfs.mkdir(normalizePath(cwd, rest[0]))) addOutput(`mkdir: cannot create '${rest[0]}'`);
          break;
        }
        case 'touch': {
          if (!rest[0]) { addOutput('touch: missing operand'); break; }
          if (!vfs.write(normalizePath(cwd, rest[0]), '')) addOutput(`touch: cannot create '${rest[0]}'`);
          break;
        }
        case 'rm': {
          const force = rest.includes('-rf') || rest.includes('-r');
          const target = rest.filter((a) => !a.startsWith('-'))[0];
          if (!target) { addOutput('rm: missing operand'); break; }
          if (!vfs.delete(normalizePath(cwd, target)))
            addOutput(`rm: cannot remove '${target}'${force ? '' : ': Use -rf for directories'}`);
          break;
        }
        case 'pwd': { addOutput(cwd); break; }
        case 'echo': { addOutput(rest.join(' ')); break; }
        case 'clear': { setLines([]); break; }
        case 'neofetch': {
          const nf = [
            '',
            '   ▄▀▀▀▀▀▀▀▀▀▄     OS:       Axinom WDE v2.0',
            '  █  ▄▀▀▀▀▄  █     Kernel:   AXI-CORE 2.0',
            '  █ █      █ █     Shell:    AXI Terminal',
            '  █ █  AX  █ █     Theme:    Premium Futurism',
            '  █ █      █ █     UI:       Glassmorphism + Neon',
            '  █  ▀▄▄▄▄▀  █     Font:     Inter / JetBrains Mono',
            `   ▀▄▄▄▄▄▄▄▄▄▀     Res:      ${window.innerWidth}x${window.innerHeight}`,
            '',
          ];
          nf.forEach((line) => addOutput(line, 'system'));
          break;
        }
        case 'open': {
          const appName = rest[0];
          const validApps = ['terminal', 'editor', 'canvas', 'navigator', 'files', 'taskmanager', 'settings'] as const;
          type ValidApp = typeof validApps[number];
          if (appName && validApps.includes(appName as ValidApp)) {
            spawnApp(appName as ValidApp);
            addOutput(`Opening ${appName}...`, 'system');
          } else {
            addOutput(`open: unknown app '${appName || ''}'`);
            addOutput('Available: ' + validApps.join(', '));
          }
          break;
        }
        case 'reboot': {
          addOutput('System rebooting...', 'system');
          eventBus.emit('system:reboot');
          break;
        }
        default: {
          addOutput(`${cmd}: command not found`);
          addOutput('Type "help" for available commands.');
          addOutput('');
        }
      }
    },
    [cwd, vfs, addOutput, spawnApp, eventBus]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') { executeCommand(input); setInput(''); }
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length > 0) {
          const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
          setHistIdx(idx); setInput(history[idx]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx >= 0) {
          const idx = histIdx + 1;
          if (idx >= history.length) { setHistIdx(-1); setInput(''); }
          else { setHistIdx(idx); setInput(history[idx]); }
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (input) {
          const parts = input.split(/\s+/);
          const last = parts[parts.length - 1];
          const dir = last.includes('/') ? normalizePath(cwd, last.substring(0, last.lastIndexOf('/'))) : cwd;
          const prefix = last.includes('/') ? last.substring(last.lastIndexOf('/') + 1) : last;
          const items = vfs.list(dir);
          if (items) {
            const matches = items.filter(n => n.startsWith(prefix));
            if (matches.length === 1) {
              parts[parts.length - 1] = last.includes('/')
                ? last.substring(0, last.lastIndexOf('/') + 1) + matches[0] : matches[0];
              setInput(parts.join(' '));
            }
          }
        }
      }
    },
    [input, history, histIdx, executeCommand, cwd, vfs]
  );

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, display: 'flex', flexDirection: 'column' }}
      onClick={() => inputRef.current?.focus()}>
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6,
            color: line.type === 'input' ? '#06b6d4' : line.type === 'system' ? '#3b82f6' : '#94a3b8',
          }}>{line.text || '\u00A0'}</div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ whiteSpace: 'nowrap', marginRight: 8, color: '#06b6d4', fontWeight: 600 }}>{cwd} &gt;</span>
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none', caretColor: '#06b6d4' }}
            autoFocus spellCheck={false} />
        </div>
      </div>
    </div>
  );
}

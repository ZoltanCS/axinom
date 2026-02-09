import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { useKernel } from '../../kernel';

interface TermLine {
  type: 'input' | 'output';
  text: string;
}

const NEOFETCH = `
 █████╗ ██╗  ██╗██╗███╗   ██╗ ██████╗ ███╗   ███╗
██╔══██╗╚██╗██╔╝██║████╗  ██║██╔═══██╗████╗ ████║
███████║ ╚███╔╝ ██║██╔██╗ ██║██║   ██║██╔████╔██║
██╔══██║ ██╔██╗ ██║██║╚██╗██║██║   ██║██║╚██╔╝██║
██║  ██║██╔╝ ██╗██║██║ ╚████║╚██████╔╝██║ ╚═╝ ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝

  OS:      AXINOM WDE 1.0.0
  KERNEL:  AXI-CORE
  SHELL:   AXI_TERMINAL
  UI:      BRUTALIST GEOMETRIC MINIMALIST
  DEPTH:   1-BIT MONOCHROMATIC
  RES:     ${typeof window !== 'undefined' ? window.innerWidth : 1920}x${typeof window !== 'undefined' ? window.innerHeight : 1080}
`;

function normalizePath(cwd: string, target: string): string {
  if (target.startsWith('/')) {
    const parts = target.split('/').filter(Boolean);
    return '/' + parts.join('/');
  }
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
    { type: 'output', text: 'AXINOM TERMINAL v1.0.0' },
    { type: 'output', text: 'Type "help" for available commands.' },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/home/user');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addOutput = useCallback((text: string) => {
    setLines((prev) => [...prev, { type: 'output', text }]);
  }, []);

  const executeCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      setLines((prev) => [...prev, { type: 'input', text: `${cwd} $ ${trimmed}` }]);
      setHistory((prev) => [...prev, trimmed]);
      setHistIdx(-1);

      const args = trimmed.split(/\s+/);
      const cmd = args[0];
      const rest = args.slice(1);

      switch (cmd) {
        case 'help': {
          addOutput('Available commands:');
          addOutput('  ls [-a]       List directory contents');
          addOutput('  cd [path]     Change directory');
          addOutput('  cat [file]    Display file contents');
          addOutput('  mkdir [name]  Create directory');
          addOutput('  touch [name]  Create empty file');
          addOutput('  rm [-rf] [p]  Remove file or directory');
          addOutput('  pwd           Print working directory');
          addOutput('  echo [text]   Print text');
          addOutput('  clear         Clear terminal');
          addOutput('  neofetch      System information');
          addOutput('  open [app]    Open application');
          addOutput('                (terminal/editor/canvas/navigator/files/taskmanager)');
          addOutput('  reboot        Reboot system');
          addOutput('');
          break;
        }

        case 'ls': {
          const showAll = rest.includes('-a');
          const targetPath = rest.filter((a) => !a.startsWith('-'))[0];
          const dirPath = targetPath ? normalizePath(cwd, targetPath) : cwd;
          const items = vfs.listDetailed(dirPath);
          if (!items) {
            addOutput(`ls: cannot access '${dirPath}': No such directory`);
          } else {
            if (showAll) {
              addOutput('.  ..');
            }
            for (const item of items) {
              const suffix = item.type === 'directory' ? '/' : '';
              addOutput(`  ${item.name}${suffix}`);
            }
            if (items.length === 0) addOutput('  (empty)');
          }
          addOutput('');
          break;
        }

        case 'cd': {
          const target = rest[0] || '/home/user';
          const newPath = normalizePath(cwd, target);
          if (vfs.isDirectory(newPath)) {
            setCwd(newPath);
          } else {
            addOutput(`cd: ${target}: No such directory`);
          }
          break;
        }

        case 'cat': {
          if (!rest[0]) {
            addOutput('cat: missing operand');
            break;
          }
          const filePath = normalizePath(cwd, rest[0]);
          const content = vfs.read(filePath);
          if (content === null) {
            addOutput(`cat: ${rest[0]}: No such file`);
          } else {
            content.split('\n').forEach((line) => addOutput(line));
          }
          addOutput('');
          break;
        }

        case 'mkdir': {
          if (!rest[0]) {
            addOutput('mkdir: missing operand');
            break;
          }
          const dirPath = normalizePath(cwd, rest[0]);
          if (!vfs.mkdir(dirPath)) {
            addOutput(`mkdir: cannot create '${rest[0]}'`);
          }
          break;
        }

        case 'touch': {
          if (!rest[0]) {
            addOutput('touch: missing operand');
            break;
          }
          const filePath = normalizePath(cwd, rest[0]);
          if (!vfs.write(filePath, '')) {
            addOutput(`touch: cannot create '${rest[0]}'`);
          }
          break;
        }

        case 'rm': {
          const force = rest.includes('-rf') || rest.includes('-r');
          const target = rest.filter((a) => !a.startsWith('-'))[0];
          if (!target) {
            addOutput('rm: missing operand');
            break;
          }
          const targetPath = normalizePath(cwd, target);
          if (!vfs.delete(targetPath)) {
            addOutput(`rm: cannot remove '${target}'${force ? '' : ': Is a directory? Use -rf'}`);
          }
          break;
        }

        case 'pwd': {
          addOutput(cwd);
          break;
        }

        case 'echo': {
          addOutput(rest.join(' '));
          break;
        }

        case 'clear': {
          setLines([]);
          break;
        }

        case 'neofetch': {
          NEOFETCH.split('\n').forEach((line) => addOutput(line));
          break;
        }

        case 'open': {
          const appName = rest[0];
          const validApps = ['terminal', 'editor', 'canvas', 'navigator', 'files', 'taskmanager'] as const;
          type ValidApp = typeof validApps[number];
          if (appName && validApps.includes(appName as ValidApp)) {
            spawnApp(appName as ValidApp);
            addOutput(`Opening ${appName}...`);
          } else {
            addOutput(`open: unknown application '${appName || ''}'`);
            addOutput('Available: ' + validApps.join(', '));
          }
          break;
        }

        case 'reboot': {
          addOutput('SYSTEM REBOOTING...');
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
      if (e.key === 'Enter') {
        executeCommand(input);
        setInput('');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length > 0) {
          const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
          setHistIdx(idx);
          setInput(history[idx]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx >= 0) {
          const idx = histIdx + 1;
          if (idx >= history.length) {
            setHistIdx(-1);
            setInput('');
          } else {
            setHistIdx(idx);
            setInput(history[idx]);
          }
        }
      }
    },
    [input, history, histIdx, executeCommand]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000000',
        color: '#FFFFFF',
        fontFamily: "'Courier New', 'Consolas', monospace",
        fontSize: 13,
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 8,
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              lineHeight: 1.4,
              color: line.type === 'input' ? '#FFFFFF' : '#FFFFFF',
              opacity: line.type === 'input' ? 1 : 0.9,
            }}
          >
            {line.text || '\u00A0'}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ whiteSpace: 'nowrap', marginRight: 8 }}>{cwd} $</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: "'Courier New', 'Consolas', monospace",
              fontSize: 13,
              outline: 'none',
              caretColor: '#FFFFFF',
            }}
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

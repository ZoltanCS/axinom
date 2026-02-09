import { useState, useEffect, useCallback } from 'react';
import { useKernel, type AppId } from '../kernel';

function SystemClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);
  const h = String(time.getHours()).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#94a3b8' }}>{h}:{m}</span>;
}

const MENU_APPS: Array<{ id: AppId; label: string; icon: string }> = [
  { id: 'terminal', label: 'Terminal', icon: '>_' },
  { id: 'editor', label: 'Editor', icon: '¶' },
  { id: 'canvas', label: 'Canvas', icon: '◩' },
  { id: 'navigator', label: 'Navigator', icon: '◎' },
  { id: 'files', label: 'Files', icon: '▣' },
  { id: 'taskmanager', label: 'Task Manager', icon: '▥' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export function AXI_Taskbar() {
  const { state, dispatch, spawnApp, focusWindow } = useKernel();
  const [showMenu, setShowMenu] = useState(false);

  const handleTaskClick = useCallback((pid: number) => {
    const win = state.windows.find((w) => w.pid === pid);
    if (!win) return;
    if (win.state === 'minimized') dispatch({ type: 'RESTORE_WINDOW', pid });
    else if (win.focused) dispatch({ type: 'MINIMIZE_WINDOW', pid });
    else focusWindow(pid);
  }, [state.windows, dispatch, focusWindow]);

  const handleAppLaunch = useCallback((appId: AppId) => { spawnApp(appId); setShowMenu(false); }, [spawnApp]);

  return (
    <>
      {showMenu && (
        <div style={{
          position: 'fixed', bottom: 56, left: 8,
          background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: 12, zIndex: 99999,
          minWidth: 220, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', padding: 6,
        }}>
          <div style={{ padding: '8px 14px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applications</div>
          {MENU_APPS.map(({ id, label, icon }) => (
            <div key={id} onClick={() => handleAppLaunch(id)}
              style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#e2e8f0', borderRadius: 8, transition: 'background 0.1s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; e.currentTarget.style.color = '#06b6d4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e2e8f0'; }}>
              <span style={{ width: 24, textAlign: 'center', fontSize: 15, opacity: 0.7 }}>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{
        height: 56, display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 99998, position: 'relative', padding: '0 8px', gap: 4,
        background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(148, 163, 184, 0.08)',
      }}>
        <button onClick={() => setShowMenu(!showMenu)} style={{
          height: 40, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: showMenu ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
          color: showMenu ? '#06b6d4' : '#94a3b8',
          fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.1em',
          transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 16 }}>◆</span> AXI
        </button>

        <div style={{ width: 1, height: 24, background: 'rgba(148, 163, 184, 0.1)', margin: '0 4px' }} />

        <div style={{ flex: 1, display: 'flex', overflow: 'auto', height: '100%', alignItems: 'center', gap: 2 }}>
          {state.windows.map((win) => (
            <button key={win.pid} onClick={() => handleTaskClick(win.pid)} style={{
              height: 36, padding: '0 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: win.focused ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
              color: win.focused ? '#06b6d4' : '#94a3b8',
              fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
              whiteSpace: 'nowrap', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
              display: 'flex', alignItems: 'center', transition: 'all 0.15s ease',
              opacity: win.state === 'minimized' ? 0.5 : 1,
              borderBottom: win.focused ? '2px solid #06b6d4' : '2px solid transparent',
            }}>{win.title}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(148, 163, 184, 0.1)', margin: '0 4px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#475569' }}>{state.processes.length} proc</span>
          <SystemClock />
        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useKernel, type AppId } from '../kernel';

function SystemClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const h = String(time.getHours()).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  const s = String(time.getSeconds()).padStart(2, '0');

  return (
    <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12 }}>
      {h}:{m}:{s}
    </span>
  );
}

const MENU_APPS: Array<{ id: AppId; label: string; icon: string }> = [
  { id: 'terminal', label: 'AXI_TERMINAL', icon: '>_' },
  { id: 'editor', label: 'AXI_EDITOR', icon: '¶' },
  { id: 'canvas', label: 'AXI_CANVAS', icon: '◩' },
  { id: 'navigator', label: 'AXI_NAVIGATOR', icon: '◎' },
  { id: 'files', label: 'AXI_FILES', icon: '▣' },
  { id: 'taskmanager', label: 'AXI_TASKMAN', icon: '▥' },
];

export function AXI_Taskbar() {
  const { state, dispatch, spawnApp, focusWindow } = useKernel();
  const [showMenu, setShowMenu] = useState(false);

  const handleTaskClick = useCallback(
    (pid: number) => {
      const win = state.windows.find((w) => w.pid === pid);
      if (!win) return;
      if (win.state === 'minimized') {
        dispatch({ type: 'RESTORE_WINDOW', pid });
      } else if (win.focused) {
        dispatch({ type: 'MINIMIZE_WINDOW', pid });
      } else {
        focusWindow(pid);
      }
    },
    [state.windows, dispatch, focusWindow]
  );

  const handleAppLaunch = useCallback(
    (appId: AppId) => {
      spawnApp(appId);
      setShowMenu(false);
    },
    [spawnApp]
  );

  return (
    <>
      {/* Start menu overlay */}
      {showMenu && (
        <div
          style={{
            position: 'fixed',
            bottom: 48,
            left: 0,
            background: '#000000',
            border: '3px solid #FFFFFF',
            boxShadow: '8px 8px 0px #FFFFFF',
            zIndex: 99999,
            minWidth: 220,
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              borderBottom: '3px solid #FFFFFF',
              fontFamily: "'Arial Black', sans-serif",
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
            }}
          >
            APPLICATIONS
          </div>
          {MENU_APPS.map(({ id, label, icon }) => (
            <div
              key={id}
              onClick={() => handleAppLaunch(id)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: "'Courier New', monospace",
                fontSize: 12,
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#FFFFFF';
              }}
            >
              <span style={{ fontWeight: 900, fontSize: 16, width: 24, textAlign: 'center' }}>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Taskbar */}
      <div
        style={{
          height: 48,
          background: '#000000',
          borderTop: '3px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          zIndex: 99998,
          position: 'relative',
        }}
      >
        {/* Start button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            height: '100%',
            padding: '0 16px',
            background: showMenu ? '#FFFFFF' : '#000000',
            color: showMenu ? '#000000' : '#FFFFFF',
            border: 'none',
            borderRight: '3px solid #FFFFFF',
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          ■ AXI
        </button>

        {/* Running tasks */}
        <div style={{ flex: 1, display: 'flex', overflow: 'auto', height: '100%' }}>
          {state.windows.map((win) => (
            <button
              key={win.pid}
              onClick={() => handleTaskClick(win.pid)}
              style={{
                height: '100%',
                padding: '0 16px',
                background: win.focused ? '#FFFFFF' : '#000000',
                color: win.focused ? '#000000' : '#FFFFFF',
                border: 'none',
                borderRight: '3px solid #FFFFFF',
                fontFamily: "'Courier New', monospace",
                fontSize: 11,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                opacity: win.state === 'minimized' ? 0.6 : 1,
              }}
            >
              {win.title}
            </button>
          ))}
        </div>

        {/* System tray */}
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            borderLeft: '3px solid #FFFFFF',
            gap: 16,
            color: '#FFFFFF',
          }}
        >
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, opacity: 0.7 }}>
            PID:{state.processes.length}
          </span>
          <SystemClock />
        </div>
      </div>
    </>
  );
}

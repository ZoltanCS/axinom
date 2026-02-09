import { useCallback, useMemo } from 'react';
import { useKernel, type AppId } from '../kernel';
import { AXI_Window } from '../windowing';
import { AXI_Taskbar } from './AXI_Taskbar';
import { AXI_Terminal } from '../apps/terminal/AXI_Terminal';
import { AXI_Editor } from '../apps/editor/AXI_Editor';
import { AXI_Canvas } from '../apps/canvas/AXI_Canvas';
import { AXI_Navigator } from '../apps/navigator/AXI_Navigator';

const DESKTOP_ICONS: Array<{ appId: AppId; label: string; icon: string }> = [
  { appId: 'terminal', label: 'TERMINAL', icon: '>_' },
  { appId: 'editor', label: 'EDITOR', icon: '¶' },
  { appId: 'canvas', label: 'CANVAS', icon: '◩' },
  { appId: 'navigator', label: 'NAVIGATOR', icon: '◎' },
];

function AppContent({ appId }: { appId: AppId }) {
  switch (appId) {
    case 'terminal':
      return <AXI_Terminal />;
    case 'editor':
      return <AXI_Editor />;
    case 'canvas':
      return <AXI_Canvas />;
    case 'navigator':
      return <AXI_Navigator />;
  }
}

export function AXI_Desktop() {
  const { state, spawnApp } = useKernel();

  const handleIconDoubleClick = useCallback(
    (appId: AppId) => {
      spawnApp(appId);
    },
    [spawnApp]
  );

  const sortedWindows = useMemo(
    () => [...state.windows].sort((a, b) => a.zIndex - b.zIndex),
    [state.windows]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000000',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Desktop area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Desktop icons */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 1,
          }}
        >
          {DESKTOP_ICONS.map(({ appId, label, icon }) => (
            <div
              key={appId}
              onDoubleClick={() => handleIconDoubleClick(appId)}
              style={{
                width: 80,
                height: 80,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                border: '3px solid transparent',
                padding: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '3px solid #FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '3px solid transparent';
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: '3px solid #FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Courier New', monospace",
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  marginBottom: 4,
                }}
              >
                {icon}
              </div>
              <div
                style={{
                  fontFamily: "'Arial Black', sans-serif",
                  fontWeight: 900,
                  fontSize: 8,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Windows */}
        {sortedWindows.map((win) => (
          <AXI_Window key={win.pid} window={win}>
            <AppContent appId={win.appId} />
          </AXI_Window>
        ))}
      </div>

      {/* Taskbar */}
      <AXI_Taskbar />
    </div>
  );
}

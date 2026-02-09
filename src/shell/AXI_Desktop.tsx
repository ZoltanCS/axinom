import { useCallback, useMemo, useState, useEffect } from 'react';
import { useKernel, type AppId } from '../kernel';
import { AXI_Window } from '../windowing';
import { AXI_Taskbar } from './AXI_Taskbar';
import { AXI_WidgetLayer } from './AXI_Widgets';
import { AXI_ContextMenu } from './AXI_ContextMenu';
import { AXI_Terminal } from '../apps/terminal/AXI_Terminal';
import { AXI_Editor } from '../apps/editor/AXI_Editor';
import { AXI_Canvas } from '../apps/canvas/AXI_Canvas';
import { AXI_Navigator } from '../apps/navigator/AXI_Navigator';
import { AXI_FileManager } from '../apps/files/AXI_FileManager';
import { AXI_TaskManager } from '../apps/taskmanager/AXI_TaskManager';
import { AXI_Settings } from '../apps/settings/AXI_Settings';

const WALLPAPERS: Record<string, string> = {
  default: 'radial-gradient(ellipse at 20% 50%, rgba(6, 182, 212, 0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 50%), linear-gradient(180deg, #020617 0%, #0f172a 100%)',
  ocean: 'radial-gradient(ellipse at 30% 70%, rgba(6, 182, 212, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(6, 182, 212, 0.08) 0%, transparent 50%), linear-gradient(180deg, #020617 0%, #0c4a6e 100%)',
  purple: 'radial-gradient(ellipse at 40% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 60% 60%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), linear-gradient(180deg, #020617 0%, #1e1b4b 100%)',
  emerald: 'radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), linear-gradient(180deg, #020617 0%, #022c22 100%)',
  rose: 'radial-gradient(ellipse at 30% 30%, rgba(244, 63, 94, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(245, 158, 11, 0.06) 0%, transparent 50%), linear-gradient(180deg, #020617 0%, #1c1917 100%)',
  mono: 'linear-gradient(180deg, #020617 0%, #020617 100%)',
};

const DESKTOP_ICONS: Array<{ appId: AppId; label: string; icon: string }> = [
  { appId: 'terminal', label: 'Terminal', icon: '>_' },
  { appId: 'editor', label: 'Editor', icon: '¶' },
  { appId: 'canvas', label: 'Canvas', icon: '◩' },
  { appId: 'navigator', label: 'Navigator', icon: '◎' },
  { appId: 'files', label: 'Files', icon: '▣' },
  { appId: 'taskmanager', label: 'Tasks', icon: '▥' },
  { appId: 'settings', label: 'Settings', icon: '⚙' },
];

function AppContent({ appId }: { appId: AppId }) {
  switch (appId) {
    case 'terminal': return <AXI_Terminal />;
    case 'editor': return <AXI_Editor />;
    case 'canvas': return <AXI_Canvas />;
    case 'navigator': return <AXI_Navigator />;
    case 'files': return <AXI_FileManager />;
    case 'taskmanager': return <AXI_TaskManager />;
    case 'settings': return <AXI_Settings />;
  }
}

export function AXI_Desktop() {
  const { state, spawnApp, eventBus } = useKernel();
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('AXINOM_WALLPAPER') || 'default');

  useEffect(() => {
    const unsub = eventBus.on('settings:wallpaper', (data) => {
      const d = data as { id: string };
      setWallpaper(d.id);
    });
    return unsub;
  }, [eventBus]);

  const handleIconDoubleClick = useCallback((appId: AppId) => { spawnApp(appId); }, [spawnApp]);

  const sortedWindows = useMemo(
    () => [...state.windows].sort((a, b) => a.zIndex - b.zIndex),
    [state.windows]
  );

  const handleDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      eventBus.emit('contextmenu:show', {
        x: e.clientX, y: e.clientY,
        items: [
          { label: 'Open Terminal', action: 'open-terminal' },
          { label: 'Open Files', action: 'open-files' },
          { label: 'Open Task Manager', action: 'open-taskmanager' },
          { label: 'Settings', action: 'open-settings' },
        ],
      });
    },
    [eventBus]
  );

  const bg = WALLPAPERS[wallpaper] || WALLPAPERS.default;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative' }} onContextMenu={handleDesktopContextMenu}>
        {/* Background */}
        <div className="axi-grid-pattern" style={{ position: 'absolute', inset: 0, background: bg, pointerEvents: 'none', zIndex: 0 }} />

        {/* Desktop icons */}
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 84px)', gap: 4, zIndex: 1 }}>
          {DESKTOP_ICONS.map(({ appId, label, icon }) => (
            <div key={appId} onDoubleClick={() => handleIconDoubleClick(appId)}
              style={{ width: 84, height: 84, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', borderRadius: 10, padding: 4, transition: 'background 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(148, 163, 184, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#94a3b8', marginBottom: 4, backdropFilter: 'blur(8px)' }}>{icon}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>{label}</div>
            </div>
          ))}
        </div>

        <AXI_WidgetLayer />

        {sortedWindows.map((win) => (
          <AXI_Window key={win.pid} window={win}>
            <AppContent appId={win.appId} />
          </AXI_Window>
        ))}
      </div>

      <AXI_Taskbar />
      <AXI_ContextMenu />
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useKernel } from '../kernel';

export interface ContextMenuItem {
  label: string;
  action: string;
  path?: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

export function AXI_ContextMenu() {
  const { eventBus, spawnApp, vfs } = useKernel();
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    const unsub = eventBus.on('contextmenu:show', (data) => setMenu(data as ContextMenuState));
    return unsub;
  }, [eventBus]);

  useEffect(() => {
    if (!menu) return;
    const handler = () => setMenu(null);
    const timer = setTimeout(() => { globalThis.addEventListener('mousedown', handler); }, 50);
    return () => { clearTimeout(timer); globalThis.removeEventListener('mousedown', handler); };
  }, [menu]);

  const handleAction = useCallback((item: ContextMenuItem) => {
    setMenu(null);
    switch (item.action) {
      case 'open-editor':
        spawnApp('editor');
        if (item.path) setTimeout(() => eventBus.emit('file:open', { path: item.path }), 100);
        break;
      case 'open-canvas': spawnApp('canvas'); break;
      case 'navigate':
        if (item.path) eventBus.emit('files:navigate', { path: item.path });
        break;
      case 'delete':
        if (item.path) vfs.delete(item.path);
        break;
      case 'export':
        if (item.path) {
          const content = vfs.read(item.path);
          if (content !== null) {
            const name = item.path.split('/').pop() || 'export.txt';
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = name; a.click();
            URL.revokeObjectURL(url);
          }
        }
        break;
      case 'open-terminal': spawnApp('terminal'); break;
      case 'open-files': spawnApp('files'); break;
      case 'open-taskmanager': spawnApp('taskmanager'); break;
      case 'open-settings': spawnApp('settings'); break;
    }
  }, [spawnApp, eventBus, vfs]);

  if (!menu) return null;

  const menuWidth = 200;
  const menuHeight = menu.items.length * 36 + 12;
  const x = Math.min(menu.x, window.innerWidth - menuWidth - 8);
  const y = Math.min(menu.y, window.innerHeight - menuHeight - 56);

  return (
    <div className="axi-ctx-open" onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed', left: x, top: y, zIndex: 100000, minWidth: menuWidth, padding: 4,
        background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}>
      {menu.items.map((item, i) => (
        <div key={i} onClick={() => handleAction(item)}
          style={{
            padding: '8px 14px', cursor: 'pointer', borderRadius: 6,
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 400, color: '#e2e8f0',
            transition: 'background 0.1s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; e.currentTarget.style.color = '#06b6d4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e2e8f0'; }}>
          {item.label}
        </div>
      ))}
    </div>
  );
}

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
    const unsub = eventBus.on('contextmenu:show', (data) => {
      const d = data as ContextMenuState;
      setMenu(d);
    });
    return unsub;
  }, [eventBus]);

  // Close on any click outside
  useEffect(() => {
    if (!menu) return;
    const handler = () => setMenu(null);
    // Delay to not immediately close
    const timer = setTimeout(() => {
      globalThis.addEventListener('mousedown', handler);
    }, 50);
    return () => {
      clearTimeout(timer);
      globalThis.removeEventListener('mousedown', handler);
    };
  }, [menu]);

  const handleAction = useCallback((item: ContextMenuItem) => {
    setMenu(null);
    switch (item.action) {
      case 'open-editor':
        spawnApp('editor');
        if (item.path) {
          setTimeout(() => eventBus.emit('file:open', { path: item.path }), 100);
        }
        break;
      case 'open-canvas':
        spawnApp('canvas');
        break;
      case 'navigate':
        if (item.path) {
          eventBus.emit('files:navigate', { path: item.path });
        }
        break;
      case 'delete':
        if (item.path) {
          vfs.delete(item.path);
        }
        break;
      case 'export':
        if (item.path) {
          const content = vfs.read(item.path);
          if (content !== null) {
            const name = item.path.split('/').pop() || 'export.txt';
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            a.click();
            URL.revokeObjectURL(url);
          }
        }
        break;
      case 'open-terminal':
        spawnApp('terminal');
        break;
      case 'open-files':
        spawnApp('files');
        break;
      case 'open-taskmanager':
        spawnApp('taskmanager');
        break;
    }
  }, [spawnApp, eventBus, vfs]);

  if (!menu) return null;

  // Clamp menu position to viewport
  const menuWidth = 200;
  const menuHeight = menu.items.length * 32 + 6;
  const x = Math.min(menu.x, window.innerWidth - menuWidth - 8);
  const y = Math.min(menu.y, window.innerHeight - menuHeight - 56);

  return (
    <div
      className="axi-ctx-open"
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        background: '#000000',
        border: '3px solid #FFFFFF',
        boxShadow: '8px 8px 0px #FFFFFF',
        zIndex: 100000,
        minWidth: menuWidth,
      }}
    >
      {menu.items.map((item, i) => (
        <div
          key={i}
          onClick={() => handleAction(item)}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            borderBottom: i < menu.items.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
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
          {item.label}
        </div>
      ))}
    </div>
  );
}

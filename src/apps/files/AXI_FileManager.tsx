import { useState, useCallback, useRef } from 'react';
import { useKernel, type AppId } from '../../kernel';
import type { VFSNodeType } from '../../vfs';

type ViewMode = 'grid' | 'list';

interface FileEntry {
  name: string;
  type: VFSNodeType;
  path: string;
}

function normalizePath(base: string, name: string): string {
  return base === '/' ? `/${name}` : `${base}/${name}`;
}

export function AXI_FileManager() {
  const { vfs, spawnApp, eventBus } = useKernel();
  const [cwd, setCwd] = useState('/home/user');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selected, setSelected] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getEntries = useCallback((): FileEntry[] => {
    const items = vfs.listDetailed(cwd);
    if (!items) return [];
    return items.map((item) => ({
      name: item.name,
      type: item.type,
      path: normalizePath(cwd, item.name),
    }));
  }, [cwd, vfs]);

  const entries = getEntries();

  const navigateTo = useCallback((path: string) => {
    if (vfs.isDirectory(path)) {
      setCwd(path);
      setSelected(null);
    }
  }, [vfs]);

  const goUp = useCallback(() => {
    const parts = cwd.split('/').filter(Boolean);
    if (parts.length > 0) {
      parts.pop();
      setCwd('/' + parts.join('/') || '/');
      setSelected(null);
    }
  }, [cwd]);

  const handleDoubleClick = useCallback((entry: FileEntry) => {
    if (entry.type === 'directory') {
      navigateTo(entry.path);
    } else {
      // Open With: .txt -> editor, .png -> canvas, else editor
      const ext = entry.name.split('.').pop()?.toLowerCase();
      if (ext === 'png' || ext === 'jpg' || ext === 'bmp') {
        spawnApp('canvas');
      } else {
        spawnApp('editor');
        // Signal editor to open this file
        setTimeout(() => eventBus.emit('file:open', { path: entry.path }), 100);
      }
    }
  }, [navigateTo, spawnApp, eventBus]);

  const handleDelete = useCallback(() => {
    if (selected) {
      vfs.delete(selected);
      setSelected(null);
    }
  }, [selected, vfs]);

  const handleNewFolder = useCallback(() => {
    const name = prompt('Folder name:');
    if (name) {
      vfs.mkdir(normalizePath(cwd, name));
    }
  }, [cwd, vfs]);

  const handleNewFile = useCallback(() => {
    const name = prompt('File name:');
    if (name) {
      vfs.write(normalizePath(cwd, name), '');
    }
  }, [cwd, vfs]);

  // Import from host filesystem
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        vfs.write(normalizePath(cwd, file.name), content);
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  }, [cwd, vfs]);

  // Export to host filesystem
  const handleExport = useCallback(() => {
    if (!selected || !vfs.isFile(selected)) return;
    const content = vfs.read(selected);
    if (content === null) return;
    const name = selected.split('/').pop() || 'export.txt';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, [selected, vfs]);

  // Drag and drop
  const handleDragStart = useCallback((path: string) => {
    setDragItem(path);
  }, []);

  const handleDrop = useCallback((targetDir: string) => {
    if (!dragItem) return;
    const fileName = dragItem.split('/').pop();
    if (!fileName) return;
    const content = vfs.read(dragItem);
    if (content !== null) {
      const newPath = normalizePath(targetDir, fileName);
      vfs.write(newPath, content);
      vfs.delete(dragItem);
    }
    setDragItem(null);
  }, [dragItem, vfs]);

  const handleContextMenu = useCallback((e: React.MouseEvent, entry: FileEntry) => {
    e.preventDefault();
    setSelected(entry.path);
    eventBus.emit('contextmenu:show', {
      x: e.clientX,
      y: e.clientY,
      items: [
        ...(entry.type === 'file'
          ? [
              { label: 'OPEN WITH EDITOR', action: 'open-editor', path: entry.path },
              { label: 'OPEN WITH CANVAS', action: 'open-canvas', path: entry.path },
              { label: 'EXPORT', action: 'export', path: entry.path },
            ]
          : [{ label: 'OPEN', action: 'navigate', path: entry.path }]),
        { label: 'DELETE', action: 'delete', path: entry.path },
      ],
    });
  }, [eventBus]);

  const menuBtnStyle: React.CSSProperties = {
    background: '#000000',
    color: '#FFFFFF',
    border: 'none',
    borderRight: '3px solid #FFFFFF',
    padding: '0 12px',
    height: '100%',
    fontFamily: "'Arial Black', sans-serif",
    fontWeight: 900,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    cursor: 'pointer',
  };

  const iconForType = (type: VFSNodeType): string => (type === 'directory' ? '▣' : '▤');

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#000000', color: '#FFFFFF' }}>
      <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileImport} />

      {/* Toolbar */}
      <div style={{ display: 'flex', borderBottom: '3px solid #FFFFFF', height: 32, flexShrink: 0 }}>
        <button style={menuBtnStyle} onClick={goUp}>▲ UP</button>
        <button style={menuBtnStyle} onClick={handleNewFolder}>+ FOLDER</button>
        <button style={menuBtnStyle} onClick={handleNewFile}>+ FILE</button>
        <button style={menuBtnStyle} onClick={handleImport}>↥ IMPORT</button>
        <button style={{ ...menuBtnStyle, opacity: selected && vfs.isFile(selected) ? 1 : 0.3 }} onClick={handleExport}>↧ EXPORT</button>
        <button style={{ ...menuBtnStyle, opacity: selected ? 1 : 0.3 }} onClick={handleDelete}>✕ DELETE</button>
        <div style={{ flex: 1 }} />
        <button
          style={{ ...menuBtnStyle, background: viewMode === 'grid' ? '#FFFFFF' : '#000000', color: viewMode === 'grid' ? '#000000' : '#FFFFFF' }}
          onClick={() => setViewMode('grid')}
        >
          ▦
        </button>
        <button
          style={{ ...menuBtnStyle, borderRight: 'none', background: viewMode === 'list' ? '#FFFFFF' : '#000000', color: viewMode === 'list' ? '#000000' : '#FFFFFF' }}
          onClick={() => setViewMode('list')}
        >
          ≡
        </button>
      </div>

      {/* Path bar */}
      <div
        style={{
          padding: '4px 8px',
          borderBottom: '3px solid #FFFFFF',
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          height: 28,
        }}
      >
        <span style={{ opacity: 0.6, fontSize: 10, marginRight: 8, fontFamily: "'Arial Black', sans-serif", letterSpacing: '0.2em' }}>PATH:</span>
        {cwd}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {viewMode === 'grid' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {entries.map((entry) => (
              <div
                key={entry.path}
                onClick={() => setSelected(entry.path)}
                onDoubleClick={() => handleDoubleClick(entry)}
                onContextMenu={(e) => handleContextMenu(e, entry)}
                draggable
                onDragStart={() => handleDragStart(entry.path)}
                onDragOver={(e) => entry.type === 'directory' ? e.preventDefault() : undefined}
                onDrop={() => entry.type === 'directory' ? handleDrop(entry.path) : undefined}
                style={{
                  width: 80,
                  height: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: selected === entry.path ? '3px solid #FFFFFF' : '3px solid transparent',
                  background: selected === entry.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: '3px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 900,
                    marginBottom: 4,
                  }}
                >
                  {iconForType(entry.type)}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    fontFamily: "'Courier New', monospace",
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 76,
                  }}
                >
                  {entry.name}
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <div style={{ padding: 16, opacity: 0.5, fontFamily: "'Courier New', monospace", fontSize: 12 }}>
                (empty directory)
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* List header */}
            <div
              style={{
                display: 'flex',
                borderBottom: '3px solid #FFFFFF',
                padding: '4px 8px',
                fontFamily: "'Arial Black', sans-serif",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: 32 }}>TYPE</span>
              <span style={{ flex: 1 }}>NAME</span>
            </div>
            {entries.map((entry) => (
              <div
                key={entry.path}
                onClick={() => setSelected(entry.path)}
                onDoubleClick={() => handleDoubleClick(entry)}
                onContextMenu={(e) => handleContextMenu(e, entry)}
                draggable
                onDragStart={() => handleDragStart(entry.path)}
                onDragOver={(e) => entry.type === 'directory' ? e.preventDefault() : undefined}
                onDrop={() => entry.type === 'directory' ? handleDrop(entry.path) : undefined}
                style={{
                  display: 'flex',
                  padding: '4px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  background: selected === entry.path ? '#FFFFFF' : 'transparent',
                  color: selected === entry.path ? '#000000' : '#FFFFFF',
                  cursor: 'pointer',
                  fontFamily: "'Courier New', monospace",
                  fontSize: 12,
                  userSelect: 'none',
                }}
              >
                <span style={{ width: 32, fontSize: 14 }}>{iconForType(entry.type)}</span>
                <span style={{ flex: 1 }}>{entry.name}{entry.type === 'directory' ? '/' : ''}</span>
              </div>
            ))}
            {entries.length === 0 && (
              <div style={{ padding: 16, opacity: 0.5, fontSize: 12 }}>(empty directory)</div>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        style={{
          height: 24,
          borderTop: '3px solid #FFFFFF',
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          fontFamily: "'Courier New', monospace",
          fontSize: 10,
          opacity: 0.7,
          flexShrink: 0,
        }}
      >
        {entries.length} items{selected ? ` | Selected: ${selected.split('/').pop()}` : ''}
      </div>
    </div>
  );
}

import { useState, useCallback, useRef } from 'react';
import { useKernel } from '../../kernel';
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
    return items.map((item) => ({ name: item.name, type: item.type, path: normalizePath(cwd, item.name) }));
  }, [cwd, vfs]);

  const entries = getEntries();

  const navigateTo = useCallback((path: string) => {
    if (vfs.isDirectory(path)) { setCwd(path); setSelected(null); }
  }, [vfs]);

  const goUp = useCallback(() => {
    const parts = cwd.split('/').filter(Boolean);
    if (parts.length > 0) { parts.pop(); setCwd('/' + parts.join('/') || '/'); setSelected(null); }
  }, [cwd]);

  const handleDoubleClick = useCallback((entry: FileEntry) => {
    if (entry.type === 'directory') { navigateTo(entry.path); }
    else {
      const ext = entry.name.split('.').pop()?.toLowerCase();
      if (ext === 'png' || ext === 'jpg' || ext === 'bmp') { spawnApp('canvas'); }
      else { spawnApp('editor'); setTimeout(() => eventBus.emit('file:open', { path: entry.path }), 100); }
    }
  }, [navigateTo, spawnApp, eventBus]);

  const handleDelete = useCallback(() => { if (selected) { vfs.delete(selected); setSelected(null); } }, [selected, vfs]);
  const handleNewFolder = useCallback(() => { const name = prompt('Folder name:'); if (name) vfs.mkdir(normalizePath(cwd, name)); }, [cwd, vfs]);
  const handleNewFile = useCallback(() => { const name = prompt('File name:'); if (name) vfs.write(normalizePath(cwd, name), ''); }, [cwd, vfs]);
  const handleImport = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => { vfs.write(normalizePath(cwd, file.name), reader.result as string); };
      reader.readAsText(file);
    });
    e.target.value = '';
  }, [cwd, vfs]);

  const handleExport = useCallback(() => {
    if (!selected || !vfs.isFile(selected)) return;
    const content = vfs.read(selected);
    if (content === null) return;
    const name = selected.split('/').pop() || 'export.txt';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }, [selected, vfs]);

  const handleDragStart = useCallback((path: string) => { setDragItem(path); }, []);
  const handleDrop = useCallback((targetDir: string) => {
    if (!dragItem) return;
    const fileName = dragItem.split('/').pop();
    if (!fileName) return;
    const content = vfs.read(dragItem);
    if (content !== null) { vfs.write(normalizePath(targetDir, fileName), content); vfs.delete(dragItem); }
    setDragItem(null);
  }, [dragItem, vfs]);

  const handleContextMenu = useCallback((e: React.MouseEvent, entry: FileEntry) => {
    e.preventDefault();
    setSelected(entry.path);
    eventBus.emit('contextmenu:show', {
      x: e.clientX, y: e.clientY,
      items: [
        ...(entry.type === 'file'
          ? [{ label: 'Open with Editor', action: 'open-editor', path: entry.path }, { label: 'Export', action: 'export', path: entry.path }]
          : [{ label: 'Open', action: 'navigate', path: entry.path }]),
        { label: 'Delete', action: 'delete', path: entry.path },
      ],
    });
  }, [eventBus]);

  const toolBtn: React.CSSProperties = {
    background: 'transparent', color: '#94a3b8', border: 'none', padding: '0 10px', height: '100%',
    fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11, cursor: 'pointer', transition: 'color 0.15s ease',
    borderRight: '1px solid rgba(148, 163, 184, 0.08)',
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0e1a', color: '#e2e8f0' }}>
      <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileImport} />
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', height: 34, flexShrink: 0, background: 'rgba(15, 23, 42, 0.5)' }}>
        <button style={toolBtn} onClick={goUp}>↑ Up</button>
        <button style={toolBtn} onClick={handleNewFolder}>+ Folder</button>
        <button style={toolBtn} onClick={handleNewFile}>+ File</button>
        <button style={toolBtn} onClick={handleImport}>↥ Import</button>
        <button style={{ ...toolBtn, opacity: selected && vfs.isFile(selected) ? 1 : 0.3 }} onClick={handleExport}>↧ Export</button>
        <button style={{ ...toolBtn, opacity: selected ? 1 : 0.3 }} onClick={handleDelete}>✕ Delete</button>
        <div style={{ flex: 1 }} />
        <button style={{ ...toolBtn, color: viewMode === 'grid' ? '#06b6d4' : '#64748b' }} onClick={() => setViewMode('grid')}>Grid</button>
        <button style={{ ...toolBtn, borderRight: 'none', color: viewMode === 'list' ? '#06b6d4' : '#64748b' }} onClick={() => setViewMode('list')}>List</button>
      </div>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, flexShrink: 0, display: 'flex', alignItems: 'center', height: 30, color: '#94a3b8' }}>
        <span style={{ fontSize: 10, marginRight: 8, color: '#64748b' }}>Path:</span>{cwd}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {viewMode === 'grid' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {entries.map((entry) => (
              <div key={entry.path} onClick={() => setSelected(entry.path)} onDoubleClick={() => handleDoubleClick(entry)}
                onContextMenu={(e) => handleContextMenu(e, entry)} draggable onDragStart={() => handleDragStart(entry.path)}
                onDragOver={(e) => entry.type === 'directory' ? e.preventDefault() : undefined}
                onDrop={() => entry.type === 'directory' ? handleDrop(entry.path) : undefined}
                style={{
                  width: 88, height: 88, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, border: selected === entry.path ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  background: selected === entry.path ? 'rgba(6, 182, 212, 0.08)' : 'transparent', cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s ease',
                }}>
                <div style={{ fontSize: 28, marginBottom: 4, opacity: 0.8 }}>{entry.type === 'directory' ? '📁' : '📄'}</div>
                <div style={{ fontSize: 10, fontFamily: "'Inter', sans-serif", textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80, color: '#94a3b8' }}>{entry.name}</div>
              </div>
            ))}
            {entries.length === 0 && <div style={{ padding: 16, opacity: 0.5, fontSize: 12 }}>Empty directory</div>}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', padding: '4px 8px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span style={{ width: 32 }}>Type</span><span style={{ flex: 1 }}>Name</span>
            </div>
            {entries.map((entry) => (
              <div key={entry.path} onClick={() => setSelected(entry.path)} onDoubleClick={() => handleDoubleClick(entry)}
                onContextMenu={(e) => handleContextMenu(e, entry)} draggable onDragStart={() => handleDragStart(entry.path)}
                onDragOver={(e) => entry.type === 'directory' ? e.preventDefault() : undefined}
                onDrop={() => entry.type === 'directory' ? handleDrop(entry.path) : undefined}
                style={{
                  display: 'flex', padding: '6px 8px', borderBottom: '1px solid rgba(148, 163, 184, 0.06)', borderRadius: 4,
                  background: selected === entry.path ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  color: selected === entry.path ? '#06b6d4' : '#e2e8f0', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 12, userSelect: 'none', transition: 'all 0.1s ease',
                }}>
                <span style={{ width: 32, fontSize: 14 }}>{entry.type === 'directory' ? '📁' : '📄'}</span>
                <span style={{ flex: 1 }}>{entry.name}{entry.type === 'directory' ? '/' : ''}</span>
              </div>
            ))}
            {entries.length === 0 && <div style={{ padding: 16, opacity: 0.5, fontSize: 12 }}>Empty directory</div>}
          </div>
        )}
      </div>
      <div style={{ height: 28, borderTop: '1px solid rgba(148, 163, 184, 0.1)', padding: '0 12px', display: 'flex', alignItems: 'center', fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#64748b', flexShrink: 0 }}>
        {entries.length} items{selected ? ` · ${selected.split('/').pop()}` : ''}
      </div>
    </div>
  );
}

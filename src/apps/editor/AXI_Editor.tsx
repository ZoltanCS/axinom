import { useState, useCallback, useRef, useEffect } from 'react';
import { useKernel } from '../../kernel';

interface EditorTab {
  id: string;
  path: string;
  name: string;
  content: string;
  modified: boolean;
}

export function AXI_Editor() {
  const { vfs } = useKernel();
  const [tabs, setTabs] = useState<EditorTab[]>([
    { id: 'untitled-1', path: '', name: 'untitled-1', content: '', modified: false },
  ]);
  const [activeTab, setActiveTab] = useState('untitled-1');
  const [showOpen, setShowOpen] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [dialogPath, setDialogPath] = useState('/home/user/documents/');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tabCounter = useRef(2);
  const currentTab = tabs.find((t) => t.id === activeTab);

  useEffect(() => { textareaRef.current?.focus(); }, [activeTab]);

  const updateTabContent = useCallback((content: string) => {
    setTabs((prev) => prev.map((t) => (t.id === activeTab ? { ...t, content, modified: true } : t)));
  }, [activeTab]);

  const newTab = useCallback(() => {
    const id = `untitled-${tabCounter.current++}`;
    setTabs((prev) => [...prev, { id, path: '', name: id, content: '', modified: false }]);
    setActiveTab(id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length === 0) {
        const newId = `untitled-${tabCounter.current++}`;
        return [{ id: newId, path: '', name: newId, content: '', modified: false }];
      }
      return filtered;
    });
    if (activeTab === id) {
      setTabs((prev) => { if (prev.length > 0) setActiveTab(prev[0].id); return prev; });
    }
  }, [activeTab]);

  const openFile = useCallback(() => {
    const path = dialogPath.trim();
    if (!path) return;
    const content = vfs.read(path);
    if (content === null) { alert('File not found: ' + path); return; }
    const name = path.split('/').pop() || path;
    const id = `file-${Date.now()}`;
    setTabs((prev) => [...prev, { id, path, name, content, modified: false }]);
    setActiveTab(id); setShowOpen(false); setDialogPath('/home/user/documents/');
  }, [dialogPath, vfs]);

  const saveFile = useCallback(() => {
    if (!currentTab) return;
    let path = currentTab.path;
    if (!path) { path = dialogPath.trim(); if (!path) return; }
    if (!vfs.write(path, currentTab.content)) { alert('Failed to save: ' + path); return; }
    const name = path.split('/').pop() || path;
    setTabs((prev) => prev.map((t) => (t.id === activeTab ? { ...t, path, name, modified: false } : t)));
    setShowSave(false); setDialogPath('/home/user/documents/');
  }, [currentTab, activeTab, dialogPath, vfs]);

  const handleSaveClick = useCallback(() => {
    if (currentTab?.path) {
      if (vfs.write(currentTab.path, currentTab.content)) {
        setTabs((prev) => prev.map((t) => (t.id === activeTab ? { ...t, modified: false } : t)));
      }
    } else { setShowSave(true); }
  }, [currentTab, activeTab, vfs]);

  const menuBtn: React.CSSProperties = {
    background: 'transparent', color: '#94a3b8', border: 'none', padding: '0 14px', height: '100%',
    fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 12, cursor: 'pointer',
    transition: 'color 0.15s ease', borderRight: '1px solid rgba(148, 163, 184, 0.08)',
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0e1a', color: '#e2e8f0' }}>
      {/* Menu bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', flexShrink: 0, height: 34, background: 'rgba(15, 23, 42, 0.5)' }}>
        <button onClick={newTab} style={menuBtn}>New</button>
        <button onClick={() => setShowOpen(true)} style={menuBtn}>Open</button>
        <button onClick={handleSaveClick} style={menuBtn}>Save</button>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', overflow: 'auto', flexShrink: 0, height: 32 }}>
        {tabs.map((tab) => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6,
              background: tab.id === activeTab ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              color: tab.id === activeTab ? '#06b6d4' : '#64748b',
              borderRight: '1px solid rgba(148, 163, 184, 0.06)', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: 12, whiteSpace: 'nowrap', userSelect: 'none',
              borderBottom: tab.id === activeTab ? '2px solid #06b6d4' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}>
            <span>{tab.modified ? '● ' : ''}{tab.name}</span>
            <span onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.5, marginLeft: 4 }}>×</span>
          </div>
        ))}
      </div>
      {/* Editor */}
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea ref={textareaRef} value={currentTab?.content || ''} onChange={(e) => updateTabContent(e.target.value)}
          style={{
            width: '100%', height: '100%', background: '#0a0e1a', color: '#e2e8f0', border: 'none',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: 12, resize: 'none',
            outline: 'none', lineHeight: 1.6, tabSize: 4, caretColor: '#06b6d4',
          }} spellCheck={false} />
      </div>
      {/* Open dialog */}
      {showOpen && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: 12, padding: 20, zIndex: 999, minWidth: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Open File</div>
          <input value={dialogPath} onChange={(e) => setDialogPath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && openFile()} className="axi-input"
            style={{ width: '100%', marginBottom: 16 }} placeholder="/path/to/file" autoFocus />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="axi-btn-primary" style={{ fontSize: 12, padding: '6px 16px' }} onClick={openFile}>Open</button>
            <button className="axi-btn" style={{ fontSize: 12, padding: '6px 16px' }} onClick={() => setShowOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/* Save dialog */}
      {showSave && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: 12, padding: 20, zIndex: 999, minWidth: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#e2e8f0' }}>Save As</div>
          <input value={dialogPath} onChange={(e) => setDialogPath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveFile()} className="axi-input"
            style={{ width: '100%', marginBottom: 16 }} placeholder="/path/to/file.txt" autoFocus />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="axi-btn-primary" style={{ fontSize: 12, padding: '6px 16px' }} onClick={saveFile}>Save</button>
            <button className="axi-btn" style={{ fontSize: 12, padding: '6px 16px' }} onClick={() => setShowSave(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

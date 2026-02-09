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
    {
      id: 'untitled-1',
      path: '',
      name: 'untitled-1',
      content: '',
      modified: false,
    },
  ]);
  const [activeTab, setActiveTab] = useState('untitled-1');
  const [showOpen, setShowOpen] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [dialogPath, setDialogPath] = useState('/home/user/documents/');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tabCounter = useRef(2);

  const currentTab = tabs.find((t) => t.id === activeTab);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeTab]);

  const updateTabContent = useCallback(
    (content: string) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab ? { ...t, content, modified: true } : t))
      );
    },
    [activeTab]
  );

  const newTab = useCallback(() => {
    const id = `untitled-${tabCounter.current++}`;
    setTabs((prev) => [...prev, { id, path: '', name: id, content: '', modified: false }]);
    setActiveTab(id);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const filtered = prev.filter((t) => t.id !== id);
        if (filtered.length === 0) {
          const newId = `untitled-${tabCounter.current++}`;
          return [{ id: newId, path: '', name: newId, content: '', modified: false }];
        }
        return filtered;
      });
      if (activeTab === id) {
        setTabs((prev) => {
          if (prev.length > 0) setActiveTab(prev[0].id);
          return prev;
        });
      }
    },
    [activeTab]
  );

  const openFile = useCallback(() => {
    const path = dialogPath.trim();
    if (!path) return;

    const content = vfs.read(path);
    if (content === null) {
      alert('File not found: ' + path);
      return;
    }

    const name = path.split('/').pop() || path;
    const id = `file-${Date.now()}`;
    setTabs((prev) => [...prev, { id, path, name, content, modified: false }]);
    setActiveTab(id);
    setShowOpen(false);
    setDialogPath('/home/user/documents/');
  }, [dialogPath, vfs]);

  const saveFile = useCallback(() => {
    if (!currentTab) return;

    let path = currentTab.path;
    if (!path) {
      path = dialogPath.trim();
      if (!path) return;
    }

    const success = vfs.write(path, currentTab.content);
    if (!success) {
      alert('Failed to save: ' + path);
      return;
    }

    const name = path.split('/').pop() || path;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTab ? { ...t, path, name, modified: false } : t))
    );
    setShowSave(false);
    setDialogPath('/home/user/documents/');
  }, [currentTab, activeTab, dialogPath, vfs]);

  const handleSaveClick = useCallback(() => {
    if (currentTab?.path) {
      const success = vfs.write(currentTab.path, currentTab.content);
      if (success) {
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTab ? { ...t, modified: false } : t))
        );
      }
    } else {
      setShowSave(true);
    }
  }, [currentTab, activeTab, vfs]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#000000',
        color: '#FFFFFF',
      }}
    >
      {/* Menu bar */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '3px solid #FFFFFF',
          flexShrink: 0,
          height: 32,
        }}
      >
        <button
          onClick={newTab}
          style={{
            background: '#000000',
            color: '#FFFFFF',
            border: 'none',
            borderRight: '3px solid #FFFFFF',
            padding: '0 16px',
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 900,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            cursor: 'pointer',
          }}
        >
          NEW
        </button>
        <button
          onClick={() => setShowOpen(true)}
          style={{
            background: '#000000',
            color: '#FFFFFF',
            border: 'none',
            borderRight: '3px solid #FFFFFF',
            padding: '0 16px',
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 900,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            cursor: 'pointer',
          }}
        >
          OPEN
        </button>
        <button
          onClick={handleSaveClick}
          style={{
            background: '#000000',
            color: '#FFFFFF',
            border: 'none',
            borderRight: '3px solid #FFFFFF',
            padding: '0 16px',
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 900,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            cursor: 'pointer',
          }}
        >
          SAVE
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '3px solid #FFFFFF',
          overflow: 'auto',
          flexShrink: 0,
          height: 28,
        }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              background: tab.id === activeTab ? '#FFFFFF' : '#000000',
              color: tab.id === activeTab ? '#000000' : '#FFFFFF',
              borderRight: '3px solid #FFFFFF',
              cursor: 'pointer',
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            <span>{tab.modified ? '* ' : ''}{tab.name}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              style={{
                marginLeft: 8,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              X
            </span>
          </div>
        ))}
      </div>

      {/* Editor area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={currentTab?.content || ''}
          onChange={(e) => updateTabContent(e.target.value)}
          style={{
            width: '100%',
            height: '100%',
            background: '#000000',
            color: '#FFFFFF',
            border: 'none',
            fontFamily: "'Courier New', 'Consolas', monospace",
            fontSize: 13,
            padding: 8,
            resize: 'none',
            outline: 'none',
            lineHeight: 1.5,
            tabSize: 4,
          }}
          spellCheck={false}
        />
      </div>

      {/* Open dialog */}
      {showOpen && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#000000',
            border: '3px solid #FFFFFF',
            padding: 16,
            zIndex: 999,
            boxShadow: '8px 8px 0px #FFFFFF',
            minWidth: 300,
          }}
        >
          <div
            style={{
              fontFamily: "'Arial Black', sans-serif",
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            OPEN FILE
          </div>
          <input
            value={dialogPath}
            onChange={(e) => setDialogPath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && openFile()}
            className="axi-input"
            style={{ width: '100%', marginBottom: 16 }}
            placeholder="/path/to/file"
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="axi-btn" style={{ fontSize: 10, padding: '4px 12px' }} onClick={openFile}>
              OPEN
            </button>
            <button
              className="axi-btn"
              style={{ fontSize: 10, padding: '4px 12px' }}
              onClick={() => setShowOpen(false)}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Save dialog */}
      {showSave && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#000000',
            border: '3px solid #FFFFFF',
            padding: 16,
            zIndex: 999,
            boxShadow: '8px 8px 0px #FFFFFF',
            minWidth: 300,
          }}
        >
          <div
            style={{
              fontFamily: "'Arial Black', sans-serif",
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            SAVE AS
          </div>
          <input
            value={dialogPath}
            onChange={(e) => setDialogPath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveFile()}
            className="axi-input"
            style={{ width: '100%', marginBottom: 16 }}
            placeholder="/path/to/file.txt"
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="axi-btn" style={{ fontSize: 10, padding: '4px 12px' }} onClick={saveFile}>
              SAVE
            </button>
            <button
              className="axi-btn"
              style={{ fontSize: 10, padding: '4px 12px' }}
              onClick={() => setShowSave(false)}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

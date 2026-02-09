import { useState, useCallback, useRef } from 'react';

export function AXI_Navigator() {
  const [url, setUrl] = useState('https://en.wikipedia.org');
  const [inputUrl, setInputUrl] = useState('https://en.wikipedia.org');
  const [history, setHistory] = useState<string[]>(['https://en.wikipedia.org']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = useCallback(
    (newUrl: string) => {
      let normalized = newUrl.trim();
      if (normalized && !normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = 'https://' + normalized;
      }
      setUrl(normalized);
      setInputUrl(normalized);
      setLoading(true);
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(normalized);
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setInputUrl(history[newIndex]);
      setLoading(true);
    }
  }, [historyIndex, history]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setInputUrl(history[newIndex]);
      setLoading(true);
    }
  }, [historyIndex, history]);

  const navBtn: React.CSSProperties = {
    background: 'transparent',
    color: '#94a3b8',
    border: 'none',
    padding: '0 10px',
    height: '100%',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s ease',
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0e1a' }}>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', height: 40, flexShrink: 0, background: 'rgba(15, 23, 42, 0.5)', padding: '0 8px', gap: 4 }}>
        <button onClick={goBack} style={{ ...navBtn, opacity: historyIndex > 0 ? 1 : 0.3 }} disabled={historyIndex === 0}>◀</button>
        <button onClick={goForward} style={{ ...navBtn, opacity: historyIndex < history.length - 1 ? 1 : 0.3 }} disabled={historyIndex >= history.length - 1}>▶</button>
        <button onClick={() => navigate(url)} style={navBtn}>↻</button>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', height: 28,
          background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: 8, overflow: 'hidden',
        }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: '0.15em', padding: '0 8px', color: '#06b6d4', whiteSpace: 'nowrap' }}>AXINOM</span>
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(inputUrl); }}
            style={{ flex: 1, background: 'transparent', color: '#e2e8f0', border: 'none', borderLeft: '1px solid rgba(148, 163, 184, 0.1)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: '0 8px', height: '100%', outline: 'none' }}
            spellCheck={false}
          />
        </div>
        {loading && <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#06b6d4', padding: '0 8px' }}>Loading...</span>}
      </div>
      <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
        <iframe ref={iframeRef} src={url} onLoad={() => setLoading(false)} sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          style={{ width: '100%', height: '100%', border: 'none' }} title="Navigator" />
      </div>
    </div>
  );
}

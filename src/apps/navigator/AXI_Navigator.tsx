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

  const navBtnStyle: React.CSSProperties = {
    background: '#000000',
    color: '#FFFFFF',
    border: 'none',
    borderRight: '3px solid #FFFFFF',
    padding: '0 12px',
    height: '100%',
    fontFamily: "'Arial Black', sans-serif",
    fontWeight: 900,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#000000',
      }}
    >
      {/* Navigation bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '3px solid #FFFFFF',
          height: 36,
          flexShrink: 0,
        }}
      >
        <button
          onClick={goBack}
          style={{
            ...navBtnStyle,
            opacity: historyIndex > 0 ? 1 : 0.3,
          }}
          disabled={historyIndex === 0}
        >
          ◀
        </button>
        <button
          onClick={goForward}
          style={{
            ...navBtnStyle,
            opacity: historyIndex < history.length - 1 ? 1 : 0.3,
          }}
          disabled={historyIndex >= history.length - 1}
        >
          ▶
        </button>
        <button
          onClick={() => navigate(url)}
          style={navBtnStyle}
        >
          ↻
        </button>

        {/* Address bar */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            borderRight: '3px solid #FFFFFF',
          }}
        >
          <span
            style={{
              fontFamily: "'Arial Black', sans-serif",
              fontWeight: 900,
              fontSize: 8,
              letterSpacing: '0.6em',
              textTransform: 'uppercase',
              padding: '0 8px',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            A X I N O M
          </span>
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(inputUrl);
            }}
            style={{
              flex: 1,
              background: '#000000',
              color: '#FFFFFF',
              border: 'none',
              borderLeft: '3px solid #FFFFFF',
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              padding: '0 8px',
              height: '100%',
              outline: 'none',
            }}
            spellCheck={false}
          />
        </div>

        {loading && (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              padding: '0 8px',
              color: '#FFFFFF',
            }}
          >
            ▓▓▓
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', background: '#FFFFFF' }}>
        <iframe
          ref={iframeRef}
          src={url}
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="AXI_NAVIGATOR"
        />
      </div>
    </div>
  );
}

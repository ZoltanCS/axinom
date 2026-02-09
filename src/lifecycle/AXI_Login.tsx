import { useState, useCallback } from 'react';

interface AXI_LoginProps {
  username: string;
  pattern: number[];
  onLogin: () => void;
}

const GRID_SIZE = 4;
const CELLS = GRID_SIZE * GRID_SIZE;

export function AXI_Login({ username, pattern, onLogin }: AXI_LoginProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const toggleCell = useCallback((idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const a = [...pattern].sort().join(',');
    const b = [...selected].sort().join(',');
    if (a === b) {
      onLogin();
    } else {
      setAttempts((prev) => prev + 1);
      setError(`AUTHENTICATION FAILED [ATTEMPT ${attempts + 1}]`);
      setSelected([]);
    }
  }, [pattern, selected, onLogin, attempts]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000000',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Courier New', 'Consolas', monospace",
      }}
    >
      {/* Logo */}
      <div
        className="axi-display"
        style={{ fontSize: 24, marginBottom: 8 }}
      >
        AXINOM
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.6em',
          textTransform: 'uppercase',
          marginBottom: 48,
          opacity: 0.7,
        }}
      >
        WEB DESKTOP ENVIRONMENT
      </div>

      {/* Login box */}
      <div
        style={{
          border: '3px solid #FFFFFF',
          padding: 32,
          boxShadow: '8px 8px 0px #FFFFFF',
          minWidth: 320,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8 }}>
            USER IDENTITY
          </div>
          <div
            className="axi-display"
            style={{ fontSize: 16 }}
          >
            {username}
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          ENTER BIOMETRIC PATTERN
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 48px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 48px)`,
            gap: 0,
            border: '3px solid #FFFFFF',
            width: 'fit-content',
            margin: '0 auto 16px auto',
          }}
        >
          {Array.from({ length: CELLS }).map((_, i) => (
            <div
              key={i}
              onClick={() => toggleCell(i)}
              style={{
                width: 48,
                height: 48,
                background: selected.includes(i) ? '#FFFFFF' : '#000000',
                border: '3px solid #FFFFFF',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {error && (
          <div
            style={{
              border: '3px solid #FFFFFF',
              padding: 8,
              textAlign: 'center',
              fontSize: 11,
              marginBottom: 16,
              letterSpacing: '0.2em',
            }}
          >
            {error}
          </div>
        )}

        <button
          className="axi-btn"
          style={{ width: '100%', fontSize: 11, padding: '8px 16px' }}
          onClick={handleSubmit}
        >
          AUTHENTICATE
        </button>
      </div>

      <div
        style={{
          marginTop: 32,
          fontSize: 10,
          opacity: 0.5,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
        }}
      >
        AXINOM SYSTEMS CORP. // ALL RIGHTS RESERVED
      </div>
    </div>
  );
}

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
    setSelected((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  }, []);

  const handleSubmit = useCallback(() => {
    if ([...pattern].sort().join(',') === [...selected].sort().join(',')) { onLogin(); }
    else { setAttempts((prev) => prev + 1); setError(`Authentication failed (attempt ${attempts + 1})`); setSelected([]); }
  }, [pattern, selected, onLogin, attempts]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#020617', color: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="axi-gradient-text" style={{ fontSize: 36, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.02em' }}>AXINOM</div>
      <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 48, color: '#475569' }}>Web Desktop Environment</div>

      <div style={{
        background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', textAlign: 'center',
      }}>
        {/* Avatar */}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, margin: '0 auto 12px' }}>
          {username[0].toUpperCase()}
        </div>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{username}</div>
        <div style={{ fontSize: 11, color: '#475569', marginBottom: 20 }}>Enter security pattern</div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 48px)`, gridTemplateRows: `repeat(${GRID_SIZE}, 48px)`, gap: 6, width: 'fit-content', margin: '0 auto 16px auto' }}>
          {Array.from({ length: CELLS }).map((_, i) => (
            <div key={i} onClick={() => toggleCell(i)} style={{
              width: 48, height: 48, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s ease',
              background: selected.includes(i) ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(15, 23, 42, 0.6)',
              border: selected.includes(i) ? '2px solid rgba(6, 182, 212, 0.5)' : '2px solid rgba(148, 163, 184, 0.1)',
              boxShadow: selected.includes(i) ? '0 0 12px rgba(6, 182, 212, 0.2)' : 'none',
            }} />
          ))}
        </div>

        {error && <div style={{ fontSize: 12, color: '#f43f5e', marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(244, 63, 94, 0.1)' }}>{error}</div>}

        <button className="axi-btn-primary" style={{ width: '100%', padding: '10px 16px' }} onClick={handleSubmit}>Authenticate</button>
      </div>

      <div style={{ marginTop: 32, fontSize: 10, color: '#334155', letterSpacing: '0.2em' }}>AXINOM SYSTEMS CORP.</div>
    </div>
  );
}

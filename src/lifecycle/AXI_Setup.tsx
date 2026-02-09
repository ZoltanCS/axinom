import { useState, useCallback } from 'react';

interface AXI_SetupProps {
  onComplete: (username: string, pattern: number[]) => void;
}

const LANGUAGES = ['English', 'Deutsch', 'Français', 'Español', '日本語'];
const GRID_SIZE = 4;
const CELLS = GRID_SIZE * GRID_SIZE;

export function AXI_Setup({ onComplete }: AXI_SetupProps) {
  const [step, setStep] = useState<'language' | 'username' | 'pattern' | 'confirm'>('language');
  const [selectedLang, setSelectedLang] = useState(0);
  const [username, setUsername] = useState('');
  const [pattern, setPattern] = useState<number[]>([]);
  const [confirmPattern, setConfirmPattern] = useState<number[]>([]);
  const [error, setError] = useState('');

  const handleLangSelect = useCallback(() => { setStep('username'); }, []);
  const handleUsernameSubmit = useCallback(() => {
    if (username.trim().length < 2) { setError('Username must be at least 2 characters'); return; }
    setError(''); setStep('pattern');
  }, [username]);

  const toggleCell = useCallback((idx: number) => {
    if (step === 'pattern') setPattern((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
    else if (step === 'confirm') setConfirmPattern((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  }, [step]);

  const handlePatternSubmit = useCallback(() => {
    if (pattern.length < 3) { setError('Select at least 3 cells'); return; }
    setError(''); setStep('confirm');
  }, [pattern]);

  const handleConfirm = useCallback(() => {
    if ([...pattern].sort().join(',') !== [...confirmPattern].sort().join(',')) {
      setError('Patterns do not match'); setConfirmPattern([]); return;
    }
    setError(''); onComplete(username.trim(), pattern);
  }, [pattern, confirmPattern, username, onComplete]);

  const renderGrid = (selected: number[], clickable: boolean) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 48px)`, gridTemplateRows: `repeat(${GRID_SIZE}, 48px)`, gap: 6, width: 'fit-content' }}>
      {Array.from({ length: CELLS }).map((_, i) => (
        <div key={i} onClick={() => clickable && toggleCell(i)} style={{
          width: 48, height: 48, borderRadius: 8, cursor: clickable ? 'pointer' : 'default', transition: 'all 0.15s ease',
          background: selected.includes(i) ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(15, 23, 42, 0.6)',
          border: selected.includes(i) ? '2px solid rgba(6, 182, 212, 0.5)' : '2px solid rgba(148, 163, 184, 0.1)',
          boxShadow: selected.includes(i) ? '0 0 12px rgba(6, 182, 212, 0.2)' : 'none',
        }} />
      ))}
    </div>
  );

  const stepNames = { language: 'Language', username: 'Create User', pattern: 'Security Pattern', confirm: 'Confirm Pattern' };
  const stepNum = { language: 1, username: 2, pattern: 3, confirm: 4 };

  return (
    <div style={{ width: '100%', height: '100%', background: '#020617', color: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: 16, padding: 32, minWidth: 400, maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <div className="axi-gradient-text" style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, textAlign: 'center' }}>AXINOM Setup</div>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginBottom: 24 }}>Step {stepNum[step]} of 4 · {stepNames[step]}</div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1,2,3,4].map(n => (
            <div key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: n <= stepNum[step] ? '#06b6d4' : 'rgba(148, 163, 184, 0.2)', transition: 'background 0.3s ease' }} />
          ))}
        </div>

        {step === 'language' && (
          <div>
            {LANGUAGES.map((lang, i) => (
              <div key={lang} onClick={() => setSelectedLang(i)} style={{
                padding: '10px 16px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', transition: 'all 0.15s ease',
                background: selectedLang === i ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: selectedLang === i ? '#06b6d4' : '#94a3b8',
                border: selectedLang === i ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                fontWeight: 500, fontSize: 14,
              }}>{lang}</div>
            ))}
            <button className="axi-btn-primary" style={{ width: '100%', marginTop: 16, padding: '10px 16px' }} onClick={handleLangSelect}>Continue</button>
          </div>
        )}

        {step === 'username' && (
          <div>
            <div style={{ marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>Enter username:</div>
            <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
              className="axi-input" style={{ width: '100%', marginBottom: 16 }} autoFocus maxLength={20} />
            {error && <div style={{ fontSize: 12, color: '#f43f5e', marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(244, 63, 94, 0.1)' }}>{error}</div>}
            <button className="axi-btn-primary" style={{ width: '100%', padding: '10px 16px' }} onClick={handleUsernameSubmit}>Continue</button>
          </div>
        )}

        {step === 'pattern' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: 16, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>Select your security pattern<br /><span style={{ fontSize: 11, color: '#475569' }}>(tap at least 3 cells)</span></div>
            {renderGrid(pattern, true)}
            {error && <div style={{ fontSize: 12, color: '#f43f5e', marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(244, 63, 94, 0.1)', width: '100%', textAlign: 'center' }}>{error}</div>}
            <button className="axi-btn-primary" style={{ width: '100%', marginTop: 16, padding: '10px 16px' }} onClick={handlePatternSubmit}>Set Pattern</button>
          </div>
        )}

        {step === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: 16, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>Confirm your pattern</div>
            {renderGrid(confirmPattern, true)}
            {error && <div style={{ fontSize: 12, color: '#f43f5e', marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(244, 63, 94, 0.1)', width: '100%', textAlign: 'center' }}>{error}</div>}
            <button className="axi-btn-primary" style={{ width: '100%', marginTop: 16, padding: '10px 16px' }} onClick={handleConfirm}>Confirm</button>
          </div>
        )}
      </div>
    </div>
  );
}

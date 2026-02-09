import { useState, useCallback } from 'react';

interface AXI_SetupProps {
  onComplete: (username: string, pattern: number[]) => void;
}

const LANGUAGES = ['ENGLISH', 'DEUTSCH', 'FRANCAIS', 'ESPANOL', 'NIHONGO'];
const GRID_SIZE = 4;
const CELLS = GRID_SIZE * GRID_SIZE;

export function AXI_Setup({ onComplete }: AXI_SetupProps) {
  const [step, setStep] = useState<'language' | 'username' | 'pattern' | 'confirm'>('language');
  const [selectedLang, setSelectedLang] = useState(0);
  const [username, setUsername] = useState('');
  const [pattern, setPattern] = useState<number[]>([]);
  const [confirmPattern, setConfirmPattern] = useState<number[]>([]);
  const [error, setError] = useState('');

  const handleLangSelect = useCallback(() => {
    setStep('username');
  }, []);

  const handleUsernameSubmit = useCallback(() => {
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    setError('');
    setStep('pattern');
  }, [username]);

  const toggleCell = useCallback(
    (idx: number) => {
      if (step === 'pattern') {
        setPattern((prev) =>
          prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
      } else if (step === 'confirm') {
        setConfirmPattern((prev) =>
          prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
      }
    },
    [step]
  );

  const handlePatternSubmit = useCallback(() => {
    if (pattern.length < 3) {
      setError('Select at least 3 cells');
      return;
    }
    setError('');
    setStep('confirm');
  }, [pattern]);

  const handleConfirm = useCallback(() => {
    const a = [...pattern].sort().join(',');
    const b = [...confirmPattern].sort().join(',');
    if (a !== b) {
      setError('Patterns do not match. Try again.');
      setConfirmPattern([]);
      return;
    }
    setError('');
    onComplete(username.trim(), pattern);
  }, [pattern, confirmPattern, username, onComplete]);

  const renderGrid = (selected: number[], clickable: boolean) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 48px)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 48px)`,
        gap: 0,
        border: '3px solid #FFFFFF',
        width: 'fit-content',
      }}
    >
      {Array.from({ length: CELLS }).map((_, i) => (
        <div
          key={i}
          onClick={() => clickable && toggleCell(i)}
          style={{
            width: 48,
            height: 48,
            background: selected.includes(i) ? '#FFFFFF' : '#000000',
            border: '3px solid #FFFFFF',
            cursor: clickable ? 'pointer' : 'default',
          }}
        />
      ))}
    </div>
  );

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
      <div
        style={{
          border: '3px solid #FFFFFF',
          padding: 32,
          boxShadow: '8px 8px 0px #FFFFFF',
          minWidth: 400,
          maxWidth: 500,
        }}
      >
        <div
          className="axi-display"
          style={{ fontSize: 16, marginBottom: 8, textAlign: 'center' }}
        >
          AXINOM SETUP
        </div>
        <div
          style={{
            borderBottom: '3px solid #FFFFFF',
            marginBottom: 24,
            paddingBottom: 8,
            textAlign: 'center',
            fontSize: 11,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          {step === 'language' && 'STEP 1: SELECT LANGUAGE'}
          {step === 'username' && 'STEP 2: CREATE USER'}
          {step === 'pattern' && 'STEP 3: BIOMETRIC PATTERN'}
          {step === 'confirm' && 'STEP 4: CONFIRM PATTERN'}
        </div>

        {step === 'language' && (
          <div>
            {LANGUAGES.map((lang, i) => (
              <div
                key={lang}
                onClick={() => setSelectedLang(i)}
                style={{
                  padding: '8px 16px',
                  background: selectedLang === i ? '#FFFFFF' : '#000000',
                  color: selectedLang === i ? '#000000' : '#FFFFFF',
                  border: '3px solid #FFFFFF',
                  marginBottom: -3,
                  cursor: 'pointer',
                  fontFamily: "'Arial Black', sans-serif",
                  fontWeight: 900,
                  fontSize: 12,
                  letterSpacing: '0.3em',
                }}
              >
                {lang}
              </div>
            ))}
            <button
              className="axi-btn"
              style={{ width: '100%', marginTop: 16, fontSize: 11, padding: '8px 16px' }}
              onClick={handleLangSelect}
            >
              CONTINUE
            </button>
          </div>
        )}

        {step === 'username' && (
          <div>
            <div style={{ marginBottom: 8, fontSize: 12 }}>ENTER USERNAME:</div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
              className="axi-input"
              style={{ width: '100%', marginBottom: 16 }}
              autoFocus
              maxLength={20}
            />
            {error && (
              <div style={{ color: '#FFFFFF', fontSize: 11, marginBottom: 8, border: '3px solid #FFFFFF', padding: 8 }}>
                ERROR: {error}
              </div>
            )}
            <button
              className="axi-btn"
              style={{ width: '100%', fontSize: 11, padding: '8px 16px' }}
              onClick={handleUsernameSubmit}
            >
              CONTINUE
            </button>
          </div>
        )}

        {step === 'pattern' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: 16, fontSize: 12, textAlign: 'center' }}>
              SELECT YOUR BIOMETRIC PATTERN
              <br />
              (click at least 3 cells)
            </div>
            {renderGrid(pattern, true)}
            {error && (
              <div style={{ color: '#FFFFFF', fontSize: 11, marginTop: 8, border: '3px solid #FFFFFF', padding: 8, width: '100%' }}>
                ERROR: {error}
              </div>
            )}
            <button
              className="axi-btn"
              style={{ width: '100%', marginTop: 16, fontSize: 11, padding: '8px 16px' }}
              onClick={handlePatternSubmit}
            >
              SET PATTERN
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: 16, fontSize: 12, textAlign: 'center' }}>
              CONFIRM YOUR PATTERN
            </div>
            {renderGrid(confirmPattern, true)}
            {error && (
              <div style={{ color: '#FFFFFF', fontSize: 11, marginTop: 8, border: '3px solid #FFFFFF', padding: 8, width: '100%' }}>
                ERROR: {error}
              </div>
            )}
            <button
              className="axi-btn"
              style={{ width: '100%', marginTop: 16, fontSize: 11, padding: '8px 16px' }}
              onClick={handleConfirm}
            >
              CONFIRM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

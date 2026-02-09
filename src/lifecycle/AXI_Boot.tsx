import { useState, useEffect, useCallback } from 'react';

const POST_MESSAGES = [
  'AXINOM BIOS v1.0.0',
  'Copyright (C) AXINOM Systems Corp.',
  '',
  'POST: Initializing hardware...',
  'CPU: AXI-CORE Processor @ 4.0GHz',
  'RAM: 16384MB OK',
  'GPU: AXI-RENDER 1-BIT ENGINE',
  'VFS: Virtual File System... DETECTED',
  '',
  'POST: Running diagnostics...',
  '[████████████████████████████████] 100%',
  '',
  'DISK 0: AXINOM_SYS     ... OK',
  'DISK 1: AXINOM_USER    ... OK',
  'NET:    AXI-NET ADAPTER ... OK',
  'AUDIO:  AXI-SOUND       ... DISABLED',
  '',
  'Verifying system integrity...',
  '[████████████████████████████████] 100%',
  '',
  'All systems nominal.',
  'Loading AXINOM kernel...',
  '',
  '[██████████░░░░░░░░░░░░░░░░░░░░░░] 33%',
  '[████████████████████░░░░░░░░░░░░] 66%',
  '[████████████████████████████████] 100%',
  '',
  'AXINOM WDE v1.0.0 READY',
  'Transferring control to login manager...',
];

interface AXI_BootProps {
  onComplete: () => void;
}

export function AXI_Boot({ onComplete }: AXI_BootProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < POST_MESSAGES.length) {
        setLines((prev) => [...prev, POST_MESSAGES[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setDone(true);
      }
    }, 60);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (done) {
      const timer = setTimeout(handleContinue, 800);
      return () => clearTimeout(timer);
    }
  }, [done, handleContinue]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000000',
        color: '#FFFFFF',
        fontFamily: "'Courier New', 'Consolas', monospace",
        fontSize: 13,
        padding: 32,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ whiteSpace: 'pre', lineHeight: 1.5 }}>
          {line || '\u00A0'}
        </div>
      ))}
      {!done && (
        <span className="axi-cursor-blink" style={{ display: 'inline-block', width: 8, height: 16, background: '#FFFFFF', marginTop: 4 }} />
      )}
    </div>
  );
}

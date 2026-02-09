import { useState, useEffect, useCallback } from 'react';

// 1-bit pixel art logo - each row is a string of 0s and 1s
const LOGO_PIXELS = [
  '0000011111100000',
  '0001100000011000',
  '0010000000000100',
  '0100001111000010',
  '1000010000100001',
  '1000100000010001',
  '1001000000001001',
  '1001000000001001',
  '1001111111111001',
  '1001000000001001',
  '1001000000001001',
  '0100100000010010',
  '0010010000100100',
  '0001001111001000',
  '0000100000010000',
  '0000011111100000',
];

const POST_MESSAGES = [
  'AXINOM BIOS v2.0.0',
  'Copyright (C) AXINOM Systems Corp.',
  '',
  'POST: Initializing hardware...',
  'CPU: AXI-CORE Processor @ 4.0GHz [8 CORES]',
  'RAM: 32768MB DDR5 OK',
  'GPU: AXI-RENDER 1-BIT ENGINE v2',
  'VFS: Virtual File System... DETECTED',
  'NET: AXI-NET ADAPTER... READY',
  '',
  'POST: Running diagnostics...',
  '[████████████████████████████████] 100%',
  '',
  'DISK 0: AXINOM_SYS     ... OK',
  'DISK 1: AXINOM_USER    ... OK',
  'DISK 2: AXINOM_SWAP    ... OK',
  '',
  'Loading kernel modules...',
  '  AXI-WIN    Window Manager       ... OK',
  '  AXI-VFS    File System          ... OK',
  '  AXI-PROC   Process Manager      ... OK',
  '  AXI-EVT    Event Bus            ... OK',
  '  AXI-WDG    Widget Engine        ... OK',
  '  AXI-CTX    Context Handler      ... OK',
  '',
  'Verifying integrity...',
  '[████████████████████████████████] 100%',
  '',
  'All systems nominal.',
  'Transferring control to login manager...',
];

interface AXI_BootProps {
  onComplete: () => void;
}

export function AXI_Boot({ onComplete }: AXI_BootProps) {
  const [phase, setPhase] = useState<'logo' | 'post'>('logo');
  const [logoRows, setLogoRows] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  // Phase 1: Logo assembly animation
  useEffect(() => {
    if (phase !== 'logo') return;
    let row = 0;
    const interval = setInterval(() => {
      if (row < LOGO_PIXELS.length) {
        row++;
        setLogoRows(row);
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase('post'), 600);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  // Phase 2: POST messages
  useEffect(() => {
    if (phase !== 'post') return;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < POST_MESSAGES.length) {
        setLines((prev) => [...prev, POST_MESSAGES[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setDone(true);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [phase]);

  const handleContinue = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (done) {
      const timer = setTimeout(handleContinue, 600);
      return () => clearTimeout(timer);
    }
  }, [done, handleContinue]);

  if (phase === 'logo') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pixel art logo assembling row by row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {LOGO_PIXELS.slice(0, logoRows).map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 0 }}>
              {row.split('').map((pixel, ci) => (
                <div
                  key={ci}
                  style={{
                    width: 8,
                    height: 8,
                    background: pixel === '1' ? '#FFFFFF' : 'transparent',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {logoRows >= LOGO_PIXELS.length && (
          <div
            className="axi-display"
            style={{
              marginTop: 24,
              fontSize: 18,
              color: '#FFFFFF',
            }}
          >
            AXINOM
          </div>
        )}

        <div
          style={{
            marginTop: 16,
            fontSize: 9,
            fontFamily: "'Courier New', monospace",
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            opacity: 0.5,
          }}
        >
          BOOTING SYSTEM...
        </div>
      </div>
    );
  }

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

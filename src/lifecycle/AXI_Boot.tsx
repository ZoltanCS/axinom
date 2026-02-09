import { useState, useEffect, useCallback } from 'react';

const POST_MESSAGES = [
  'AXINOM BIOS v2.0.0',
  'Copyright (C) Axinom Systems Corp.',
  '',
  'POST: Initializing hardware...',
  'CPU: AXI-CORE Processor @ 4.0GHz [8 CORES]',
  'RAM: 8192MB DDR5 OK',
  'GPU: AXI-RENDER GLASS ENGINE v2',
  'VFS: Virtual File System... DETECTED',
  'NET: AXI-NET ADAPTER... READY',
  '',
  'Running diagnostics...',
  '[############################] 100%',
  '',
  'DISK 0: AXINOM_SYS     ... OK',
  'DISK 1: AXINOM_USER    ... OK',
  '',
  'Loading kernel modules...',
  '  AXI-WIN    Window Manager       ... OK',
  '  AXI-VFS    File System          ... OK',
  '  AXI-PROC   Process Manager      ... OK',
  '  AXI-EVT    Event Bus            ... OK',
  '  AXI-SNAP   Snap Assist          ... OK',
  '  AXI-RES    Resource Allocator   ... OK',
  '  AXI-THEME  Theme Engine         ... OK',
  '',
  'All systems nominal.',
  'Transferring control to login manager...',
];

interface AXI_BootProps {
  onComplete: () => void;
}

export function AXI_Boot({ onComplete }: AXI_BootProps) {
  const [phase, setPhase] = useState<'logo' | 'post'>('logo');
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (phase !== 'logo') return;
    const t1 = setTimeout(() => setLogoOpacity(1), 100);
    const t2 = setTimeout(() => setPhase('post'), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'post') return;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < POST_MESSAGES.length) {
        setLines((prev) => [...prev, POST_MESSAGES[idx]]);
        idx++;
      } else { clearInterval(interval); setDone(true); }
    }, 45);
    return () => clearInterval(interval);
  }, [phase]);

  const handleContinue = useCallback(() => { onComplete(); }, [onComplete]);

  useEffect(() => {
    if (done) { const timer = setTimeout(handleContinue, 500); return () => clearTimeout(timer); }
  }, [done, handleContinue]);

  if (phase === 'logo') {
    return (
      <div style={{ width: '100%', height: '100%', background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.5s ease' }}>
        <div style={{ opacity: logoOpacity, transition: 'opacity 1s ease', textAlign: 'center' }}>
          <div className="axi-logo-glow" style={{ marginBottom: 16 }}>
            <div className="axi-gradient-text" style={{ fontSize: 48, fontWeight: 900, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>AXINOM</div>
          </div>
          <div style={{ fontSize: 12, color: '#475569', fontFamily: "'Inter', sans-serif", fontWeight: 400, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Web Desktop Environment</div>
          <div style={{ marginTop: 32, width: 200, height: 2, borderRadius: 1, background: 'rgba(148, 163, 184, 0.1)', margin: '32px auto 0', overflow: 'hidden' }}>
            <div className="axi-shimmer" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#020617', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: 32, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {lines.map((line, i) => (
        <div key={i} style={{ whiteSpace: 'pre', lineHeight: 1.6, color: line.startsWith('  AXI-') ? '#06b6d4' : line.includes('OK') ? '#10b981' : '#64748b' }}>
          {line || '\u00A0'}
        </div>
      ))}
      {!done && <span className="axi-cursor-blink" style={{ display: 'inline-block', width: 8, height: 16, background: '#06b6d4', marginTop: 4, borderRadius: 1 }} />}
    </div>
  );
}

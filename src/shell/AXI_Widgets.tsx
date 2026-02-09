import { useState, useEffect, useRef, useCallback } from 'react';
import { useKernel } from '../kernel';
import { SYSTEM_LIMITS } from '../styles/theme';

function CpuWidget() {
  const { state } = useKernel();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);
  const procCount = useRef(state.processes.length);
  const cpuBase = useRef(0);

  useEffect(() => {
    procCount.current = state.processes.length;
    cpuBase.current = state.processes.reduce((s, p) => s + p.cpuBase, 0);
  }, [state.processes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const interval = setInterval(() => {
      const val = Math.min(100, cpuBase.current + Math.random() * 10 + Math.sin(Date.now() / 800) * 5);
      dataRef.current.push(val);
      if (dataRef.current.length > 30) dataRef.current.shift();

      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) { const y = (h / 4) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const data = dataRef.current;
      if (data.length < 2) return;
      const step = w / 29;

      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0.2)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, h);
      data.forEach((v, i) => ctx.lineTo(i * step, h - (v / 100) * h));
      ctx.lineTo((data.length - 1) * step, h);
      ctx.fill();

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      data.forEach((v, i) => { const x = i * step, y = h - (v / 100) * h; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.stroke();
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const current = dataRef.current.length > 0 ? dataRef.current[dataRef.current.length - 1] : 0;

  return (
    <div style={{ width: 160, borderRadius: 12, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148, 163, 184, 0.08)', overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CPU</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#06b6d4' }}>{current.toFixed(0)}%</span>
      </div>
      <canvas ref={canvasRef} width={158} height={60} style={{ display: 'block' }} />
    </div>
  );
}

function RamWidget() {
  const { state } = useKernel();
  const used = state.processes.reduce((s, p) => s + p.ramMB, 0);
  const pct = Math.min(100, (used / SYSTEM_LIMITS.totalRAM) * 100);

  return (
    <div style={{ width: 160, borderRadius: 12, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148, 163, 184, 0.08)', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RAM</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#3b82f6' }}>{used}MB</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(148, 163, 184, 0.1)' }}>
        <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', width: `${pct}%`, transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#475569', marginTop: 4, textAlign: 'right' }}>{pct.toFixed(0)}% of {SYSTEM_LIMITS.totalRAM}MB</div>
    </div>
  );
}

function ClockWidget() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  const h = String(time.getHours()).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  const s = String(time.getSeconds()).padStart(2, '0');
  const totalCells = 24;
  const filledCells = Math.floor((time.getSeconds() / 60) * totalCells);

  return (
    <div style={{ width: 160, borderRadius: 12, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148, 163, 184, 0.08)', padding: 12, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.05em' }}>{h}:{m}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#475569', marginBottom: 6 }}>:{s}</div>
      <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {Array.from({ length: totalCells }).map((_, i) => (
          <div key={i} style={{ width: 3, height: 3, borderRadius: 1, background: i < filledCells ? '#06b6d4' : 'rgba(148, 163, 184, 0.15)', transition: 'background 0.2s ease' }} />
        ))}
      </div>
    </div>
  );
}

export function AXI_WidgetLayer() {
  const [visible, setVisible] = useState(true);
  const toggleWidgets = useCallback(() => setVisible((v) => !v), []);

  if (!visible) {
    return (
      <button onClick={toggleWidgets} style={{
        position: 'absolute', bottom: 12, right: 12, borderRadius: 8,
        background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
        color: '#64748b', border: '1px solid rgba(148, 163, 184, 0.1)',
        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500, padding: '4px 12px', cursor: 'pointer', zIndex: 2,
      }}>Widgets</button>
    );
  }

  return (
    <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2, pointerEvents: 'auto' }}>
      <button onClick={toggleWidgets} style={{
        borderRadius: 8, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
        color: '#64748b', border: '1px solid rgba(148, 163, 184, 0.1)',
        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500, padding: '4px 12px', cursor: 'pointer', alignSelf: 'flex-end',
      }}>Hide</button>
      <CpuWidget />
      <RamWidget />
      <ClockWidget />
    </div>
  );
}

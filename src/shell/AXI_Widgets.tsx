import { useState, useEffect, useRef, useCallback } from 'react';
import { useKernel } from '../kernel';

// ========== CPU PULSE WIDGET (120x120) ==========
function CpuPulseWidget() {
  const { state } = useKernel();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);
  const procCount = useRef(state.processes.length);

  useEffect(() => {
    procCount.current = state.processes.length;
  }, [state.processes.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const interval = setInterval(() => {
      const base = procCount.current * 10;
      const val = Math.min(100, base + Math.random() * 25 + Math.sin(Date.now() / 800) * 15);
      dataRef.current.push(val);
      if (dataRef.current.length > 30) dataRef.current.shift();

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const y = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw jagged line
      const data = dataRef.current;
      if (data.length < 2) return;
      const step = w / 29;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'bevel';
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = i * step;
        const y = h - (v / 100) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: 120,
        height: 120,
        border: '3px solid #FFFFFF',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 20,
          borderBottom: '3px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Arial Black', sans-serif",
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        CPU PULSE
      </div>
      <canvas
        ref={canvasRef}
        width={114}
        height={94}
        style={{ display: 'block' }}
      />
    </div>
  );
}

// ========== STORAGE WIDGET (120x120) ==========
function StorageWidget() {
  const [used, setUsed] = useState(0);
  const [total] = useState(5 * 1024 * 1024); // 5MB localStorage estimate

  useEffect(() => {
    const measure = () => {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          size += localStorage.getItem(key)?.length || 0;
        }
      }
      setUsed(size * 2); // UTF-16 chars = ~2 bytes each
    };
    measure();
    const interval = setInterval(measure, 3000);
    return () => clearInterval(interval);
  }, []);

  const pct = Math.min(100, (used / total) * 100);
  const barCount = 8;
  const filledBars = Math.round((pct / 100) * barCount);

  return (
    <div
      style={{
        width: 120,
        height: 120,
        border: '3px solid #FFFFFF',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 20,
          borderBottom: '3px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Arial Black', sans-serif",
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        VFS STORAGE
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, gap: 4 }}>
        {/* Bar chart */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 48 }}>
          {Array.from({ length: barCount }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: i < filledBars ? 8 + i * 5 : 4,
                background: i < filledBars ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                border: '1px solid #FFFFFF',
              }}
            />
          ))}
        </div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, textAlign: 'center' }}>
          {(used / 1024).toFixed(1)}KB
        </div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, opacity: 0.5 }}>
          {pct.toFixed(0)}% USED
        </div>
      </div>
    </div>
  );
}

// ========== CLOCK WIDGET (120x120) ==========
function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const h = String(time.getHours()).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  const s = String(time.getSeconds()).padStart(2, '0');

  // Geometric seconds indicator: fill 60 cells around the border
  const totalCells = 24;
  const filledCells = Math.floor((time.getSeconds() / 60) * totalCells);

  return (
    <div
      style={{
        width: 120,
        height: 120,
        border: '3px solid #FFFFFF',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 20,
          borderBottom: '3px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Arial Black', sans-serif",
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        SYSTEM TIME
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }}>
        <div
          style={{
            fontFamily: "'Arial Black', sans-serif",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: '0.15em',
          }}
        >
          {h}:{m}
        </div>
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 14,
            letterSpacing: '0.3em',
            opacity: 0.7,
          }}
        >
          :{s}
        </div>
        {/* Seconds bar */}
        <div style={{ display: 'flex', gap: 1, marginTop: 4 }}>
          {Array.from({ length: totalCells }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: 6,
                background: i < filledCells ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== WIDGET LAYER ==========
export function AXI_WidgetLayer() {
  const [visible, setVisible] = useState(true);

  const toggleWidgets = useCallback(() => setVisible((v) => !v), []);

  if (!visible) {
    return (
      <button
        onClick={toggleWidgets}
        style={{
          position: 'absolute',
          bottom: 56,
          right: 8,
          background: '#000000',
          color: '#FFFFFF',
          border: '3px solid #FFFFFF',
          fontFamily: "'Arial Black', sans-serif",
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: '0.2em',
          padding: '2px 8px',
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        WIDGETS
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 56,
        right: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 2,
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={toggleWidgets}
        style={{
          background: '#000000',
          color: '#FFFFFF',
          border: '3px solid #FFFFFF',
          fontFamily: "'Arial Black', sans-serif",
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: '0.2em',
          padding: '2px 8px',
          cursor: 'pointer',
          alignSelf: 'flex-end',
        }}
      >
        HIDE
      </button>
      <CpuPulseWidget />
      <StorageWidget />
      <ClockWidget />
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useKernel } from '../../kernel';
import { SYSTEM_LIMITS } from '../../styles/theme';

interface PerfPoint { cpu: number; ram: number; }
const GRAPH_WIDTH = 220;
const GRAPH_HEIGHT = 80;
const MAX_POINTS = 40;

function PerfGraph({ data, label, color, unit }: { data: number[]; label: string; color: string; unit?: string }) {
  if (data.length < 2) return null;
  const step = GRAPH_WIDTH / (MAX_POINTS - 1);
  const points = data.map((v, i) => `${i * step},${GRAPH_HEIGHT - (v / 100) * GRAPH_HEIGHT}`).join(' ');
  const fillPoints = `0,${GRAPH_HEIGHT} ${points} ${(data.length - 1) * step},${GRAPH_HEIGHT}`;
  const current = data[data.length - 1];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500 }}>
        <span style={{ color: '#94a3b8' }}>{label}</span>
        <span style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{current.toFixed(0)}{unit || '%'}</span>
      </div>
      <svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} style={{ borderRadius: 8, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', display: 'block' }}>
        {[25, 50, 75].map((pct) => (
          <line key={pct} x1={0} y1={GRAPH_HEIGHT - (pct / 100) * GRAPH_HEIGHT} x2={GRAPH_WIDTH} y2={GRAPH_HEIGHT - (pct / 100) * GRAPH_HEIGHT} stroke="rgba(148, 163, 184, 0.08)" strokeWidth={1} />
        ))}
        <polygon points={fillPoints} fill={`${color}15`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function AXI_TaskManager() {
  const { state, killProcess } = useKernel();
  const [perfHistory, setPerfHistory] = useState<PerfPoint[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const processCount = useRef(state.processes.length);
  const totalRam = useRef(0);

  useEffect(() => {
    processCount.current = state.processes.length;
    totalRam.current = state.processes.reduce((sum, p) => sum + p.ramMB, 0);
  }, [state.processes]);

  useEffect(() => {
    const interval = setInterval(() => {
      const baseLoad = state.processes.reduce((sum, p) => sum + p.cpuBase, 0);
      const cpu = Math.min(100, baseLoad + Math.random() * 8 + Math.sin(Date.now() / 1000) * 5);
      const ram = Math.min(100, (totalRam.current / SYSTEM_LIMITS.totalRAM) * 100 + Math.random() * 2);
      setPerfHistory((prev) => [...prev, { cpu, ram }].slice(-MAX_POINTS));
    }, 500);
    return () => clearInterval(interval);
  }, [state.processes]);

  const handleKill = useCallback(() => {
    if (selectedPid !== null) { killProcess(selectedPid); setSelectedPid(null); }
  }, [selectedPid, killProcess]);

  const cpuData = perfHistory.map((p) => p.cpu);
  const ramData = perfHistory.map((p) => p.ram);
  const usedRam = state.processes.reduce((sum, p) => sum + p.ramMB, 0);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0e1a', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', height: 34, borderBottom: '1px solid rgba(148, 163, 184, 0.1)', flexShrink: 0, background: 'rgba(15, 23, 42, 0.5)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px', fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Process Manager</div>
        <button onClick={handleKill} style={{
          background: selectedPid !== null ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
          color: selectedPid !== null ? '#f43f5e' : '#475569', border: 'none', borderLeft: '1px solid rgba(148, 163, 184, 0.1)',
          padding: '0 16px', fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11, cursor: selectedPid !== null ? 'pointer' : 'default', transition: 'all 0.15s ease',
        }}>Kill Process</button>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto', borderRight: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <div style={{ display: 'flex', padding: '6px 12px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', position: 'sticky', top: 0, background: '#0a0e1a', zIndex: 1 }}>
            <span style={{ width: 48 }}>PID</span>
            <span style={{ flex: 1 }}>Application</span>
            <span style={{ width: 60, textAlign: 'right' }}>RAM</span>
            <span style={{ width: 60, textAlign: 'right' }}>CPU</span>
            <span style={{ width: 80, textAlign: 'right' }}>Uptime</span>
          </div>
          {state.processes.length === 0 ? (
            <div style={{ padding: 20, color: '#475569', fontSize: 12 }}>No active processes</div>
          ) : state.processes.map((proc) => {
            const uptime = Math.floor((Date.now() - proc.startedAt) / 1000);
            return (
              <div key={proc.pid} onClick={() => setSelectedPid(proc.pid)} style={{
                display: 'flex', padding: '8px 12px', borderBottom: '1px solid rgba(148, 163, 184, 0.06)', borderRadius: 4,
                background: selectedPid === proc.pid ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                color: selectedPid === proc.pid ? '#06b6d4' : '#e2e8f0', cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, userSelect: 'none', transition: 'all 0.1s ease',
              }}>
                <span style={{ width: 48 }}>{proc.pid}</span>
                <span style={{ flex: 1 }}>{proc.title}</span>
                <span style={{ width: 60, textAlign: 'right', color: '#3b82f6' }}>{proc.ramMB}MB</span>
                <span style={{ width: 60, textAlign: 'right', color: '#06b6d4' }}>{proc.cpuBase}%</span>
                <span style={{ width: 80, textAlign: 'right', color: '#64748b' }}>{Math.floor(uptime / 60)}m {uptime % 60}s</span>
              </div>
            );
          })}
        </div>
        <div style={{ width: 252, padding: 12, overflow: 'auto', flexShrink: 0 }}>
          <PerfGraph data={cpuData} label="CPU Usage" color="#06b6d4" />
          <PerfGraph data={ramData} label="Memory" color="#3b82f6" />
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: 8, padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Processes</span><span>{state.processes.length}</span></div>
            <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Windows</span><span>{state.windows.length}</span></div>
            <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>RAM Used</span><span style={{ color: '#3b82f6' }}>{usedRam}MB / {SYSTEM_LIMITS.totalRAM}MB</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>CPU</span><span style={{ color: '#06b6d4' }}>{cpuData.length > 0 ? cpuData[cpuData.length - 1].toFixed(0) : 0}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

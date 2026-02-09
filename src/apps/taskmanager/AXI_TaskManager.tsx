import { useState, useEffect, useCallback, useRef } from 'react';
import { useKernel } from '../../kernel';

interface PerfPoint {
  cpu: number;
  ram: number;
}

const GRAPH_WIDTH = 200;
const GRAPH_HEIGHT = 80;
const MAX_POINTS = 40;

function PerfGraph({ data, label, color }: { data: number[]; label: string; color: string }) {
  if (data.length < 2) return null;

  const step = GRAPH_WIDTH / (MAX_POINTS - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = GRAPH_HEIGHT - (v / 100) * GRAPH_HEIGHT;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `0,${GRAPH_HEIGHT} ${points} ${(data.length - 1) * step},${GRAPH_HEIGHT}`;
  const current = data[data.length - 1];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 4,
        fontFamily: "'Arial Black', sans-serif",
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>
        <span>{label}</span>
        <span style={{ fontFamily: "'Courier New', monospace" }}>{current.toFixed(0)}%</span>
      </div>
      <svg
        width={GRAPH_WIDTH}
        height={GRAPH_HEIGHT}
        style={{ border: '3px solid #FFFFFF', background: '#000000', display: 'block' }}
      >
        {/* Grid lines */}
        {[25, 50, 75].map((pct) => (
          <line
            key={pct}
            x1={0}
            y1={GRAPH_HEIGHT - (pct / 100) * GRAPH_HEIGHT}
            x2={GRAPH_WIDTH}
            y2={GRAPH_HEIGHT - (pct / 100) * GRAPH_HEIGHT}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
        ))}
        {/* Fill area */}
        <polygon
          points={fillPoints}
          fill="rgba(255,255,255,0.08)"
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="bevel"
        />
      </svg>
    </div>
  );
}

export function AXI_TaskManager() {
  const { state, killProcess } = useKernel();
  const [perfHistory, setPerfHistory] = useState<PerfPoint[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const processCount = useRef(state.processes.length);

  useEffect(() => {
    processCount.current = state.processes.length;
  }, [state.processes.length]);

  // Simulated performance data - reactive to window count
  useEffect(() => {
    const interval = setInterval(() => {
      const baseLoad = processCount.current * 8;
      const cpu = Math.min(100, baseLoad + Math.random() * 20 + Math.sin(Date.now() / 1000) * 10);
      const ram = Math.min(100, 30 + processCount.current * 7 + Math.random() * 5);
      setPerfHistory((prev) => {
        const next = [...prev, { cpu, ram }];
        return next.slice(-MAX_POINTS);
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleKill = useCallback(() => {
    if (selectedPid !== null) {
      killProcess(selectedPid);
      setSelectedPid(null);
    }
  }, [selectedPid, killProcess]);

  const cpuData = perfHistory.map((p) => p.cpu);
  const ramData = perfHistory.map((p) => p.ram);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#000000',
      color: '#FFFFFF',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        height: 32,
        borderBottom: '3px solid #FFFFFF',
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          fontFamily: "'Arial Black', sans-serif",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
        }}>
          PROCESS MANAGER
        </div>
        <button
          onClick={handleKill}
          style={{
            background: selectedPid !== null ? '#FFFFFF' : '#000000',
            color: selectedPid !== null ? '#000000' : '#FFFFFF',
            border: 'none',
            borderLeft: '3px solid #FFFFFF',
            padding: '0 16px',
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 900,
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            cursor: selectedPid !== null ? 'pointer' : 'default',
            opacity: selectedPid !== null ? 1 : 0.3,
          }}
        >
          KILL PROCESS
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Process list */}
        <div style={{ flex: 1, overflow: 'auto', borderRight: '3px solid #FFFFFF' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            padding: '6px 8px',
            borderBottom: '3px solid #FFFFFF',
            fontFamily: "'Arial Black', sans-serif",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            position: 'sticky',
            top: 0,
            background: '#000000',
            zIndex: 1,
          }}>
            <span style={{ width: 48 }}>PID</span>
            <span style={{ flex: 1 }}>APPLICATION</span>
            <span style={{ width: 80, textAlign: 'right' }}>UPTIME</span>
          </div>

          {state.processes.length === 0 ? (
            <div style={{ padding: 16, opacity: 0.5, fontFamily: "'Courier New', monospace", fontSize: 12 }}>
              No active processes
            </div>
          ) : (
            state.processes.map((proc) => {
              const uptime = Math.floor((Date.now() - proc.startedAt) / 1000);
              const uptimeStr = `${Math.floor(uptime / 60)}m ${uptime % 60}s`;
              return (
                <div
                  key={proc.pid}
                  onClick={() => setSelectedPid(proc.pid)}
                  style={{
                    display: 'flex',
                    padding: '6px 8px',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                    background: selectedPid === proc.pid ? '#FFFFFF' : 'transparent',
                    color: selectedPid === proc.pid ? '#000000' : '#FFFFFF',
                    cursor: 'pointer',
                    fontFamily: "'Courier New', monospace",
                    fontSize: 12,
                    userSelect: 'none',
                  }}
                >
                  <span style={{ width: 48 }}>{proc.pid}</span>
                  <span style={{ flex: 1 }}>{proc.title}</span>
                  <span style={{ width: 80, textAlign: 'right' }}>{uptimeStr}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Performance panel */}
        <div style={{ width: 232, padding: 12, overflow: 'auto', flexShrink: 0 }}>
          <PerfGraph data={cpuData} label="CPU USAGE" color="#FFFFFF" />
          <PerfGraph data={ramData} label="MEMORY" color="#FFFFFF" />

          {/* Summary */}
          <div style={{
            border: '3px solid #FFFFFF',
            padding: 8,
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
          }}>
            <div style={{ marginBottom: 4 }}>PROCESSES: {state.processes.length}</div>
            <div style={{ marginBottom: 4 }}>WINDOWS:   {state.windows.length}</div>
            <div style={{ marginBottom: 4 }}>CPU: {cpuData.length > 0 ? cpuData[cpuData.length - 1].toFixed(0) : 0}%</div>
            <div>RAM: {ramData.length > 0 ? ramData[ramData.length - 1].toFixed(0) : 0}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

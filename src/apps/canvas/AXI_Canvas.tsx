import { useState, useRef, useCallback, useEffect } from 'react';
import { useKernel } from '../../kernel';

type CanvasTool = 'pencil' | 'line' | 'fill';

export function AXI_Canvas() {
  const { vfs } = useKernel();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<CanvasTool>('pencil');
  const [color, setColor] = useState('#06b6d4');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const lineStart = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#e2e8f0', '#020617'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = containerRef.current;
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const getPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: Math.floor(e.clientX - rect.left), y: Math.floor(e.clientY - rect.top) };
  }, []);

  const floodFill = useCallback(
    (startX: number, startY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;
      const idx = (startY * w + startX) * 4;
      const targetR = data[idx], targetG = data[idx + 1], targetB = data[idx + 2];
      const temp = document.createElement('canvas').getContext('2d')!;
      temp.fillStyle = color;
      temp.fillRect(0, 0, 1, 1);
      const fc = temp.getImageData(0, 0, 1, 1).data;
      if (targetR === fc[0] && targetG === fc[1] && targetB === fc[2]) return;
      const stack: [number, number][] = [[startX, startY]];
      const visited = new Set<number>();
      while (stack.length > 0) {
        const [x, y] = stack.pop()!;
        const key = y * w + x;
        if (visited.has(key)) continue;
        if (x < 0 || x >= w || y < 0 || y >= h) continue;
        const i = key * 4;
        if (data[i] !== targetR || data[i + 1] !== targetG || data[i + 2] !== targetB) continue;
        visited.add(key);
        data[i] = fc[0]; data[i + 1] = fc[1]; data[i + 2] = fc[2]; data[i + 3] = 255;
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
      ctx.putImageData(imageData, 0, 0);
    },
    [color]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pos = getPos(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (tool === 'pencil') {
        setIsDrawing(true);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'line') {
        lineStart.current = pos;
        snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setIsDrawing(true);
      } else if (tool === 'fill') {
        floodFill(pos.x, pos.y);
      }
    },
    [tool, color, brushSize, getPos, floodFill]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing) return;
      const pos = getPos(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (tool === 'pencil') {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'line' && lineStart.current && snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lineStart.current.x, lineStart.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    },
    [isDrawing, tool, color, brushSize, getPos]
  );

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    lineStart.current = null;
    snapshotRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const exportToVFS = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const filename = `canvas_${Date.now()}.png`;
    const path = `/home/user/pictures/${filename}`;
    vfs.write(path, dataUrl);
  }, [vfs]);

  const toolBtn = (t: CanvasTool): React.CSSProperties => ({
    background: tool === t ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
    color: tool === t ? '#06b6d4' : '#94a3b8',
    border: tool === t ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
    borderRadius: 6,
    padding: '4px 12px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0e1a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', flexShrink: 0, background: 'rgba(15, 23, 42, 0.5)' }}>
        <button style={toolBtn('pencil')} onClick={() => setTool('pencil')}>Pencil</button>
        <button style={toolBtn('line')} onClick={() => setTool('line')}>Line</button>
        <button style={toolBtn('fill')} onClick={() => setTool('fill')}>Fill</button>
        <div style={{ width: 1, height: 20, background: 'rgba(148, 163, 184, 0.15)', margin: '0 4px' }} />
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} style={{
            width: 20, height: 20, borderRadius: '50%', background: c, border: color === c ? '2px solid #e2e8f0' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s ease',
          }} />
        ))}
        <div style={{ width: 1, height: 20, background: 'rgba(148, 163, 184, 0.15)', margin: '0 4px' }} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#64748b' }}>Size:</span>
        <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{ width: 80, accentColor: '#06b6d4' }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#94a3b8', minWidth: 20 }}>{brushSize}</span>
        <div style={{ flex: 1 }} />
        <button onClick={clearCanvas} style={{ ...toolBtn('pencil'), background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.2)' }}>Clear</button>
        <button onClick={exportToVFS} style={{ ...toolBtn('pencil'), background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', border: 'none' }}>Export</button>
      </div>
      <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', cursor: 'crosshair' }}>
        <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ display: 'block' }} />
      </div>
    </div>
  );
}

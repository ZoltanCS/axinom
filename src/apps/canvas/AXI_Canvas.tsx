import { useState, useRef, useCallback, useEffect } from 'react';
import { useKernel } from '../../kernel';

type CanvasTool = 'pencil' | 'line' | 'fill';

export function AXI_Canvas() {
  const { vfs } = useKernel();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<CanvasTool>('pencil');
  const [color, setColor] = useState<'#000000' | '#FFFFFF'>('#FFFFFF');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const lineStart = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = containerRef.current;
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const getPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor(e.clientX - rect.left),
      y: Math.floor(e.clientY - rect.top),
    };
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
      const targetR = data[idx];
      const targetG = data[idx + 1];
      const targetB = data[idx + 2];

      const fillColor = color === '#FFFFFF' ? [255, 255, 255] : [0, 0, 0];

      if (targetR === fillColor[0] && targetG === fillColor[1] && targetB === fillColor[2]) return;

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
        data[i] = fillColor[0];
        data[i + 1] = fillColor[1];
        data[i + 2] = fillColor[2];
        data[i + 3] = 255;

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
        ctx.lineCap = 'square';
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
        ctx.lineCap = 'square';
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
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const exportToVFS = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const filename = `canvas_${Date.now()}.png`;
    const path = `/home/user/pictures/${filename}`;
    vfs.write(path, dataUrl);
    alert(`Saved to ${path}`);
  }, [vfs]);

  const toolBtnStyle = (t: CanvasTool): React.CSSProperties => ({
    background: tool === t ? '#FFFFFF' : '#000000',
    color: tool === t ? '#000000' : '#FFFFFF',
    border: '3px solid #FFFFFF',
    padding: '4px 12px',
    fontFamily: "'Arial Black', sans-serif",
    fontWeight: 900,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    cursor: 'pointer',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#000000',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          borderBottom: '3px solid #FFFFFF',
          flexShrink: 0,
          height: 36,
        }}
      >
        <button style={toolBtnStyle('pencil')} onClick={() => setTool('pencil')}>
          PENCIL
        </button>
        <button style={toolBtnStyle('line')} onClick={() => setTool('line')}>
          LINE
        </button>
        <button style={toolBtnStyle('fill')} onClick={() => setTool('fill')}>
          FILL
        </button>

        <div style={{ borderLeft: '3px solid #FFFFFF', height: '100%' }} />

        <button
          onClick={() => setColor('#FFFFFF')}
          style={{
            width: 28,
            height: 28,
            background: '#FFFFFF',
            border: color === '#FFFFFF' ? '3px solid #FFFFFF' : '3px solid #FFFFFF',
            cursor: 'pointer',
            margin: '0 4px',
            boxShadow: color === '#FFFFFF' ? '0 0 0 3px #000 inset' : 'none',
          }}
        />
        <button
          onClick={() => setColor('#000000')}
          style={{
            width: 28,
            height: 28,
            background: '#000000',
            border: '3px solid #FFFFFF',
            cursor: 'pointer',
            margin: '0 4px',
            boxShadow: color === '#000000' ? '0 0 0 3px #FFF inset' : 'none',
          }}
        />

        <div style={{ borderLeft: '3px solid #FFFFFF', height: '100%' }} />

        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            padding: '0 8px',
            color: '#FFFFFF',
          }}
        >
          SIZE:
        </span>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{ width: 80, accentColor: '#FFFFFF' }}
        />
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            padding: '0 8px',
            color: '#FFFFFF',
            minWidth: 24,
          }}
        >
          {brushSize}
        </span>

        <div style={{ flex: 1 }} />

        <button
          onClick={clearCanvas}
          style={{
            background: '#000000',
            color: '#FFFFFF',
            border: 'none',
            borderLeft: '3px solid #FFFFFF',
            padding: '0 12px',
            height: '100%',
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 900,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            cursor: 'pointer',
          }}
        >
          CLEAR
        </button>
        <button
          onClick={exportToVFS}
          style={{
            background: '#000000',
            color: '#FFFFFF',
            border: 'none',
            borderLeft: '3px solid #FFFFFF',
            padding: '0 12px',
            height: '100%',
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 900,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            cursor: 'pointer',
          }}
        >
          EXPORT
        </button>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', cursor: 'crosshair' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}

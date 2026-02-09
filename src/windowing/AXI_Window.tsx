import { useCallback, useRef, useState, memo, type ReactNode, type MouseEvent as RMouseEvent } from 'react';
import { motion } from 'framer-motion';
import { useKernel } from '../kernel';
import type { WindowInfo } from '../kernel';

interface AXI_WindowProps {
  window: WindowInfo;
  children: ReactNode;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

const RESIZE_HANDLE_SIZE = 6;
const MIN_WIDTH = 360;
const MIN_HEIGHT = 240;
const TASKBAR_HEIGHT = 56;
const SNAP_THRESHOLD = 20;

const RESIZE_CURSORS: Record<ResizeDirection, string> = {
  n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
  nw: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', se: 'nwse-resize',
};

export const AXI_Window = memo(function AXI_Window({ window: win, children }: AXI_WindowProps) {
  const { dispatch, killProcess, focusWindow } = useKernel();
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{
    dir: ResizeDirection; startX: number; startY: number;
    origGeo: { x: number; y: number; w: number; h: number };
  } | null>(null);
  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | null>(null);
  const [hoverBtn, setHoverBtn] = useState<string | null>(null);

  const handleMouseDownTitle = useCallback(
    (e: RMouseEvent) => {
      if (win.state === 'maximized' || win.state === 'snapped-left' || win.state === 'snapped-right') {
        dispatch({ type: 'RESTORE_WINDOW', pid: win.pid });
        return;
      }
      e.preventDefault();
      focusWindow(win.pid);
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: win.geometry.x, origY: win.geometry.y };

      const onMove = (ev: globalThis.MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        let newX = dragRef.current.origX + dx;
        let newY = dragRef.current.origY + dy;
        newX = Math.max(-win.geometry.w + 100, Math.min(newX, globalThis.innerWidth - 100));
        newY = Math.max(0, Math.min(newY, globalThis.innerHeight - TASKBAR_HEIGHT - 40));
        dispatch({ type: 'MOVE_WINDOW', pid: win.pid, x: newX, y: newY });

        if (ev.clientX <= SNAP_THRESHOLD) setSnapPreview('left');
        else if (ev.clientX >= globalThis.innerWidth - SNAP_THRESHOLD) setSnapPreview('right');
        else setSnapPreview(null);
      };

      const onUp = (ev: globalThis.MouseEvent) => {
        if (ev.clientX <= SNAP_THRESHOLD) dispatch({ type: 'SNAP_WINDOW', pid: win.pid, side: 'left' });
        else if (ev.clientX >= globalThis.innerWidth - SNAP_THRESHOLD) dispatch({ type: 'SNAP_WINDOW', pid: win.pid, side: 'right' });
        else if (ev.clientY <= 5) dispatch({ type: 'MAXIMIZE_WINDOW', pid: win.pid });
        setSnapPreview(null);
        dragRef.current = null;
        globalThis.removeEventListener('mousemove', onMove);
        globalThis.removeEventListener('mouseup', onUp);
      };

      globalThis.addEventListener('mousemove', onMove);
      globalThis.addEventListener('mouseup', onUp);
    },
    [win.pid, win.state, win.geometry, dispatch, focusWindow]
  );

  const handleResizeStart = useCallback(
    (dir: ResizeDirection) => (e: RMouseEvent) => {
      if (win.state !== 'normal') return;
      e.preventDefault();
      e.stopPropagation();
      focusWindow(win.pid);
      resizeRef.current = { dir, startX: e.clientX, startY: e.clientY, origGeo: { ...win.geometry } };

      const onMove = (ev: globalThis.MouseEvent) => {
        if (!resizeRef.current) return;
        const { dir: d, startX, startY, origGeo } = resizeRef.current;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let { x, y, w, h } = origGeo;
        if (d.includes('e')) w = Math.max(MIN_WIDTH, origGeo.w + dx);
        if (d.includes('w')) { w = Math.max(MIN_WIDTH, origGeo.w - dx); if (w > MIN_WIDTH) x = origGeo.x + dx; }
        if (d.includes('s')) h = Math.max(MIN_HEIGHT, origGeo.h + dy);
        if (d.includes('n')) { h = Math.max(MIN_HEIGHT, origGeo.h - dy); if (h > MIN_HEIGHT) y = origGeo.y + dy; }
        x = Math.max(0, x);
        y = Math.max(0, y);
        dispatch({ type: 'RESIZE_WINDOW', pid: win.pid, w, h, x, y });
      };

      const onUp = () => {
        resizeRef.current = null;
        globalThis.removeEventListener('mousemove', onMove);
        globalThis.removeEventListener('mouseup', onUp);
      };

      globalThis.addEventListener('mousemove', onMove);
      globalThis.addEventListener('mouseup', onUp);
    },
    [win.pid, win.state, win.geometry, dispatch, focusWindow]
  );

  const handleFocus = useCallback(() => { focusWindow(win.pid); }, [win.pid, focusWindow]);

  const handleMinimize = useCallback((e: RMouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'MINIMIZE_WINDOW', pid: win.pid });
  }, [win.pid, dispatch]);

  const handleMaxRestore = useCallback((e: RMouseEvent) => {
    e.stopPropagation();
    if (win.state === 'maximized' || win.state === 'snapped-left' || win.state === 'snapped-right') {
      dispatch({ type: 'RESTORE_WINDOW', pid: win.pid });
    } else {
      dispatch({ type: 'MAXIMIZE_WINDOW', pid: win.pid });
    }
  }, [win.pid, win.state, dispatch]);

  const handleClose = useCallback((e: RMouseEvent) => {
    e.stopPropagation();
    killProcess(win.pid);
  }, [win.pid, killProcess]);

  if (win.state === 'minimized') return null;

  const { x, y, w, h } = win.geometry;
  const isSnappedOrMax = win.state === 'maximized' || win.state === 'snapped-left' || win.state === 'snapped-right';
  const borderRadius = isSnappedOrMax ? 0 : 12;

  const resizeHandles: Array<{ dir: ResizeDirection; style: React.CSSProperties }> = [
    { dir: 'n', style: { top: -3, left: RESIZE_HANDLE_SIZE, right: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE } },
    { dir: 's', style: { bottom: -3, left: RESIZE_HANDLE_SIZE, right: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE } },
    { dir: 'e', style: { top: RESIZE_HANDLE_SIZE, right: -3, bottom: RESIZE_HANDLE_SIZE, width: RESIZE_HANDLE_SIZE } },
    { dir: 'w', style: { top: RESIZE_HANDLE_SIZE, left: -3, bottom: RESIZE_HANDLE_SIZE, width: RESIZE_HANDLE_SIZE } },
    { dir: 'nw', style: { top: -3, left: -3, width: RESIZE_HANDLE_SIZE * 2, height: RESIZE_HANDLE_SIZE * 2 } },
    { dir: 'ne', style: { top: -3, right: -3, width: RESIZE_HANDLE_SIZE * 2, height: RESIZE_HANDLE_SIZE * 2 } },
    { dir: 'sw', style: { bottom: -3, left: -3, width: RESIZE_HANDLE_SIZE * 2, height: RESIZE_HANDLE_SIZE * 2 } },
    { dir: 'se', style: { bottom: -3, right: -3, width: RESIZE_HANDLE_SIZE * 2, height: RESIZE_HANDLE_SIZE * 2 } },
  ];

  const ctrlBtn = (type: 'min' | 'max' | 'close'): React.CSSProperties => ({
    width: 12, height: 12, borderRadius: '50%', border: 'none', cursor: 'pointer',
    transition: 'all 0.15s ease',
    background: hoverBtn === type
      ? type === 'close' ? '#f43f5e' : type === 'max' ? '#10b981' : '#f59e0b'
      : 'rgba(148, 163, 184, 0.3)',
    transform: hoverBtn === type ? 'scale(1.2)' : 'scale(1)',
  });

  return (
    <>
      {snapPreview && (
        <div className="axi-snap-zone" style={{
          top: 4, bottom: 60,
          ...(snapPreview === 'left' ? { left: 4, width: '49%' } : { right: 4, width: '49%' }),
        }} />
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
        onMouseDown={handleFocus}
        style={{
          position: 'absolute', left: x, top: y, width: w, height: h,
          zIndex: win.zIndex, borderRadius,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: win.focused ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: win.focused
            ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(6, 182, 212, 0.15)'
            : '0 4px 16px rgba(0, 0, 0, 0.3)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          willChange: 'transform', contain: 'layout style',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {/* Title bar */}
        <div
          onMouseDown={handleMouseDownTitle}
          onDoubleClick={(e) => { e.stopPropagation(); handleMaxRestore(e as unknown as RMouseEvent); }}
          style={{
            display: 'flex', alignItems: 'center', height: 38, padding: '0 12px',
            userSelect: 'none', cursor: isSnappedOrMax ? 'default' : 'move', flexShrink: 0,
            borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
            background: win.focused
              ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.08), rgba(59, 130, 246, 0.05), transparent)'
              : 'transparent',
          }}
        >
          <div style={{ display: 'flex', gap: 6, marginRight: 12 }}>
            <button onClick={handleClose} onMouseEnter={() => setHoverBtn('close')} onMouseLeave={() => setHoverBtn(null)} style={ctrlBtn('close')} />
            <button onClick={handleMinimize} onMouseEnter={() => setHoverBtn('min')} onMouseLeave={() => setHoverBtn(null)} style={ctrlBtn('min')} />
            <button onClick={handleMaxRestore} onMouseEnter={() => setHoverBtn('max')} onMouseLeave={() => setHoverBtn(null)} style={ctrlBtn('max')} />
          </div>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13,
            color: win.focused ? '#e2e8f0' : '#64748b',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1, textAlign: 'center', marginRight: 48,
          }}>{win.title}</span>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
        {/* Resize handles */}
        {win.state === 'normal' && resizeHandles.map(({ dir, style }) => (
          <div key={dir} onMouseDown={handleResizeStart(dir)}
            style={{ position: 'absolute', ...style, cursor: RESIZE_CURSORS[dir], zIndex: 10 }} />
        ))}
      </motion.div>
    </>
  );
});

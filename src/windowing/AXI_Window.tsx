import { useCallback, useRef, memo, type ReactNode, type MouseEvent } from 'react';
import { useKernel } from '../kernel';
import type { WindowInfo } from '../kernel';

interface AXI_WindowProps {
  window: WindowInfo;
  children: ReactNode;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

const RESIZE_HANDLE_SIZE = 8;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;
const TASKBAR_HEIGHT = 48;

const RESIZE_CURSORS: Record<ResizeDirection, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  nw: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  se: 'nwse-resize',
};

export const AXI_Window = memo(function AXI_Window({ window: win, children }: AXI_WindowProps) {
  const { dispatch, killProcess, focusWindow } = useKernel();
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{
    dir: ResizeDirection;
    startX: number;
    startY: number;
    origGeo: { x: number; y: number; w: number; h: number };
  } | null>(null);

  const handleMouseDownTitle = useCallback(
    (e: MouseEvent) => {
      if (win.state === 'maximized') return;
      e.preventDefault();
      focusWindow(win.pid);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: win.geometry.x,
        origY: win.geometry.y,
      };

      const onMove = (ev: globalThis.MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        let newX = dragRef.current.origX + dx;
        let newY = dragRef.current.origY + dy;

        // Collision: keep within viewport
        newX = Math.max(0, Math.min(newX, globalThis.innerWidth - win.geometry.w));
        newY = Math.max(0, Math.min(newY, globalThis.innerHeight - TASKBAR_HEIGHT - 40));

        dispatch({ type: 'MOVE_WINDOW', pid: win.pid, x: newX, y: newY });
      };

      const onUp = () => {
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
    (dir: ResizeDirection) => (e: MouseEvent) => {
      if (win.state === 'maximized') return;
      e.preventDefault();
      e.stopPropagation();
      focusWindow(win.pid);
      resizeRef.current = {
        dir,
        startX: e.clientX,
        startY: e.clientY,
        origGeo: { ...win.geometry },
      };

      const onMove = (ev: globalThis.MouseEvent) => {
        if (!resizeRef.current) return;
        const { dir: d, startX, startY, origGeo } = resizeRef.current;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let { x, y, w, h } = origGeo;

        if (d.includes('e')) w = Math.max(MIN_WIDTH, origGeo.w + dx);
        if (d.includes('w')) {
          w = Math.max(MIN_WIDTH, origGeo.w - dx);
          if (w > MIN_WIDTH) x = origGeo.x + dx;
        }
        if (d.includes('s')) h = Math.max(MIN_HEIGHT, origGeo.h + dy);
        if (d.includes('n')) {
          h = Math.max(MIN_HEIGHT, origGeo.h - dy);
          if (h > MIN_HEIGHT) y = origGeo.y + dy;
        }

        // Clamp
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

  const handleFocus = useCallback(() => {
    focusWindow(win.pid);
  }, [win.pid, focusWindow]);

  const handleMinimize = useCallback(() => {
    dispatch({ type: 'MINIMIZE_WINDOW', pid: win.pid });
  }, [win.pid, dispatch]);

  const handleMaxRestore = useCallback(() => {
    if (win.state === 'maximized') {
      dispatch({ type: 'RESTORE_WINDOW', pid: win.pid });
    } else {
      dispatch({ type: 'MAXIMIZE_WINDOW', pid: win.pid });
    }
  }, [win.pid, win.state, dispatch]);

  const handleClose = useCallback(() => {
    killProcess(win.pid);
  }, [win.pid, killProcess]);

  if (win.state === 'minimized') return null;

  const { x, y, w, h } = win.geometry;

  const resizeHandles: Array<{ dir: ResizeDirection; style: React.CSSProperties }> = [
    { dir: 'n', style: { top: 0, left: RESIZE_HANDLE_SIZE, right: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE } },
    { dir: 's', style: { bottom: 0, left: RESIZE_HANDLE_SIZE, right: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE } },
    { dir: 'e', style: { top: RESIZE_HANDLE_SIZE, right: 0, bottom: RESIZE_HANDLE_SIZE, width: RESIZE_HANDLE_SIZE } },
    { dir: 'w', style: { top: RESIZE_HANDLE_SIZE, left: 0, bottom: RESIZE_HANDLE_SIZE, width: RESIZE_HANDLE_SIZE } },
    { dir: 'nw', style: { top: 0, left: 0, width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE } },
    { dir: 'ne', style: { top: 0, right: 0, width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE } },
    { dir: 'sw', style: { bottom: 0, left: 0, width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE } },
    { dir: 'se', style: { bottom: 0, right: 0, width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE } },
  ];

  return (
    <div
      onMouseDown={handleFocus}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: win.zIndex,
        border: `3px solid ${win.focused ? '#FFFFFF' : '#FFFFFF'}`,
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: win.focused ? '8px 8px 0px #FFFFFF' : 'none',
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={handleMouseDownTitle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 32,
          background: win.focused ? '#FFFFFF' : '#000000',
          color: win.focused ? '#000000' : '#FFFFFF',
          borderBottom: '3px solid #FFFFFF',
          padding: '0 8px',
          userSelect: 'none',
          cursor: win.state === 'maximized' ? 'default' : 'move',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            fontSize: 11,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: 8,
          }}
        >
          {win.title}
        </span>
        <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
          <button
            onClick={handleMinimize}
            style={{
              width: 24,
              height: 24,
              border: `3px solid ${win.focused ? '#000000' : '#FFFFFF'}`,
              background: 'transparent',
              color: win.focused ? '#000000' : '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 14,
              fontFamily: 'monospace',
              padding: 0,
            }}
            title="Minimize"
          >
            _
          </button>
          <button
            onClick={handleMaxRestore}
            style={{
              width: 24,
              height: 24,
              border: `3px solid ${win.focused ? '#000000' : '#FFFFFF'}`,
              borderLeft: 'none',
              background: 'transparent',
              color: win.focused ? '#000000' : '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 11,
              fontFamily: 'monospace',
              padding: 0,
            }}
            title={win.state === 'maximized' ? 'Restore' : 'Maximize'}
          >
            {win.state === 'maximized' ? '◱' : '□'}
          </button>
          <button
            onClick={handleClose}
            style={{
              width: 24,
              height: 24,
              border: `3px solid ${win.focused ? '#000000' : '#FFFFFF'}`,
              borderLeft: 'none',
              background: 'transparent',
              color: win.focused ? '#000000' : '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 14,
              fontFamily: 'monospace',
              padding: 0,
            }}
            title="Close"
          >
            X
          </button>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>

      {/* Resize handles */}
      {win.state !== 'maximized' &&
        resizeHandles.map(({ dir, style }) => (
          <div
            key={dir}
            onMouseDown={handleResizeStart(dir)}
            style={{
              position: 'absolute',
              ...style,
              cursor: RESIZE_CURSORS[dir],
              zIndex: 10,
            }}
          />
        ))}
    </div>
  );
});

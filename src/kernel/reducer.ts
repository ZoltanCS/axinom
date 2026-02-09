import type { KernelState, KernelAction, WindowInfo } from './types';

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 500;
const TASKBAR_HEIGHT = 56;

function getDefaultPosition(state: KernelState): { x: number; y: number } {
  const offset = (state.windows.length % 6) * 40;
  return { x: 100 + offset, y: 60 + offset };
}

export const initialKernelState: KernelState = {
  processes: [],
  windows: [],
  nextPid: 1,
  topZIndex: 100,
};

export function kernelReducer(state: KernelState, action: KernelAction): KernelState {
  switch (action.type) {
    case 'SPAWN_PROCESS': {
      const pid = state.nextPid;
      const pos = getDefaultPosition(state);
      const geometry = {
        x: action.geometry?.x ?? pos.x,
        y: action.geometry?.y ?? pos.y,
        w: action.geometry?.w ?? DEFAULT_WIDTH,
        h: action.geometry?.h ?? DEFAULT_HEIGHT,
      };
      const newZ = state.topZIndex + 1;

      const newProcess = {
        pid,
        appId: action.appId,
        title: action.title,
        startedAt: Date.now(),
        ramMB: action.ramMB,
        cpuBase: action.cpuBase,
      };

      const newWindow: WindowInfo = {
        pid,
        appId: action.appId,
        title: action.title,
        geometry,
        prevGeometry: null,
        state: 'normal',
        zIndex: newZ,
        focused: true,
      };

      return {
        ...state,
        processes: [...state.processes, newProcess],
        windows: [
          ...state.windows.map((w) => ({ ...w, focused: false })),
          newWindow,
        ],
        nextPid: pid + 1,
        topZIndex: newZ,
      };
    }

    case 'KILL_PROCESS': {
      return {
        ...state,
        processes: state.processes.filter((p) => p.pid !== action.pid),
        windows: state.windows.filter((w) => w.pid !== action.pid),
      };
    }

    case 'FOCUS_WINDOW': {
      const newZ = state.topZIndex + 1;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid
            ? { ...w, zIndex: newZ, focused: true, state: w.state === 'minimized' ? 'normal' : w.state }
            : { ...w, focused: false }
        ),
        topZIndex: newZ,
      };
    }

    case 'MINIMIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid ? { ...w, state: 'minimized' as const, focused: false } : w
        ),
      };
    }

    case 'MAXIMIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid
            ? {
                ...w,
                state: 'maximized' as const,
                prevGeometry: w.prevGeometry ?? w.geometry,
                geometry: { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - TASKBAR_HEIGHT },
                focused: true,
                zIndex: state.topZIndex + 1,
              }
            : { ...w, focused: false }
        ),
        topZIndex: state.topZIndex + 1,
      };
    }

    case 'RESTORE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid
            ? {
                ...w,
                state: 'normal' as const,
                geometry: w.prevGeometry ?? w.geometry,
                prevGeometry: null,
                focused: true,
                zIndex: state.topZIndex + 1,
              }
            : { ...w, focused: false }
        ),
        topZIndex: state.topZIndex + 1,
      };
    }

    case 'SNAP_WINDOW': {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight - TASKBAR_HEIGHT;
      const snapGeo = action.side === 'left'
        ? { x: 4, y: 4, w: Math.floor(screenW / 2) - 6, h: screenH - 8 }
        : { x: Math.floor(screenW / 2) + 2, y: 4, w: Math.floor(screenW / 2) - 6, h: screenH - 8 };

      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid
            ? {
                ...w,
                state: (action.side === 'left' ? 'snapped-left' : 'snapped-right') as WindowInfo['state'],
                prevGeometry: w.prevGeometry ?? w.geometry,
                geometry: snapGeo,
                focused: true,
                zIndex: state.topZIndex + 1,
              }
            : { ...w, focused: false }
        ),
        topZIndex: state.topZIndex + 1,
      };
    }

    case 'MOVE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid
            ? { ...w, geometry: { ...w.geometry, x: action.x, y: action.y } }
            : w
        ),
      };
    }

    case 'RESIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid
            ? {
                ...w,
                geometry: {
                  x: action.x ?? w.geometry.x,
                  y: action.y ?? w.geometry.y,
                  w: action.w,
                  h: action.h,
                },
              }
            : w
        ),
      };
    }

    case 'SET_WINDOW_TITLE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid ? { ...w, title: action.title } : w
        ),
        processes: state.processes.map((p) =>
          p.pid === action.pid ? { ...p, title: action.title } : p
        ),
      };
    }

    default:
      return state;
  }
}

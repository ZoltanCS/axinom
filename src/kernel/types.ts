export type AppId = 'terminal' | 'editor' | 'canvas' | 'navigator' | 'files' | 'taskmanager' | 'settings';

export interface ProcessInfo {
  pid: number;
  appId: AppId;
  title: string;
  startedAt: number;
  ramMB: number;
  cpuBase: number;
}

export interface WindowGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type WindowState = 'normal' | 'minimized' | 'maximized' | 'snapped-left' | 'snapped-right';

export interface WindowInfo {
  pid: number;
  appId: AppId;
  title: string;
  geometry: WindowGeometry;
  prevGeometry: WindowGeometry | null;
  state: WindowState;
  zIndex: number;
  focused: boolean;
}

export interface KernelState {
  processes: ProcessInfo[];
  windows: WindowInfo[];
  nextPid: number;
  topZIndex: number;
}

export type KernelAction =
  | { type: 'SPAWN_PROCESS'; appId: AppId; title: string; geometry?: Partial<WindowGeometry>; ramMB: number; cpuBase: number }
  | { type: 'KILL_PROCESS'; pid: number }
  | { type: 'FOCUS_WINDOW'; pid: number }
  | { type: 'MINIMIZE_WINDOW'; pid: number }
  | { type: 'MAXIMIZE_WINDOW'; pid: number }
  | { type: 'RESTORE_WINDOW'; pid: number }
  | { type: 'SNAP_WINDOW'; pid: number; side: 'left' | 'right' }
  | { type: 'MOVE_WINDOW'; pid: number; x: number; y: number }
  | { type: 'RESIZE_WINDOW'; pid: number; w: number; h: number; x?: number; y?: number }
  | { type: 'SET_WINDOW_TITLE'; pid: number; title: string };

export type EventBusListener = (data: unknown) => void;

export interface EventBus {
  emit: (event: string, data?: unknown) => void;
  on: (event: string, listener: EventBusListener) => () => void;
}

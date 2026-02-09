import { createContext, useContext, useReducer, useMemo, useCallback, type ReactNode } from 'react';
import type { KernelState, KernelAction, AppId, EventBus, WindowGeometry } from './types';
import { kernelReducer, initialKernelState } from './reducer';
import { createEventBus } from './eventbus';
import { vfs, type VirtualFileSystem } from '../vfs';
import { APP_RESOURCE_COSTS } from '../styles/theme';

interface KernelContextValue {
  state: KernelState;
  dispatch: React.Dispatch<KernelAction>;
  eventBus: EventBus;
  vfs: VirtualFileSystem;
  spawnApp: (appId: AppId, geometry?: Partial<WindowGeometry>) => void;
  killProcess: (pid: number) => void;
  focusWindow: (pid: number) => void;
}

const KernelContext = createContext<KernelContextValue | null>(null);

const APP_TITLES: Record<AppId, string> = {
  terminal: 'Terminal',
  editor: 'Editor',
  canvas: 'Canvas',
  navigator: 'Navigator',
  files: 'Files',
  taskmanager: 'Task Manager',
  settings: 'Settings',
};

export function KernelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kernelReducer, initialKernelState);
  const eventBus = useMemo(() => createEventBus(), []);

  const spawnApp = useCallback(
    (appId: AppId, geometry?: Partial<WindowGeometry>) => {
      const costs = APP_RESOURCE_COSTS[appId] || { ramMB: 64, cpuBase: 2 };
      dispatch({
        type: 'SPAWN_PROCESS',
        appId,
        title: APP_TITLES[appId],
        geometry,
        ramMB: costs.ramMB,
        cpuBase: costs.cpuBase,
      });
      eventBus.emit('process:spawn', { appId });
    },
    [dispatch, eventBus]
  );

  const killProcess = useCallback(
    (pid: number) => {
      dispatch({ type: 'KILL_PROCESS', pid });
      eventBus.emit('process:kill', { pid });
    },
    [dispatch, eventBus]
  );

  const focusWindow = useCallback(
    (pid: number) => {
      dispatch({ type: 'FOCUS_WINDOW', pid });
    },
    [dispatch]
  );

  const value = useMemo<KernelContextValue>(
    () => ({ state, dispatch, eventBus, vfs, spawnApp, killProcess, focusWindow }),
    [state, dispatch, eventBus, spawnApp, killProcess, focusWindow]
  );

  return <KernelContext.Provider value={value}>{children}</KernelContext.Provider>;
}

export function useKernel(): KernelContextValue {
  const ctx = useContext(KernelContext);
  if (!ctx) throw new Error('useKernel must be used within KernelProvider');
  return ctx;
}

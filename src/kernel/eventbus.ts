import type { EventBusListener } from './types';

export function createEventBus() {
  const listeners = new Map<string, Set<EventBusListener>>();

  function emit(event: string, data?: unknown): void {
    const set = listeners.get(event);
    if (set) {
      set.forEach((fn) => fn(data));
    }
  }

  function on(event: string, listener: EventBusListener): () => void {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(listener);

    return () => {
      const set = listeners.get(event);
      if (set) {
        set.delete(listener);
        if (set.size === 0) listeners.delete(event);
      }
    };
  }

  return { emit, on };
}

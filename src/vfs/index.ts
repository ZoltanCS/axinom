export type VFSNodeType = 'file' | 'directory';

export interface VFSFile {
  type: 'file';
  name: string;
  content: string;
  createdAt: number;
  modifiedAt: number;
}

export interface VFSDirectory {
  type: 'directory';
  name: string;
  children: Record<string, VFSNode>;
  createdAt: number;
}

export type VFSNode = VFSFile | VFSDirectory;

const STORAGE_KEY = 'AXINOM_VFS';

function createFile(name: string, content = ''): VFSFile {
  const now = Date.now();
  return { type: 'file', name, content, createdAt: now, modifiedAt: now };
}

function createDirectory(name: string): VFSDirectory {
  return { type: 'directory', name, children: {}, createdAt: Date.now() };
}

function buildDefaultFS(): VFSDirectory {
  const root = createDirectory('/');
  root.children['sys'] = createDirectory('sys');
  (root.children['sys'] as VFSDirectory).children['bin'] = createDirectory('bin');
  (root.children['sys'] as VFSDirectory).children['config'] = createDirectory('config');

  root.children['home'] = createDirectory('home');
  const home = root.children['home'] as VFSDirectory;
  home.children['user'] = createDirectory('user');
  const user = home.children['user'] as VFSDirectory;
  user.children['desktop'] = createDirectory('desktop');
  user.children['documents'] = createDirectory('documents');
  user.children['pictures'] = createDirectory('pictures');

  const desktop = user.children['desktop'] as VFSDirectory;
  desktop.children['welcome.txt'] = createFile(
    'welcome.txt',
    '=== AXINOM SYSTEM ===\n\nWelcome to the AXINOM Web Desktop Environment.\nThis is a brutalist geometric minimalist operating system.\n\nNavigate using the terminal or desktop applications.\n\n[SYSTEM BUILD: 1.0.0]\n[KERNEL: AXI-CORE]\n'
  );
  desktop.children['readme.txt'] = createFile(
    'readme.txt',
    'AXINOM FILE SYSTEM\n------------------\nAll files are stored in the Virtual File System (VFS).\nUse AXI_TERMINAL to navigate: ls, cd, cat, rm\nUse AXI_EDITOR to create and edit files.\n'
  );

  const docs = user.children['documents'] as VFSDirectory;
  docs.children['notes.txt'] = createFile(
    'notes.txt',
    'SYSTEM NOTES\n============\n- VFS is persisted to localStorage\n- All apps communicate via EventBus\n- Windows support drag, resize, minimize, maximize\n'
  );

  root.children['tmp'] = createDirectory('tmp');

  return root;
}

function resolvePath(root: VFSDirectory, path: string): { parent: VFSDirectory; name: string; node: VFSNode | null } | null {
  const normalized = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  if (normalized === '/') {
    return { parent: root, name: '/', node: root };
  }

  const parts = normalized.split('/').filter(Boolean);
  let current: VFSDirectory = root;

  for (let i = 0; i < parts.length - 1; i++) {
    const child = current.children[parts[i]];
    if (!child || child.type !== 'directory') return null;
    current = child;
  }

  const targetName = parts[parts.length - 1];
  return {
    parent: current,
    name: targetName,
    node: current.children[targetName] || null,
  };
}

export class VirtualFileSystem {
  private root: VFSDirectory;
  private listeners: Array<() => void> = [];

  constructor() {
    this.root = this.load();
  }

  private load(): VFSDirectory {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as VFSDirectory;
      }
    } catch {
      // corrupt data, rebuild
    }
    return buildDefaultFS();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.root));
    this.listeners.forEach((fn) => fn());
  }

  subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  getRoot(): VFSDirectory {
    return this.root;
  }

  resolve(path: string): VFSNode | null {
    const result = resolvePath(this.root, path);
    return result?.node ?? null;
  }

  read(path: string): string | null {
    const node = this.resolve(path);
    if (!node || node.type !== 'file') return null;
    return node.content;
  }

  write(path: string, content: string): boolean {
    const result = resolvePath(this.root, path);
    if (!result) return false;

    if (result.node && result.node.type === 'file') {
      result.node.content = content;
      result.node.modifiedAt = Date.now();
    } else if (!result.node) {
      result.parent.children[result.name] = createFile(result.name, content);
    } else {
      return false; // trying to write to a directory
    }

    this.persist();
    return true;
  }

  mkdir(path: string): boolean {
    const result = resolvePath(this.root, path);
    if (!result || result.node) return false;
    result.parent.children[result.name] = createDirectory(result.name);
    this.persist();
    return true;
  }

  delete(path: string): boolean {
    const result = resolvePath(this.root, path);
    if (!result || !result.node || result.name === '/') return false;
    delete result.parent.children[result.name];
    this.persist();
    return true;
  }

  list(path: string): string[] | null {
    const node = this.resolve(path);
    if (!node || node.type !== 'directory') return null;
    return Object.keys(node.children);
  }

  listDetailed(path: string): Array<{ name: string; type: VFSNodeType }> | null {
    const node = this.resolve(path);
    if (!node || node.type !== 'directory') return null;
    return Object.values(node.children).map((child) => ({
      name: child.name,
      type: child.type,
    }));
  }

  exists(path: string): boolean {
    return this.resolve(path) !== null;
  }

  isDirectory(path: string): boolean {
    const node = this.resolve(path);
    return node != null && node.type === 'directory';
  }

  isFile(path: string): boolean {
    const node = this.resolve(path);
    return node != null && node.type === 'file';
  }

  reset(): void {
    this.root = buildDefaultFS();
    this.persist();
  }
}

export const vfs = new VirtualFileSystem();

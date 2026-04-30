import { useState, useCallback } from 'react';

interface AppItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  installed: boolean;
  size: string;
  rating: number;
}

const APP_STORE_ITEMS: AppItem[] = [
  { id: 'terminal', name: 'Terminal', description: 'Command-line interface for system access', category: 'System', icon: '>_', installed: true, size: '2.1 MB', rating: 4.8 },
  { id: 'editor', name: 'Editor', description: 'Text and code editor with syntax highlighting', category: 'Productivity', icon: '¶', installed: true, size: '3.5 MB', rating: 4.6 },
  { id: 'canvas', name: 'Canvas', description: 'Digital drawing and painting application', category: 'Creative', icon: '◩', installed: true, size: '5.2 MB', rating: 4.5 },
  { id: 'navigator', name: 'Navigator', description: 'Web browser simulator', category: 'Internet', icon: '◎', installed: true, size: '8.1 MB', rating: 4.3 },
  { id: 'files', name: 'Files', description: 'File manager for virtual file system', category: 'System', icon: '▣', installed: true, size: '4.0 MB', rating: 4.7 },
  { id: 'taskmanager', name: 'Task Manager', description: 'Monitor and manage running processes', category: 'System', icon: '▥', installed: true, size: '2.8 MB', rating: 4.9 },
  { id: 'settings', name: 'Settings', description: 'System configuration and customization', category: 'System', icon: '⚙', installed: true, size: '3.2 MB', rating: 4.8 },
  { id: 'calculator', name: 'Calculator', description: 'Scientific calculator with history', category: 'Utilities', icon: '🔢', installed: true, size: '1.5 MB', rating: 4.7 },
  { id: 'calendar', name: 'Calendar', description: 'Schedule and event management', category: 'Productivity', icon: '📅', installed: true, size: '2.9 MB', rating: 4.6 },
  { id: 'mediaplayer', name: 'Media Player', description: 'Audio and video playback', category: 'Media', icon: '🎵', installed: true, size: '6.4 MB', rating: 4.5 },
  { id: 'imageviewer', name: 'Image Viewer', description: 'Photo gallery and image viewer', category: 'Media', icon: '🖼️', installed: true, size: '3.1 MB', rating: 4.4 },
  { id: 'network', name: 'Network', description: 'Network settings and monitoring', category: 'System', icon: '📶', installed: true, size: '2.3 MB', rating: 4.6 },
  { id: 'help', name: 'Help Center', description: 'Documentation and support', category: 'System', icon: '❓', installed: true, size: '1.8 MB', rating: 4.8 },
  { id: 'weather', name: 'Weather', description: 'Live weather forecasts and alerts', category: 'Utilities', icon: '🌤️', installed: false, size: '4.2 MB', rating: 4.5 },
  { id: 'notes', name: 'Notes', description: 'Quick note-taking with sync', category: 'Productivity', icon: '📝', installed: false, size: '2.1 MB', rating: 4.7 },
  { id: 'music', name: 'Music Studio', description: 'Create and edit music tracks', category: 'Creative', icon: '🎹', installed: false, size: '45.0 MB', rating: 4.8 },
  { id: 'video', name: 'Video Editor', description: 'Professional video editing suite', category: 'Creative', icon: '🎬', installed: false, size: '128.0 MB', rating: 4.6 },
  { id: 'code', name: 'Code IDE', description: 'Full-featured development environment', category: 'Productivity', icon: '💻', installed: false, size: '85.0 MB', rating: 4.9 },
];

export function AXI_AppStore() {
  const [apps, setApps] = useState<AppItem[]>(APP_STORE_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [installingId, setInstallingId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(APP_STORE_ITEMS.map(a => a.category)))];

  const filteredApps = apps.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInstall = useCallback((appId: string) => {
    setInstallingId(appId);
    // Simulate installation
    setTimeout(() => {
      setApps(prev => prev.map(app => 
        app.id === appId ? { ...app, installed: true } : app
      ));
      setInstallingId(null);
    }, 2000);
  }, []);

  const handleUninstall = useCallback((appId: string) => {
    if (confirm('Are you sure you want to uninstall this app?')) {
      setApps(prev => prev.map(app => 
        app.id === appId ? { ...app, installed: false } : app
      ));
    }
  }, []);

  const installedCount = apps.filter(a => a.installed).length;
  const totalSize = apps.filter(a => a.installed).reduce((sum, a) => {
    const size = parseFloat(a.size);
    return sum + (a.size.includes('MB') ? size : size / 1000);
  }, 0);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0a0e1a', color: '#e2e8f0' }}>
      {/* Sidebar */}
      <div style={{ width: 240, borderRight: '1px solid rgba(148, 163, 184, 0.1)', padding: 16, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          App Store
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 16,
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 13,
          }}
        />

        {/* Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '10px 12px',
                textAlign: 'left' as const,
                background: selectedCategory === cat ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                color: selectedCategory === cat ? '#06b6d4' : '#94a3b8',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ 
          marginTop: 'auto',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Your Library</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{installedCount}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>apps installed</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>{totalSize.toFixed(1)} MB used</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
          {selectedCategory === 'All' ? 'All Apps' : selectedCategory}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280, 1fr))', gap: 16 }}>
          {filteredApps.map(app => (
            <div
              key={app.id}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              {/* App Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: app.installed ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(148, 163, 184, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {app.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{app.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{app.size}</div>
                </div>
                {app.installed && (
                  <div style={{ fontSize: 10, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 10 }}>
                    Installed
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, flex: 1 }}>
                {app.description}
              </div>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                <span style={{ color: '#fbbf24' }}>★</span>
                <span style={{ fontSize: 12 }}>{app.rating}</span>
              </div>

              {/* Action Button */}
              {app.installed ? (
                <button
                  onClick={() => handleUninstall(app.id)}
                  className="axi-btn"
                  style={{ fontSize: 12 }}
                >
                  Uninstall
                </button>
              ) : (
                <button
                  onClick={() => handleInstall(app.id)}
                  disabled={installingId === app.id}
                  style={{
                    padding: '10px 16px',
                    background: installingId === app.id 
                      ? 'rgba(148, 163, 184, 0.2)' 
                      : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: installingId === app.id ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {installingId === app.id ? 'Installing...' : 'Install'}
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 80, color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div>No apps found matching your search</div>
          </div>
        )}
      </div>
    </div>
  );
}

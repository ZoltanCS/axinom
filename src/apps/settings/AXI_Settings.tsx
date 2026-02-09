import { useState, useCallback } from 'react';
import { useKernel } from '../../kernel';
import { SYSTEM_LIMITS } from '../../styles/theme';

type SettingsTab = 'general' | 'appearance' | 'system' | 'about';

const WALLPAPER_PATTERNS = [
  { id: 'default', name: 'Aurora', gradient: 'radial-gradient(ellipse at 20% 50%, rgba(6, 182, 212, 0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 50%), linear-gradient(180deg, #020617 0%, #0f172a 100%)' },
  { id: 'ocean', name: 'Deep Ocean', gradient: 'radial-gradient(ellipse at 30% 70%, rgba(6, 182, 212, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(6, 182, 212, 0.08) 0%, transparent 50%), linear-gradient(180deg, #020617 0%, #0c4a6e 100%)' },
  { id: 'purple', name: 'Nebula', gradient: 'radial-gradient(ellipse at 40% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 60% 60%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), linear-gradient(180deg, #020617 0%, #1e1b4b 100%)' },
  { id: 'emerald', name: 'Matrix', gradient: 'radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), linear-gradient(180deg, #020617 0%, #022c22 100%)' },
  { id: 'rose', name: 'Sunset', gradient: 'radial-gradient(ellipse at 30% 30%, rgba(244, 63, 94, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(245, 158, 11, 0.06) 0%, transparent 50%), linear-gradient(180deg, #020617 0%, #1c1917 100%)' },
  { id: 'mono', name: 'Void', gradient: 'linear-gradient(180deg, #020617 0%, #020617 100%)' },
];

export function AXI_Settings() {
  const { state, vfs, eventBus } = useKernel();
  const [tab, setTab] = useState<SettingsTab>('general');
  const [selectedWallpaper, setSelectedWallpaper] = useState(() => localStorage.getItem('AXINOM_WALLPAPER') || 'default');

  const handleWallpaperChange = useCallback((id: string) => {
    setSelectedWallpaper(id);
    localStorage.setItem('AXINOM_WALLPAPER', id);
    eventBus.emit('settings:wallpaper', { id });
  }, [eventBus]);

  const handleResetVFS = useCallback(() => {
    if (confirm('Reset VFS? All files will be lost.')) { vfs.reset(); }
  }, [vfs]);

  const handleResetUser = useCallback(() => {
    if (confirm('Reset user data? You will need to set up again.')) {
      localStorage.removeItem('AXINOM_USER');
      localStorage.removeItem('AXINOM_PATTERN');
      eventBus.emit('system:reboot');
    }
  }, [eventBus]);

  const usedRam = state.processes.reduce((sum, p) => sum + p.ramMB, 0);

  const tabStyle = (t: SettingsTab): React.CSSProperties => ({
    padding: '10px 16px', cursor: 'pointer', borderRadius: 8,
    background: tab === t ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
    color: tab === t ? '#06b6d4' : '#64748b',
    fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
    transition: 'all 0.15s ease', border: 'none', textAlign: 'left' as const, width: '100%',
    display: 'block',
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0a0e1a', color: '#e2e8f0' }}>
      {/* Sidebar */}
      <div style={{ width: 180, borderRight: '1px solid rgba(148, 163, 184, 0.1)', padding: 12, display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, padding: '8px 16px', marginBottom: 8 }}>Settings</div>
        <button style={tabStyle('general')} onClick={() => setTab('general')}>General</button>
        <button style={tabStyle('appearance')} onClick={() => setTab('appearance')}>Appearance</button>
        <button style={tabStyle('system')} onClick={() => setTab('system')}>System</button>
        <button style={tabStyle('about')} onClick={() => setTab('about')}>About</button>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {tab === 'general' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>General</h2>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>User Profile</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
                  {(localStorage.getItem('AXINOM_USER') || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{localStorage.getItem('AXINOM_USER') || 'User'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Administrator</div>
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Quick Actions</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="axi-btn" style={{ fontSize: 12 }} onClick={handleResetVFS}>Reset File System</button>
                <button className="axi-btn" style={{ fontSize: 12 }} onClick={handleResetUser}>Reset User Data</button>
              </div>
            </div>
          </div>
        )}
        {tab === 'appearance' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Appearance</h2>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Wallpaper</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {WALLPAPER_PATTERNS.map((wp) => (
                  <div key={wp.id} onClick={() => handleWallpaperChange(wp.id)}
                    style={{
                      height: 80, borderRadius: 8, background: wp.gradient, cursor: 'pointer',
                      border: selectedWallpaper === wp.id ? '2px solid #06b6d4' : '2px solid rgba(148, 163, 184, 0.1)',
                      display: 'flex', alignItems: 'flex-end', padding: 8, transition: 'border-color 0.15s ease',
                    }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>{wp.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'system' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>System</h2>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Resource Monitor</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>RAM</span><span>{usedRam}MB / {SYSTEM_LIMITS.totalRAM}MB</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(148, 163, 184, 0.1)' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', width: `${Math.min(100, (usedRam / SYSTEM_LIMITS.totalRAM) * 100)}%`, transition: 'width 0.3s ease' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Processes</span><span>{state.processes.length}</span>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>Windows</span><span>{state.windows.length}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Storage</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                <div style={{ color: '#64748b' }}>VFS persisted to localStorage</div>
                <button className="axi-btn" style={{ fontSize: 11, marginTop: 8 }} onClick={handleResetVFS}>Clear Storage</button>
              </div>
            </div>
          </div>
        )}
        {tab === 'about' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>About</h2>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div className="axi-gradient-text" style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>AXINOM</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>Web Desktop Environment v2.0</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#94a3b8', lineHeight: 2 }}>
                <div>Kernel: AXI-CORE 2.0</div>
                <div>UI: Premium Futurism</div>
                <div>Renderer: React + Framer Motion</div>
                <div>Build: Vite + TypeScript</div>
                <div>Styles: Tailwind CSS v4</div>
              </div>
              <div style={{ marginTop: 20, fontSize: 11, color: '#475569' }}>Axinom Systems Corp. All rights reserved.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

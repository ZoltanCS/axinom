import { useState, useCallback } from 'react';

interface NetworkInfo {
  ssid: string;
  connected: boolean;
  signal: number;
  secured: boolean;
}

const AVAILABLE_NETWORKS: NetworkInfo[] = [
  { ssid: 'Home_Network_5G', connected: true, signal: 90, secured: true },
  { ssid: 'Office_WiFi', connected: false, signal: 75, secured: true },
  { ssid: 'Guest_Network', connected: false, signal: 60, secured: true },
  { ssid: 'Public_Hotspot', connected: false, signal: 45, secured: false },
  { ssid: 'Neighbor_AP', connected: false, signal: 30, secured: true },
];

export function AXI_Network() {
  const [networks, setNetworks] = useState<NetworkInfo[]>(AVAILABLE_NETWORKS);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');

  const handleConnect = useCallback((ssid: string) => {
    if (!wifiEnabled) return;
    
    setNetworks(prev => prev.map(n => ({
      ...n,
      connected: n.ssid === ssid,
    })));
    setShowPassword(null);
    setPasswordInput('');
  }, [wifiEnabled]);

  const handleDisconnect = useCallback(() => {
    setNetworks(prev => prev.map(n => ({
      ...n,
      connected: false,
    })));
  }, []);

  const requestConnection = useCallback((ssid: string, secured: boolean) => {
    if (!secured) {
      handleConnect(ssid);
    } else {
      setShowPassword(ssid);
      setPasswordInput('');
    }
  }, [handleConnect]);

  const submitPassword = useCallback(() => {
    if (showPassword && passwordInput.length >= 8) {
      handleConnect(showPassword);
    }
  }, [showPassword, passwordInput, handleConnect]);

  const getSignalIcon = (signal: number) => {
    if (signal >= 80) return '📶';
    if (signal >= 50) return '📵';
    if (signal >= 20) return '📴';
    return '📳';
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0a0e1a', color: '#e2e8f0' }}>
      {/* Sidebar */}
      <div style={{ width: 200, borderRight: '1px solid rgba(148, 163, 184, 0.1)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Network</div>
        <button className="axi-btn" style={{ justifyContent: 'flex-start' }}>📶 Wi-Fi</button>
        <button className="axi-btn" style={{ justifyContent: 'flex-start', opacity: 0.5 }}>🔌 Ethernet</button>
        <button className="axi-btn" style={{ justifyContent: 'flex-start', opacity: 0.5 }}>📱 Bluetooth</button>
        <button className="axi-btn" style={{ justifyContent: 'flex-start', opacity: 0.5 }}>✈️ Airplane Mode</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 24 }}>
        {/* WiFi Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24,
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 12,
          padding: 16,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Wi-Fi</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {wifiEnabled ? 'Connected to ' + networks.find(n => n.connected)?.ssid : 'Wi-Fi is turned off'}
            </div>
          </div>
          <button
            onClick={() => setWifiEnabled(!wifiEnabled)}
            style={{
              width: 56,
              height: 28,
              borderRadius: 14,
              background: wifiEnabled ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(148, 163, 184, 0.2)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s ease',
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 3,
              left: wifiEnabled ? 31 : 3,
              transition: 'left 0.2s ease',
            }} />
          </button>
        </div>

        {/* Available Networks */}
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Available Networks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {networks.map(network => (
            <div
              key={network.ssid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                background: network.connected ? 'rgba(6, 182, 212, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                border: network.connected ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 12,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>
                  {getSignalIcon(network.signal)}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{network.ssid}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {network.secured ? '🔒 Secured' : '⚠️ Open'} • {network.signal}% signal
                  </div>
                </div>
              </div>
              <div>
                {network.connected ? (
                  <button onClick={handleDisconnect} className="axi-btn" style={{ fontSize: 12 }}>
                    Disconnect
                  </button>
                ) : (
                  <button 
                    onClick={() => requestConnection(network.ssid, network.secured)} 
                    className="axi-btn" 
                    style={{ fontSize: 12, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none' }}
                    disabled={!wifiEnabled}
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Connection Details */}
        {networks.find(n => n.connected) && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Connection Details</div>
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.6)', 
              borderRadius: 12, 
              padding: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Network Name</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                  {networks.find(n => n.connected)?.ssid}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>IP Address</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>192.168.1.105</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Subnet Mask</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>255.255.255.0</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Gateway</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>192.168.1.1</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>DNS Server</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>8.8.8.8</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>MAC Address</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>AA:BB:CC:DD:EE:FF</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPassword && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 16,
            padding: 24,
            width: 360,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Enter Password</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Enter the password for "{showPassword}"
            </div>
            
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: 12,
                marginBottom: 16,
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 14,
              }}
            />
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => { setShowPassword(null); setPasswordInput(''); }}
                className="axi-btn"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={submitPassword}
                className="axi-btn"
                style={{ flex: 1, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none' }}
                disabled={passwordInput.length < 8}
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

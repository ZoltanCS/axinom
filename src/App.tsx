import { useState, useCallback, useEffect } from 'react';
import { KernelProvider, useKernel } from './kernel';
import { AXI_Boot, AXI_Setup, AXI_Login } from './lifecycle';
import { AXI_Desktop } from './shell/AXI_Desktop';

type SystemPhase = 'boot' | 'setup' | 'login' | 'desktop';

const STORAGE_KEY_USER = 'AXINOM_USER';
const STORAGE_KEY_PATTERN = 'AXINOM_PATTERN';

function getUserData(): { username: string; pattern: number[] } | null {
  try {
    const username = localStorage.getItem(STORAGE_KEY_USER);
    const patternStr = localStorage.getItem(STORAGE_KEY_PATTERN);
    if (username && patternStr) {
      return { username, pattern: JSON.parse(patternStr) };
    }
  } catch {
    // corrupt
  }
  return null;
}

function SystemOrchestrator() {
  const { eventBus } = useKernel();
  const [phase, setPhase] = useState<SystemPhase>('boot');
  const [userData, setUserData] = useState<{ username: string; pattern: number[] } | null>(null);

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, []);

  // Listen for reboot
  useEffect(() => {
    const unsub = eventBus.on('system:reboot', () => {
      setPhase('boot');
    });
    return unsub;
  }, [eventBus]);

  const handleBootComplete = useCallback(() => {
    const data = getUserData();
    if (data) {
      setUserData(data);
      setPhase('login');
    } else {
      setPhase('setup');
    }
  }, []);

  const handleSetupComplete = useCallback((username: string, pattern: number[]) => {
    localStorage.setItem(STORAGE_KEY_USER, username);
    localStorage.setItem(STORAGE_KEY_PATTERN, JSON.stringify(pattern));
    setUserData({ username, pattern });
    setPhase('login');
  }, []);

  const handleLogin = useCallback(() => {
    setPhase('desktop');
  }, []);

  switch (phase) {
    case 'boot':
      return <AXI_Boot onComplete={handleBootComplete} />;
    case 'setup':
      return <AXI_Setup onComplete={handleSetupComplete} />;
    case 'login':
      return userData ? (
        <AXI_Login username={userData.username} pattern={userData.pattern} onLogin={handleLogin} />
      ) : (
        <AXI_Boot onComplete={handleBootComplete} />
      );
    case 'desktop':
      return <AXI_Desktop />;
  }
}

export default function App() {
  return (
    <KernelProvider>
      <SystemOrchestrator />
    </KernelProvider>
  );
}

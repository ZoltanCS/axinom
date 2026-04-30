import { useState, useRef, useCallback } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url?: string;
}

const DEMO_TRACKS: Track[] = [
  { id: '1', title: 'Ambient Flow', artist: 'AXINOM Audio', duration: 185 },
  { id: '2', title: 'Digital Dreams', artist: 'AXINOM Audio', duration: 243 },
  { id: '3', title: 'Neon Nights', artist: 'AXINOM Audio', duration: 198 },
  { id: '4', title: 'Cyber Pulse', artist: 'AXINOM Audio', duration: 267 },
];

export function AXI_MediaPlayer() {
  const [tracks] = useState<Track[]>(DEMO_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const play = useCallback(() => {
    setIsPlaying(true);
    intervalRef.current = window.setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= currentTrack.duration) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  }, [currentTrack.duration]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const handleNext = useCallback(() => {
    setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
    setCurrentTime(0);
  }, [tracks.length]);

  const handlePrev = useCallback(() => {
    setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  }, [tracks.length]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  }, []);

  const selectTrack = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  // Cleanup on unmount
  useState(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0a0e1a', color: '#e2e8f0' }}>
      {/* Main Player */}
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column' }}>
        {/* Album Art */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}>
          <div style={{
            width: 220,
            height: 220,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${isPlaying ? '#06b6d4' : '#334155'}, #1e293b)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isPlaying ? '0 0 60px rgba(6, 182, 212, 0.3)' : 'none',
            transition: 'all 0.3s ease',
            animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none',
          }}>
            <div style={{ fontSize: 80, opacity: 0.3 }}>🎵</div>
          </div>
        </div>

        {/* Track Info */}
        <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{currentTrack.title}</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>{currentTrack.artist}</div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="range"
            min={0}
            max={currentTrack.duration}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: '100%',
              height: 6,
              borderRadius: 3,
              background: 'rgba(148, 163, 184, 0.2)',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginTop: 8 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
          <button onClick={handlePrev} className="axi-btn" style={{ width: 44, height: 44, borderRadius: '50%' }}>⏮</button>
          <button 
            onClick={togglePlayPause}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={handleNext} className="axi-btn" style={{ width: 44, height: 44, borderRadius: '50%' }}>⏭</button>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16 }}>🔈</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: 'rgba(148, 163, 184, 0.2)',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
            }}
          />
          <span style={{ fontSize: 12, color: '#64748b', width: 40 }}>{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div style={{
          width: 280,
          borderLeft: '1px solid rgba(148, 163, 184, 0.1)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Playlist</div>
            <button onClick={() => setShowPlaylist(false)} className="axi-btn" style={{ padding: '4px 8px', fontSize: 12 }}>Hide</button>
          </div>
          
          <div style={{ flex: 1, overflow: 'auto' }}>
            {tracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => selectTrack(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: index === currentTrackIndex ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  border: index === currentTrackIndex ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  background: index === currentTrackIndex && isPlaying ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(148, 163, 184, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {index === currentTrackIndex && isPlaying ? '🎵' : '♪'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{track.artist}</div>
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{formatTime(track.duration)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showPlaylist && (
        <button
          onClick={() => setShowPlaylist(true)}
          className="axi-btn"
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
            zIndex: 10,
          }}
        >
          Show Playlist
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}

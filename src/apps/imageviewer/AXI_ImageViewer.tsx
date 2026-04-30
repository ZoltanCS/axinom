import { useState, useCallback } from 'react';

const DEMO_IMAGES = [
  { id: '1', name: 'Aurora Borealis', url: '', color: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)' },
  { id: '2', name: 'Mountain Peak', url: '', color: 'linear-gradient(135deg, #475569, #94a3b8, #cbd5e1)' },
  { id: '3', name: 'Ocean Sunset', url: '', color: 'linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)' },
  { id: '4', name: 'Forest Mist', url: '', color: 'linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)' },
  { id: '5', name: 'Desert Dunes', url: '', color: 'linear-gradient(135deg, #f59e0b, #d97706, #b45309)' },
  { id: '6', name: 'Night Sky', url: '', color: 'linear-gradient(135deg, #1e293b, #334155, #475569)' },
];

export function AXI_ImageViewer() {
  const [images] = useState(DEMO_IMAGES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(true);

  const currentImage = images[currentIndex];

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    setZoom(1);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
    setZoom(1);
  }, [images.length]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0a0e1a', color: '#e2e8f0' }}>
      {/* Main Image View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{currentImage.name}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleZoomOut} className="axi-btn" title="Zoom Out">−</button>
            <span style={{ fontSize: 12, color: '#64748b', padding: '4px 8px' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="axi-btn" title="Zoom In">+</button>
            <button onClick={handleResetZoom} className="axi-btn" title="Reset Zoom">⊡</button>
            <div style={{ width: 1, background: 'rgba(148, 163, 184, 0.2)', margin: '0 4px' }} />
            <button onClick={() => setShowThumbnails(!showThumbnails)} className="axi-btn" title="Toggle Thumbnails">▦</button>
          </div>
        </div>

        {/* Image Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div
            style={{
              width: 400,
              height: 300,
              borderRadius: 12,
              background: currentImage.color,
              transform: `scale(${zoom})`,
              transition: 'transform 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ fontSize: 80, opacity: 0.3 }}>🖼️</div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            ◀
          </button>
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            ▶
          </button>
        </div>

        {/* Info Bar */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#64748b',
        }}>
          <span>Image {currentIndex + 1} of {images.length}</span>
          <span>Demo Mode - Placeholder Images</span>
        </div>
      </div>

      {/* Thumbnails Panel */}
      {showThumbnails && (
        <div style={{
          width: 200,
          borderLeft: '1px solid rgba(148, 163, 184, 0.1)',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Gallery</div>
          <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoom(1);
                }}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  background: image.color,
                  border: index === currentIndex ? '2px solid #06b6d4' : '2px solid transparent',
                  cursor: 'pointer',
                  padding: 0,
                  position: 'relative',
                }}
              >
                {index === currentIndex && (
                  <div style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#06b6d4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                  }}>
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

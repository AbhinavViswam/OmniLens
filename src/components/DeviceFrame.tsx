import React, { useState, useRef, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Grid3X3, 
  Maximize2, 
  RotateCw, 
  RefreshCw, 
  X, 
  ShieldAlert, 
  Globe,
  ExternalLink
} from 'lucide-react';

interface Device {
  key: string;
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'custom';
}

interface DeviceFrameProps {
  device: Device;
  url: string;
  isLandscape: boolean;
  onRotate: (key: string) => void;
  onRemove: (key: string) => void;
  onResizeCustom?: (width: number, height: number) => void;
  isFocused: boolean;
  onFocusToggle: (key: string) => void;
}

export default function DeviceFrame({
  device,
  url,
  isLandscape,
  onRotate,
  onRemove,
  onResizeCustom,
  isFocused,
  onFocusToggle
}: DeviceFrameProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [gridActive, setGridActive] = useState(false);
  const [currentTime, setCurrentTime] = useState('09:41');
  const [showWarning, setShowWarning] = useState(true);
  
  const resizeRef = useRef<{ type: 'r' | 'b' | 'both'; startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Update clock time dynamically
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // 12-hour format
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  // Determine iframe source path
  const iframeSrc = url;

  // Custom frame dimensions
  const finalWidth = isLandscape ? device.height : device.width;
  const finalHeight = isLandscape ? device.width : device.height;

  // Resize Handlers for Custom Screen
  const handleResizeStart = (e: React.MouseEvent, type: 'r' | 'b' | 'both') => {
    e.preventDefault();
    e.stopPropagation();
    
    resizeRef.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startW: device.width,
      startH: device.height
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizeRef.current || !onResizeCustom) return;
    const { type, startX, startY, startW, startH } = resizeRef.current;
    
    let newWidth = startW;
    let newHeight = startH;

    if (type === 'r' || type === 'both') {
      const deltaX = e.clientX - startX;
      // Adjust resize factor for landscape mode
      newWidth = Math.max(280, Math.min(2500, startW + (isLandscape ? 0 : deltaX)));
      if (isLandscape) {
        newHeight = Math.max(280, Math.min(2000, startH + deltaX));
      }
    }

    if (type === 'b' || type === 'both') {
      const deltaY = e.clientY - startY;
      newHeight = Math.max(280, Math.min(2000, startH + (isLandscape ? 0 : deltaY)));
      if (isLandscape) {
        newWidth = Math.max(280, Math.min(2500, startW + deltaY));
      }
    }

    if (isLandscape) {
      // Swap back when updating state
      onResizeCustom(newHeight, newWidth);
    } else {
      onResizeCustom(newWidth, newHeight);
    }
  };

  const handleResizeEnd = () => {
    resizeRef.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Render Bezel wrapper
  const renderHardwareBezel = (content: React.ReactNode) => {
    const bezelClass = isLandscape ? 'landscape' : '';
    const gridClass = gridActive ? 'grid-overlay-active' : '';

    switch (device.type) {
      case 'mobile':
        return (
          <div className={`bezel-iphone15pro ${bezelClass} ${gridClass}`}>
            <div className="dynamic-island"></div>
            {/* Status bar */}
            <div className="sim-status-bar">
              <div className="sim-status-left">
                <span>{currentTime.split(' ')[0]}</span>
              </div>
              <div className="sim-status-right" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wifi size={10} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Battery size={11} />
                  <span>85%</span>
                </div>
              </div>
            </div>
            <div className="device-screen-wrapper" style={{ width: `${finalWidth}px`, height: `${finalHeight - 22}px` }}>
              <div className="grid-overlay-helper"></div>
              {content}
            </div>
          </div>
        );

      case 'tablet':
        return (
          <div className={`bezel-ipadpro ${bezelClass} ${gridClass}`}>
            <div className="camera-dot"></div>
            <div className="sim-status-bar" style={{ background: '#1c1917', borderBottom: '1px solid #292524' }}>
              <div className="sim-status-left" style={{ fontSize: '10px' }}>
                <span>{currentTime}</span>
              </div>
              <div className="sim-status-right" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Wifi size={11} />
                  <span>Wi-Fi</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Battery size={12} />
                  <span>92%</span>
                </div>
              </div>
            </div>
            <div className="device-screen-wrapper" style={{ width: `${finalWidth}px`, height: `${finalHeight - 22}px` }}>
              <div className="grid-overlay-helper"></div>
              {content}
            </div>
          </div>
        );

      case 'laptop':
        return (
          <div className={`bezel-macbook ${gridClass}`}>
            <div className="macbook-screen">
              <div className="device-screen-wrapper" style={{ width: `${finalWidth}px`, height: `${finalHeight}px` }}>
                <div className="camera-notch"></div>
                <div className="grid-overlay-helper"></div>
                {content}
              </div>
            </div>
            <div className="macbook-base">
              <div className="macbook-lip"></div>
            </div>
          </div>
        );

      case 'desktop':
        return (
          <div className={`bezel-desktop ${gridClass}`}>
            <div className="monitor-glass">
              <div className="device-screen-wrapper" style={{ width: `${finalWidth}px`, height: `${finalHeight}px` }}>
                <div className="grid-overlay-helper"></div>
                {content}
              </div>
              <div className="monitor-chin">
                <div className="chin-logo"></div>
              </div>
            </div>
            <div className="monitor-stand"></div>
            <div className="monitor-stand-base"></div>
          </div>
        );

      case 'custom':
        return (
          <div className={`bezel-custom ${gridClass}`} style={{ position: 'relative' }}>
            <div className="device-screen-wrapper" style={{ width: `${finalWidth}px`, height: `${finalHeight}px` }}>
              <div className="grid-overlay-helper"></div>
              {content}
            </div>
            {/* Custom handles */}
            <div className="resize-handle resize-right" onMouseDown={(e) => handleResizeStart(e, 'r')}></div>
            <div className="resize-handle resize-bottom" onMouseDown={(e) => handleResizeStart(e, 'b')}></div>
            <div className="resize-handle resize-both" onMouseDown={(e) => handleResizeStart(e, 'both')}></div>
          </div>
        );

      default:
        return (
          <div className="device-screen-wrapper" style={{ width: `${finalWidth}px`, height: `${finalHeight}px` }}>
            {content}
          </div>
        );
    }
  };

  const isExternalUrl = url !== '' && !url.includes('localhost') && !url.includes('127.0.0.1');

  return (
    <div className={`device-card-container ${isFocused ? 'focus-active' : ''}`}>
      {/* Top Individual Frame Control Strip */}
      <div className="device-top-controls" style={{ width: `${finalWidth + (device.type === 'mobile' ? 24 : device.type === 'tablet' ? 36 : device.type === 'laptop' ? 20 : device.type === 'desktop' ? 12 : 12)}px` }}>
        <div className="device-meta">
          <span className="device-meta-name">{device.name}</span>
          <span className="device-meta-dim">
            {finalWidth} × {finalHeight}px ({device.type})
          </span>
        </div>
        
        <div className="device-action-buttons" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {/* Grid Toggle */}
          <button 
            className={`device-act-btn ${gridActive ? 'active' : ''}`} 
            onClick={() => setGridActive(prev => !prev)}
            title="Toggle Grid Overlay"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Grid3X3 size={14} />
          </button>
          
          {/* Focus Toggle */}
          <button 
            className={`device-act-btn ${isFocused ? 'active' : ''}`} 
            onClick={() => onFocusToggle(device.key)}
            title={isFocused ? "Exit Focus Mode" : "Focus Screen"}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Maximize2 size={13} />
          </button>

          {/* Orientation Toggle (if not laptop/desktop) */}
          {device.type !== 'laptop' && device.type !== 'desktop' && (
            <button 
              className={`device-act-btn ${isLandscape ? 'active' : ''}`} 
              onClick={() => onRotate(device.key)}
              title="Rotate Device"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RotateCw size={13} />
            </button>
          )}

          {/* Reload Iframe */}
          <button 
            className="device-act-btn" 
            onClick={handleRefresh} 
            title="Reload Page"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RefreshCw size={13} />
          </button>

          {/* Open in New Tab */}
          <button 
            className="device-act-btn" 
            onClick={() => window.open(url, '_blank')} 
            title="Open in New Tab"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={!url}
          >
            <ExternalLink size={13} />
          </button>

          {/* Remove Device */}
          <button 
            className="device-act-btn" 
            onClick={() => onRemove(device.key)} 
            title="Remove Screen" 
            style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* hardware bezel structure wraps the iframe */}
      {renderHardwareBezel(
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {url === '' ? (
            <div className="iframe-fallback-overlay" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)' }}>
              <div className="fallback-icon" style={{ animation: 'none', background: 'var(--accent-light)', color: 'var(--accent-color)' }}>
                <Globe size={22} />
              </div>
              <h4 className="fallback-title">Enter URL or Local Address</h4>
              <p className="fallback-desc" style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                Please enter a URL or local dev address (e.g. <code>localhost:5173</code>) in the address bar at the top to start responsive previewing.
              </p>
            </div>
          ) : (
            <>
              {/* CORS Fallback banner */}
              {isExternalUrl && showWarning && (
                <div className="iframe-fallback-overlay">
                  <div className="fallback-icon" style={{ animation: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                    <ShieldAlert size={22} />
                  </div>
                  <h4 className="fallback-title">Frame Security Protection</h4>
                  <p className="fallback-desc">
                    If the site appears blank, {url} restricts iframe embeds via <code>X-Frame-Options</code> policies.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', alignItems: 'center' }}>
                    <button className="fallback-btn" onClick={() => setShowWarning(false)}>
                      Continue to URL anyway
                    </button>
                  </div>
                </div>
              )}

              <iframe
                key={iframeKey}
                src={iframeSrc}
                className="device-iframe"
                title={`${device.name} simulator`}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import DeviceSelector from './components/DeviceSelector';
import DeviceFrame from './components/DeviceFrame';
import { PanelLeft, HelpCircle, Lightbulb, Sparkles, Terminal, ShieldAlert, X } from 'lucide-react';
import './App.css';

interface Device {
  key: string;
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'custom';
}

const INITIAL_DEVICES: Device[] = [
  { key: 'iphone15pro', name: 'iPhone 15 Pro', width: 393, height: 852, type: 'mobile' },
  { key: 'ipadpro', name: 'iPad Pro 11"', width: 834, height: 1194, type: 'tablet' },
  { key: 'macbookair', name: 'MacBook Air', width: 1280, height: 832, type: 'laptop' },
  { key: 'custom', name: 'Custom Resizable', width: 800, height: 600, type: 'custom' },
  { key: 'galaxys24', name: 'Galaxy S24', width: 360, height: 800, type: 'mobile' },
  { key: 'iphonese', name: 'iPhone SE (Classic)', width: 375, height: 667, type: 'mobile' },
  { key: 'ipadmini', name: 'iPad Mini', width: 744, height: 1133, type: 'tablet' },
  { key: 'desktopimac', name: 'iMac Monitor 24"', width: 1920, height: 1080, type: 'desktop' },
];

export default function App() {
  // Previewer UI States
  const [url, setUrl] = useState('');
  const [zoom, setZoom] = useState(0.75);
  const [layout, setLayout] = useState<'grid' | 'row' | 'focus'>('row');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Viewport Profile Library
  const [devicesList, setDevicesList] = useState<Device[]>(INITIAL_DEVICES);
  const [activeDevices, setActiveDevices] = useState<string[]>(['macbookair']);
  const [focusedDeviceKey, setFocusedDeviceKey] = useState<string | null>(null);

  // Orientation and Custom Dimensions
  const [deviceSettings, setDeviceSettings] = useState<Record<string, { isLandscape: boolean }>>({
    iphone15pro: { isLandscape: false },
    galaxys24: { isLandscape: false },
    iphonese: { isLandscape: false },
    ipadpro: { isLandscape: false },
    ipadmini: { isLandscape: false },
    custom: { isLandscape: false },
  });

  const [customDimensions, setCustomDimensions] = useState({ width: 800, height: 600 });

  // Panning/Workspace Drag Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Sync scroll percentage listener
  useEffect(() => {
    const handleScrollSyncMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PREVIEWER_SCROLL_SEND') {
        const { percent } = e.data;

        // Broadcast scroll coordinates to ALL active same-origin iframe instances
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'PREVIEWER_SCROLL_SYNC',
              percent
            }, '*');
          }
        });
      }
    };

    window.addEventListener('message', handleScrollSyncMessage);
    return () => window.removeEventListener('message', handleScrollSyncMessage);
  }, []);

  // Load and apply theme HTML attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Adjust zoom magnification wheel
  const handleZoom = (newZoom: number) => {
    setZoom(Math.max(0.25, Math.min(1.5, Number(newZoom.toFixed(2)))));
  };

  // Switch categories quick-presets
  const handleSelectPresets = (category: 'all' | 'mobiles' | 'tablets' | 'desktops' | 'none') => {
    switch (category) {
      case 'all':
        setActiveDevices(devicesList.map(d => d.key));
        break;
      case 'mobiles':
        setActiveDevices(devicesList.filter(d => d.type === 'mobile' || d.key === 'custom').map(d => d.key));
        break;
      case 'tablets':
        setActiveDevices(devicesList.filter(d => d.type === 'tablet' || d.key === 'custom').map(d => d.key));
        break;
      case 'desktops':
        setActiveDevices(devicesList.filter(d => d.type === 'laptop' || d.type === 'desktop' || d.key === 'custom').map(d => d.key));
        break;
      case 'none':
        setActiveDevices([]);
        setFocusedDeviceKey(null);
        break;
    }
  };

  // Add customized viewports
  const handleAddCustomDevice = (name: string, width: number, height: number) => {
    const key = `custom-${Date.now()}`;
    const newDevice: Device = {
      key,
      name: `⚙️ ${name}`,
      width,
      height,
      type: 'custom'
    };
    setDevicesList(prev => [...prev, newDevice]);
    setActiveDevices(prev => [...prev, key]);
    setDeviceSettings(prev => ({
      ...prev,
      [key]: { isLandscape: false }
    }));
  };

  // Toggle single device activity status
  const handleToggleDevice = (key: string) => {
    setActiveDevices(prev => {
      const isCurrentlyActive = prev.includes(key);
      if (isCurrentlyActive) {
        if (focusedDeviceKey === key) {
          setFocusedDeviceKey(null);
        }
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Rotate orientation
  const handleRotateDevice = (key: string) => {
    setDeviceSettings(prev => ({
      ...prev,
      [key]: {
        isLandscape: !prev[key]?.isLandscape
      }
    }));
  };

  // Remove viewport frame
  const handleRemoveDevice = (key: string) => {
    setActiveDevices(prev => prev.filter(k => k !== key));
    if (focusedDeviceKey === key) {
      setFocusedDeviceKey(null);
    }
  };

  // Custom canvas dimension slider modifiers
  const handleUpdateCustomDimensions = (width: number, height: number) => {
    setCustomDimensions({ width, height });
    setDevicesList(prev => prev.map(d => d.key === 'custom' ? { ...d, width, height } : d));
  };

  // Handle stage focused centering
  const handleFocusToggle = (key: string) => {
    if (focusedDeviceKey === key) {
      setFocusedDeviceKey(null);
    } else {
      setFocusedDeviceKey(key);
      setLayout('focus');
    }
  };

  const handleLayoutChange = (newLayout: 'grid' | 'row' | 'focus') => {
    setLayout(newLayout);
    if (newLayout !== 'focus') {
      setFocusedDeviceKey(null);
    } else if (activeDevices.length > 0 && !focusedDeviceKey) {
      setFocusedDeviceKey(activeDevices[0]); // default to first active device
    }
  };

  // Interactive figma-style panning controls
  const handleCanvasDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    const target = e.target as HTMLElement;
    if (!target.classList.contains('canvas-container') && !target.classList.contains('canvas-workspace')) {
      return; // prevent pan trigger on input elements or iframes
    }

    setIsDragging(true);
    if (canvasContainerRef.current) {
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: canvasContainerRef.current.scrollLeft,
        scrollTop: canvasContainerRef.current.scrollTop
      });
    }
  };

  const handleCanvasDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasContainerRef.current) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    canvasContainerRef.current.scrollLeft = dragStart.scrollLeft - deltaX;
    canvasContainerRef.current.scrollTop = dragStart.scrollTop - deltaY;
  };

  const handleCanvasDragEnd = () => {
    setIsDragging(false);
  };

  // Auto center scroll workspace container at initial load
  useEffect(() => {
    if (canvasContainerRef.current) {
      const container = canvasContainerRef.current;
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
    }
  }, []);

  return (
    <div className="app-container">
      {/* 1. Header Toolbar Controls */}
      <ControlPanel
        url={url}
        onChangeUrl={setUrl}
        zoom={zoom}
        onZoomChange={handleZoom}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        theme={theme}
        onThemeToggle={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(prev => !prev)}
      />

      {/* 2. Main Canvas Body */}
      <div className="workspace-wrapper">
        {/* Device selector sidebar panel */}
        <div className={`sidebar-panel ${sidebarOpen ? '' : 'collapsed'}`}>
          <DeviceSelector
            devicesList={devicesList}
            activeDevices={activeDevices}
            onToggleDevice={handleToggleDevice}
            customDimensions={customDimensions}
            onUpdateCustomDimensions={handleUpdateCustomDimensions}
            onSelectPresets={handleSelectPresets}
            onAddCustomDevice={handleAddCustomDevice}
          />
        </div>

        {/* Infinite Figma-style Zoom Workspace Canvas */}
        <div
          className="canvas-container"
          ref={canvasContainerRef}
          onMouseDown={handleCanvasDragStart}
          onMouseMove={handleCanvasDragMove}
          onMouseUp={handleCanvasDragEnd}
          onMouseLeave={handleCanvasDragEnd}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div
            className="canvas-workspace"
            style={{ transform: `scale(${zoom})` }}
          >
            {activeDevices.length === 0 ? (
              <div style={{ textAlign: 'center', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '40px', maxWidth: '400px', backdropFilter: 'blur(8px)' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📐</span>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No Active Viewports</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                  Please toggle on devices in the **Viewports Library** drawer on the left side or load standard categories (e.g. Mobiles) to start testing.
                </p>
                <button
                  className="url-submit-btn"
                  style={{ marginTop: '16px' }}
                  onClick={() => handleSelectPresets('mobiles')}
                >
                  Load Mobile Presets
                </button>
              </div>
            ) : (
              <div className={`layout-${layout}`}>
                 {devicesList
                  .filter(d => activeDevices.includes(d.key))
                  .filter(d => layout !== 'focus' || focusedDeviceKey === d.key)
                  .map((device) => {
                    const setting = deviceSettings[device.key] || { isLandscape: false };
                    return (
                      <DeviceFrame
                        key={device.key}
                        device={device}
                        url={url}
                        isLandscape={setting.isLandscape}
                        onRotate={handleRotateDevice}
                        onRemove={handleRemoveDevice}
                        onResizeCustom={device.key === 'custom' ? handleUpdateCustomDimensions : undefined}
                        isFocused={focusedDeviceKey === device.key}
                        onFocusToggle={handleFocusToggle}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Sidebar Toggle Trigger */}
      {!sidebarOpen && (
        <button 
          className="sidebar-trigger" 
          onClick={() => setSidebarOpen(true)}
          title="Open Drawer Panel"
        >
          <PanelLeft size={20} />
        </button>
      )}

      {/* Floating Instruction Guides Portal trigger */}
      <button 
        className="tips-floating-btn" 
        onClick={() => setShowHelpModal(true)}
        title="View responsive simulation tips"
      >
        <HelpCircle size={20} />
      </button>

      {/* Guide/Instruction Help Modal overlay */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={20} style={{ color: 'var(--warning)' }} /> 
                Simulation Guide
              </h3>
              <button className="modal-close" onClick={() => setShowHelpModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-color)' }} /> 
                Same-Origin Scroll Sync
              </h4>
              <p>
                When testing compatible local or preset pages, **scrolling inside any screen will automatically sync coordinates across all active screens in real-time!**
              </p>

              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                <Terminal size={16} style={{ color: 'var(--success)' }} /> 
                Local Development Testing
              </h4>
              <p>
                OmniLens is custom tailored for local development! Spin up your local dev server (e.g. <code>npm run dev</code> on <code>http://localhost:5173</code>), type it in the search bar, and test live!
              </p>

              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                <ShieldAlert size={16} style={{ color: 'var(--danger)' }} /> 
                Frame Security Protection (CORS)
              </h4>
              <p>
                Some sites (like Google or GitHub) block being embedded inside other pages via <code>X-Frame-Options</code> or CSP security policies.
              </p>
              <p>
                To preview **any site** in the universe, install a browser extension to bypass security headers (e.g., <strong>Ignore X-Frame-Headers</strong>).
              </p>

              <button 
                className="url-submit-btn" 
                style={{ width: '100%', padding: '10px', marginTop: '16px', borderRadius: '8px' }}
                onClick={() => setShowHelpModal(false)}
              >
                Let's Go!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

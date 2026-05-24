import React, { useState } from 'react';
import { 
  Globe, 
  X, 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  LayoutGrid, 
  Columns, 
  Eye, 
  Minus, 
  Plus, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeft, 
  Map, 
  Server,
  Check
} from 'lucide-react';

interface ControlPanelProps {
  url: string;
  onChangeUrl: (newUrl: string) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  layout: 'grid' | 'row' | 'focus';
  onLayoutChange: (newLayout: 'grid' | 'row' | 'focus') => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export default function ControlPanel({
  url,
  onChangeUrl,
  zoom,
  onZoomChange,
  layout,
  onLayoutChange,
  theme,
  onThemeToggle,
  sidebarOpen,
  onSidebarToggle
}: ControlPanelProps) {
  const [inputVal, setInputVal] = useState(url);
  const [dropdownActive, setDropdownActive] = useState(false);

  const presets = [
    { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org/export/embed.html', desc: 'Interactive Maps (Allows Frames)', iconType: 'map' },
    { name: 'Localhost Port 3000', url: 'http://localhost:3000', desc: 'Standard local dev server port', iconType: 'server' },
  ];

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = inputVal.trim();
    if (!finalUrl) {
      onChangeUrl('');
      return;
    }
    
    // Auto prefix http/https if missing
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'http://' + finalUrl;
    }
    onChangeUrl(finalUrl);
  };

  const handleSelectPreset = (presetUrl: string) => {
    setInputVal(presetUrl);
    onChangeUrl(presetUrl);
    setDropdownActive(false);
  };

  const renderPresetIcon = (type: string) => {
    switch (type) {
      case 'map':
        return <Map size={16} style={{ color: 'var(--accent-color)' }} />;
      case 'server':
        return <Server size={16} style={{ color: 'var(--success)' }} />;
      default:
        return <Globe size={16} />;
    }
  };

  return (
    <header className="header-bar">
      {/* Brand & Sidebar Toggle */}
      <div className="header-left">
        <button 
          className="presets-btn" 
          onClick={onSidebarToggle} 
          title="Toggle viewports drawer"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {sidebarOpen ? (
            <>
              <PanelLeftClose size={16} />
              <span>Close Drawer</span>
            </>
          ) : (
            <>
              <PanelLeft size={16} />
              <span>Open Drawer</span>
            </>
          )}
        </button>
        
        <div className="brand" onClick={() => handleSelectPreset('')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">O</div>
          <span className="brand-title">OmniLens</span>
          <span className="brand-tag">v1.2</span>
        </div>
      </div>

      {/* Address / URL Bar */}
      <div className="header-center">
        <form onSubmit={handleUrlSubmit} className="url-input-container">
          <span className="url-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <Globe size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Type local dev address (e.g. localhost:5173) or search URL..." 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="url-input"
            style={{ marginLeft: '6px' }}
          />
          {inputVal && (
            <button 
              type="button" 
              className="url-clear" 
              onClick={() => { setInputVal(''); onChangeUrl(''); }}
              title="Clear input"
            >
              <X size={14} />
            </button>
          )}
          <button type="submit" className="url-submit-btn">Go</button>
        </form>
      </div>

      {/* Presets and Global Configurations */}
      <div className="header-right">
        {/* Presets Button */}
        <div style={{ position: 'relative' }}>
          <button 
            className="presets-btn" 
            onClick={() => setDropdownActive(prev => !prev)}
            title="Explore embedding presets"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Bookmark size={15} />
            <span>Embed Presets</span>
            {dropdownActive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {dropdownActive && (
            <>
              <div 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
                onClick={() => setDropdownActive(false)}
              ></div>
              <div className="dropdown-menu" style={{ right: 0, zIndex: 1000 }}>
                {presets.map((preset, index) => (
                  <button 
                    key={index} 
                    className={`dropdown-item ${url === preset.url ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(preset.url)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {renderPresetIcon(preset.iconType)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{preset.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{preset.desc}</div>
                    </div>
                    {url === preset.url && <Check size={14} style={{ color: 'var(--accent-color)' }} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Layout buttons */}
        <div className="layout-selector">
          <button 
            className={`layout-btn ${layout === 'grid' ? 'active' : ''}`} 
            onClick={() => onLayoutChange('grid')}
            title="Grid auto-wrapping layout"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LayoutGrid size={14} />
            <span>Grid</span>
          </button>
          <button 
            className={`layout-btn ${layout === 'row' ? 'active' : ''}`} 
            onClick={() => onLayoutChange('row')}
            title="Side-by-side row scroll comparison"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Columns size={14} />
            <span>Row</span>
          </button>
          <button 
            className={`layout-btn ${layout === 'focus' ? 'active' : ''}`} 
            onClick={() => onLayoutChange('focus')}
            title="Focus Stage Layout"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Eye size={14} />
            <span>Focus</span>
          </button>
        </div>

        {/* Zoom */}
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={() => onZoomChange(Math.max(0.25, zoom - 0.1))} title="Zoom Out">
            <Minus size={14} />
          </button>
          <span className="zoom-value" title="Reset Zoom" style={{ cursor: 'pointer' }} onClick={() => onZoomChange(1.0)}>
            {Math.round(zoom * 100)}%
          </span>
          <button className="zoom-btn" onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))} title="Zoom In">
            <Plus size={14} />
          </button>
        </div>

        {/* Theme toggle */}
        <button 
          className="presets-btn" 
          onClick={onThemeToggle} 
          title="Toggle light/dark screen"
          style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

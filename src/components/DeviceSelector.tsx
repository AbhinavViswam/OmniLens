import React, { useState } from 'react';
import { 
  Sliders, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Monitor, 
  PlusCircle, 
  Layers 
} from 'lucide-react';

interface Device {
  key: string;
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'custom';
}

interface DeviceSelectorProps {
  devicesList: Device[];
  activeDevices: string[];
  onToggleDevice: (key: string) => void;
  customDimensions: { width: number; height: number };
  onUpdateCustomDimensions: (width: number, height: number) => void;
  onSelectPresets: (category: 'all' | 'mobiles' | 'tablets' | 'desktops' | 'none') => void;
  onAddCustomDevice: (name: string, width: number, height: number) => void;
}

export default function DeviceSelector({
  devicesList,
  activeDevices,
  onToggleDevice,
  customDimensions,
  onUpdateCustomDimensions,
  onSelectPresets,
  onAddCustomDevice
}: DeviceSelectorProps) {
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceWidth, setNewDeviceWidth] = useState(375);
  const [newDeviceHeight, setNewDeviceHeight] = useState(812);
  const [showAddForm, setShowAddForm] = useState(false);

  // Group devices by type
  const mobiles = devicesList.filter(d => d.type === 'mobile');
  const tablets = devicesList.filter(d => d.type === 'tablet');
  const desktops = devicesList.filter(d => d.type === 'laptop' || d.type === 'desktop');
  const customs = devicesList.filter(d => d.type === 'custom');

  const handleSubmitCustomDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeviceName.trim() && newDeviceWidth > 0 && newDeviceHeight > 0) {
      onAddCustomDevice(newDeviceName.trim(), newDeviceWidth, newDeviceHeight);
      setNewDeviceName('');
      setShowAddForm(false);
    }
  };

  const renderDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone size={15} style={{ color: 'var(--text-muted)' }} />;
      case 'tablet':
        return <Tablet size={15} style={{ color: 'var(--text-muted)' }} />;
      case 'laptop':
        return <Laptop size={15} style={{ color: 'var(--text-muted)' }} />;
      case 'desktop':
        return <Monitor size={15} style={{ color: 'var(--text-muted)' }} />;
      default:
        return <Sliders size={15} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const renderDeviceRow = (device: Device) => {
    const isChecked = activeDevices.includes(device.key);
    return (
      <label key={device.key} className="device-toggle-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {renderDeviceIcon(device.type)}
          <div className="device-toggle-info">
            <span className="device-toggle-name">{device.name}</span>
            <span className="device-toggle-specs">
              {device.width} × {device.height}px
            </span>
          </div>
        </div>
        <div className="switch-control">
          <input 
            type="checkbox" 
            checked={isChecked}
            onChange={() => onToggleDevice(device.key)}
          />
          <span className="slider-knob"></span>
        </div>
      </label>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={18} style={{ color: 'var(--accent-color)' }} />
        <span className="sidebar-title">Viewports Library</span>
      </div>

      {/* Preset Action Buttons */}
      <div className="sidebar-section" style={{ background: 'var(--bg-tertiary)' }}>
        <span className="sidebar-section-title">Quick presets</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
          <button 
            className="fallback-secondary-btn" 
            style={{ margin: 0, padding: '4px 8px', fontSize: '11px' }}
            onClick={() => onSelectPresets('all')}
          >
            All Screens
          </button>
          <button 
            className="fallback-secondary-btn" 
            style={{ margin: 0, padding: '4px 8px', fontSize: '11px' }}
            onClick={() => onSelectPresets('mobiles')}
          >
            Mobiles
          </button>
          <button 
            className="fallback-secondary-btn" 
            style={{ margin: 0, padding: '4px 8px', fontSize: '11px' }}
            onClick={() => onSelectPresets('tablets')}
          >
            Tablets
          </button>
          <button 
            className="fallback-secondary-btn" 
            style={{ margin: 0, padding: '4px 8px', fontSize: '11px' }}
            onClick={() => onSelectPresets('desktops')}
          >
            Desktops
          </button>
        </div>
        <button 
          className="fallback-secondary-btn" 
          style={{ width: '100%', marginTop: '8px', borderColor: 'var(--border-color)', color: 'var(--danger)' }}
          onClick={() => onSelectPresets('none')}
        >
          Clear Active Viewports
        </button>
      </div>

      {/* Devices Lists */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Custom Adjustable Screen */}
        <div className="sidebar-section">
          <span className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={12} />
            <span>Interactive Custom Canvas</span>
          </span>
          {customs.map(renderDeviceRow)}
          
          {activeDevices.includes('custom') && (
            <div className="custom-dim-group" style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div className="range-slider">
                <div className="slider-header">
                  <span>Width</span>
                  <span className="val">{customDimensions.width}px</span>
                </div>
                <input 
                  type="range" 
                  min="280" 
                  max="2500" 
                  value={customDimensions.width} 
                  onChange={(e) => onUpdateCustomDimensions(Number(e.target.value), customDimensions.height)}
                  className="range-input"
                />
              </div>

              <div className="range-slider" style={{ marginTop: '12px' }}>
                <div className="slider-header">
                  <span>Height</span>
                  <span className="val">{customDimensions.height}px</span>
                </div>
                <input 
                  type="range" 
                  min="280" 
                  max="2000" 
                  value={customDimensions.height} 
                  onChange={(e) => onUpdateCustomDimensions(customDimensions.width, Number(e.target.value))}
                  className="range-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobiles */}
        <div className="sidebar-section">
          <span className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={12} />
            <span>Mobile Devices</span>
          </span>
          <div className="toggle-group">{mobiles.map(renderDeviceRow)}</div>
        </div>

        {/* Tablets */}
        <div className="sidebar-section">
          <span className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tablet size={12} />
            <span>Tablets & Foldables</span>
          </span>
          <div className="toggle-group">{tablets.map(renderDeviceRow)}</div>
        </div>

        {/* Laptops & Monitors */}
        <div className="sidebar-section">
          <span className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Laptop size={12} />
            <span>Laptops & Desktops</span>
          </span>
          <div className="toggle-group">{desktops.map(renderDeviceRow)}</div>
        </div>
      </div>

      {/* Dynamic Profile Creator */}
      <div className="sidebar-section" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
        {!showAddForm ? (
          <button 
            className="url-submit-btn" 
            style={{ width: '100%', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => setShowAddForm(true)}
          >
            <PlusCircle size={16} />
            <span>Add Custom Profile</span>
          </button>
        ) : (
          <form onSubmit={handleSubmitCustomDevice} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Add Profile</span>
            <input 
              type="text" 
              placeholder="e.g. iPhone Mini, Folded Inner" 
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              required
              className="url-input"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Width</span>
                <input 
                  type="number" 
                  value={newDeviceWidth} 
                  onChange={(e) => setNewDeviceWidth(Number(e.target.value))}
                  required
                  className="url-input"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Height</span>
                <input 
                  type="number" 
                  value={newDeviceHeight} 
                  onChange={(e) => setNewDeviceHeight(Number(e.target.value))}
                  required
                  className="url-input"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', width: '100%' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button 
                type="submit" 
                className="url-submit-btn" 
                style={{ flex: 1, padding: '6px', fontSize: '11px', borderRadius: '6px' }}
              >
                Save
              </button>
              <button 
                type="button" 
                className="fallback-secondary-btn" 
                style={{ flex: 1, margin: 0, padding: '6px', fontSize: '11px', borderRadius: '6px' }}
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

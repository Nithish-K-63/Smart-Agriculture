import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Droplet, Info, Power, Battery } from 'lucide-react';

export default function MapView() {
  const { nodes, pumpState, togglePump } = useFarm();
  const [selectedNodeId, setSelectedNodeId] = useState(1);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const getPinColor = (moisture) => {
    if (moisture < 20) return '#ef4444'; // Red
    if (moisture < 25) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  return (
    <div className="map-page">
      <div className="header-panel">
        <div className="header-title">
          <h1>Farm Map Overview</h1>
          <p>Interactive satellite overlay and node mapping profile</p>
        </div>
      </div>

      <div className="layout-split">
        {/* Left Side: Dynamic Vector SVG Map representing agricultural zones */}
        <div className="farm-map-container">
          <svg className="map-svg" viewBox="0 0 800 500">
            {/* Background Grid Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Farm boundaries */}
            <text x="30" y="40" fill="var(--text-muted)" fontSize="12" fontWeight="600">MAP BOUNDARIES: VALLEY FARM</text>

            {/* Field 1: North Corn Field */}
            <polygon 
              points="100,80 450,60 420,240 80,260" 
              className="field-boundary"
              onClick={() => setSelectedNodeId(1)}
              style={{
                fill: selectedNodeId === 1 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.02)',
                stroke: selectedNodeId === 1 ? 'var(--accent-blue)' : 'rgba(16, 185, 129, 0.2)'
              }}
            />
            <text x="220" y="160" fill="var(--text-secondary)" fontSize="14" fontWeight="600" textAnchor="middle">
              North Corn Field
            </text>

            {/* Field 2: South Wheat Field */}
            <polygon 
              points="80,280 420,260 380,450 60,450" 
              className="field-boundary"
              onClick={() => setSelectedNodeId(2)}
              style={{
                fill: selectedNodeId === 2 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.02)',
                stroke: selectedNodeId === 2 ? 'var(--accent-blue)' : 'rgba(16, 185, 129, 0.2)'
              }}
            />
            <text x="210" y="370" fill="var(--text-secondary)" fontSize="14" fontWeight="600" textAnchor="middle">
              South Wheat Field
            </text>

            {/* Field 3: East Veg Plot */}
            <polygon 
              points="470,60 740,80 700,450 440,450" 
              className="field-boundary"
              onClick={() => setSelectedNodeId(3)}
              style={{
                fill: selectedNodeId === 3 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.02)',
                stroke: selectedNodeId === 3 ? 'var(--accent-blue)' : 'rgba(16, 185, 129, 0.2)'
              }}
            />
            <text x="590" y="260" fill="var(--text-secondary)" fontSize="14" fontWeight="600" textAnchor="middle">
              East Veg Plot
            </text>

            {/* Node 1 Pin */}
            <g className="node-pin" onClick={() => setSelectedNodeId(1)}>
              <circle cx="260" cy="140" r="25" fill="rgba(0,0,0,0.3)" />
              <circle cx="260" cy="140" r="10" fill={getPinColor(nodes[0].moisture)} />
              <circle cx="260" cy="140" r="18" fill="none" stroke={getPinColor(nodes[0].moisture)} strokeWidth="2" strokeDasharray="4 2" />
              <text x="260" y="180" fill="var(--text-primary)" fontSize="10" fontWeight="600" textAnchor="middle">Node 1</text>
            </g>

            {/* Node 2 Pin */}
            <g className="node-pin" onClick={() => setSelectedNodeId(2)}>
              <circle cx="240" cy="350" r="25" fill="rgba(0,0,0,0.3)" />
              <circle cx="240" cy="350" r="10" fill={getPinColor(nodes[1].moisture)} />
              <circle cx="240" cy="350" r="18" fill="none" stroke={getPinColor(nodes[1].moisture)} strokeWidth="2" strokeDasharray="4 2" />
              <text x="240" y="390" fill="var(--text-primary)" fontSize="10" fontWeight="600" textAnchor="middle">Node 2</text>
            </g>

            {/* Node 3 Pin */}
            <g className="node-pin" onClick={() => setSelectedNodeId(3)}>
              <circle cx="580" cy="230" r="25" fill="rgba(0,0,0,0.3)" />
              <circle cx="580" cy="230" r="10" fill={getPinColor(nodes[2].moisture)} />
              <circle cx="580" cy="230" r="18" fill="none" stroke={getPinColor(nodes[2].moisture)} strokeWidth="2" strokeDasharray="4 2" />
              <text x="580" y="270" fill="var(--text-primary)" fontSize="10" fontWeight="600" textAnchor="middle">Node 3</text>
            </g>
          </svg>
        </div>

        {/* Right Side: Selected Node Telemetry Detail Popup Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedNode.name}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MAC: {selectedNode.macAddress}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Soil Moisture parameter detail */}
            <div className="toggle-control">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Droplet size={18} className="status-blue" />
                <span>Soil Moisture</span>
              </div>
              <strong style={{ fontSize: '1.1rem' }}>{selectedNode.moisture}%</strong>
            </div>

            {/* Temperature parameter detail */}
            <div className="toggle-control">
              <span>Ambient Temp / Humidity</span>
              <strong>{selectedNode.temperature}°C / {selectedNode.humidity}%</strong>
            </div>

            {/* pH parameter detail */}
            <div className="toggle-control">
              <span>Soil Acidity (pH)</span>
              <strong>{selectedNode.pH}</strong>
            </div>

            {/* NPK parameters details */}
            <div className="toggle-control" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>NPK Macronutrients (mg/kg)</span>
              <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                <span>N: <strong>{selectedNode.nitrogen}</strong></span>
                <span>P: <strong>{selectedNode.phosphorus}</strong></span>
                <span>K: <strong>{selectedNode.potassium}</strong></span>
              </div>
            </div>

            {/* Node battery status */}
            <div className="toggle-control">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Battery size={18} className="status-green" />
                <span>Edge Battery Voltage</span>
              </div>
              <strong>{selectedNode.battery} V</strong>
            </div>
          </div>

          {/* Quick Actuator Override switch */}
          {selectedNodeId === 1 && (
            <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Power size={18} className="status-blue" />
                  <span>Manual Pump Override</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={pumpState === 'ON'} 
                    onChange={(e) => togglePump(e.target.checked ? 'ON' : 'OFF')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                * Bypasses the auto scheduling algorithms. Includes a 120-minute safety automatic shutdown timeout.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

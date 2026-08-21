import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Cpu, Plus, Check, Settings, Trash2 } from 'lucide-react';

export default function NodeManager() {
  const { nodes, setNodes, addLog } = useFarm();
  
  // Form fields
  const [name, setName] = useState('');
  const [mac, setMac] = useState('');
  const [crop, setCrop] = useState('Corn');
  const [successMsg, setSuccessMsg] = useState(false);

  // Selected node for thresholds config
  const [selectedNodeId, setSelectedNodeId] = useState(1);
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const [wp, setWp] = useState(selectedNode.wiltingPoint);
  const [fc, setFc] = useState(selectedNode.fieldCapacity);

  // Add Node action
  const handleAddNode = (e) => {
    e.preventDefault();
    if (!name || !mac) return;

    const newNode = {
      id: Date.now(),
      name,
      macAddress: mac,
      status: 'Online',
      moisture: 30.0,
      wiltingPoint: crop === 'Corn' ? 18.0 : crop === 'Wheat' ? 20.0 : 22.0,
      fieldCapacity: crop === 'Corn' ? 35.0 : crop === 'Wheat' ? 33.0 : 38.0,
      temperature: 29.5,
      humidity: 50.0,
      pH: 6.2,
      nitrogen: 45,
      phosphorus: 32,
      potassium: 50,
      battery: 4.20,
      rssi: -60
    };

    setNodes(prev => [...prev, newNode]);
    addLog('NODE_REGISTERED', `Registered new node: ${name} (${mac})`, 'User');
    
    setName('');
    setMac('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  // Update Thresholds logic
  const handleUpdateThresholds = () => {
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, wiltingPoint: wp, fieldCapacity: fc } : n));
    addLog('THRESHOLDS_UPDATED', `Updated thresholds for ${selectedNode.name}: Wilting=${wp}%, Capacity=${fc}%`, 'User');
  };

  return (
    <div className="node-manager-page">
      <div className="header-panel">
        <div className="header-title">
          <h1>Node & Device Manager</h1>
          <p>Register new edge devices and calibrate moisture triggers</p>
        </div>
      </div>

      <div className="layout-split">
        {/* Left Side: Registered nodes list & form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Nodes List */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Active Telemetry Nodes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {nodes.map(node => (
                <div 
                  key={node.id} 
                  className="toggle-control"
                  style={{ 
                    cursor: 'pointer',
                    borderColor: selectedNodeId === node.id ? 'var(--accent-blue)' : 'var(--glass-border)',
                    background: selectedNodeId === node.id ? 'rgba(59, 130, 246, 0.04)' : 'rgba(255,255,255,0.01)'
                  }}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    setWp(node.wiltingPoint);
                    setFc(node.fieldCapacity);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Cpu size={20} className={node.status === 'Online' ? 'status-green' : 'status-rose'} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{node.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{node.macAddress}</span>
                    </div>
                  </div>
                  <span className={node.status === 'Online' ? 'status-green' : 'status-rose'} style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                    {node.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Register Form */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Register New Node</h2>
            <form onSubmit={handleAddNode}>
              <div className="form-group">
                <label>Node Nickname</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. West Tomato Plot" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>MAC Address</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. AA:BB:CC:DD:EE:FF" 
                  value={mac} 
                  onChange={(e) => setMac(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Target Crop Profile</label>
                <select className="form-control" value={crop} onChange={(e) => setCrop(e.target.value)}>
                  <option value="Corn">Corn (WP: 18%, FC: 35%)</option>
                  <option value="Wheat">Wheat (WP: 20%, FC: 33%)</option>
                  <option value="Vegetable">Vegetables (WP: 22%, FC: 38%)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={18} />
                Register Node
              </button>

              {successMsg && (
                <p className="status-green" style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '0.75rem', fontWeight: '500' }}>
                  Node registered successfully!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Right Side: Threshold calibrations parameters panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Settings size={20} className="status-blue" />
            <h2 style={{ fontSize: '1.25rem' }}>Threshold Calibration</h2>
          </div>
          
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Calibrate wilting point and field capacity triggers for <strong>{selectedNode.name}</strong>.
          </p>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Wilting Point (WP: {wp}%)</label>
            <input 
              type="range" 
              min="10" 
              max="25" 
              step="0.5"
              value={wp} 
              onChange={(e) => setWp(parseFloat(e.target.value))} 
              style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>* Soil moisture level below which crops wilt. Triggers pump.</span>
          </div>

          <div className="form-group">
            <label>Field Capacity (FC: {fc}%)</label>
            <input 
              type="range" 
              min="26" 
              max="45" 
              step="0.5"
              value={fc} 
              onChange={(e) => setFc(parseFloat(e.target.value))} 
              style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>* Soil moisture saturation limit. Stops pump.</span>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleUpdateThresholds}
            style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
          >
            Save Calibration Settings
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useFarm } from '../context/FarmContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Droplet, Waves, Power, Activity, ShieldAlert, CheckCircle, Brain } from 'lucide-react';

export default function Overview() {
  const {
    controlMode,
    setControlMode,
    waterTankLevel,
    pumpState,
    flowRate,
    nodes,
    historyData,
    togglePump,
    refillTank,
    activityLogs
  } = useFarm();

  // Calculate Average Soil Moisture
  const avgMoisture = parseFloat((nodes.reduce((sum, n) => sum + n.moisture, 0) / nodes.length).toFixed(1));

  // Determine Overall Status Color
  const getMoistureColorClass = (val) => {
    if (val < 20) return 'status-rose';
    if (val < 25) return 'status-amber';
    return 'status-green';
  };

  return (
    <div className="overview-page">
      <div className="header-panel">
        <div className="header-title">
          <h1>Farm Dashboard</h1>
          <p>Real-time microclimate and irrigation telemetry</p>
        </div>
        <div className="status-badge">
          <span className="status-dot"></span>
          <span>Broker Connected</span>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="card-grid">
        {/* Average Soil Moisture */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-title">Avg Soil Moisture</span>
            <Droplet size={20} className={getMoistureColorClass(avgMoisture)} />
          </div>
          <div className={`card-value ${getMoistureColorClass(avgMoisture)}`}>
            {avgMoisture}%
          </div>
          <div className="card-status">
            {avgMoisture < 20 ? (
              <span className="status-rose">Action Required (Dry)</span>
            ) : avgMoisture < 25 ? (
              <span className="status-amber">Approaching Wilting Threshold</span>
            ) : (
              <span className="status-green">Optimal Moisture Profile</span>
            )}
          </div>
        </div>

        {/* Water Tank Capacity */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-title">Water Tank capacity</span>
            <Waves size={20} className={waterTankLevel < 20 ? 'status-rose' : 'status-blue'} />
          </div>
          <div className={`card-value ${waterTankLevel < 20 ? 'status-rose' : 'status-blue'}`}>
            {waterTankLevel}%
          </div>
          <div className="card-status" style={{ justifyContent: 'space-between' }}>
            <span>{waterTankLevel < 20 ? 'Critical Tank Alert' : 'Good Level'}</span>
            <button 
              className="btn btn-secondary" 
              onClick={refillTank}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '0.35rem' }}
            >
              Refill
            </button>
          </div>
        </div>

        {/* Irrigation Pump State */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-title">Well Pump Actuator</span>
            <Power size={20} className={pumpState === 'ON' ? 'status-blue' : 'status-rose'} />
          </div>
          <div className={`card-value ${pumpState === 'ON' ? 'status-blue' : 'status-rose'}`}>
            {pumpState}
          </div>
          <div className="card-status" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Manual Override:</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={pumpState === 'ON'} 
                onChange={(e) => togglePump(e.target.checked ? 'ON' : 'OFF')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Water Flow Rate */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-title">Water Flow Rate</span>
            <Activity size={20} className={flowRate > 0 ? 'status-blue' : 'status-muted'} />
          </div>
          <div className="card-value">
            {flowRate} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>L/min</span>
          </div>
          <div className="card-status">
            <span>{flowRate > 0 ? 'Solenoid Valve Open' : 'Valves Closed'}</span>
          </div>
        </div>
      </div>

      {/* Large Grid Split: Line Chart and Controls */}
      <div className="layout-split">
        {/* Left Side: Real-time Recharts LineChart */}
        <div className="glass-card" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Live Volumetric Soil Moisture Trends (%)</h2>
          <div style={{ flexGrow: 1, width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 50]} stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '0.75rem',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
                <Line type="monotone" dataKey="North Corn" stroke="var(--accent-blue)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="South Wheat" stroke="var(--accent-emerald)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="East Veg" stroke="var(--accent-purple)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Mode Control & Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Mode Configuration Card */}
          <div className="glass-card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>System Irrigation Mode</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { id: 'Manual', desc: 'Farmer controls pumps directly; automations are ignored.', icon: Power },
                { id: 'Automatic', desc: 'Watering is triggered by moisture thresholds.', icon: CheckCircle },
                { id: 'AI-Predictive', desc: 'Predictive modeling schedules irrigation using weather forecasts.', icon: Brain }
              ].map(mode => (
                <div 
                  key={mode.id} 
                  className={`toggle-control ${controlMode === mode.id ? 'active' : ''}`}
                  onClick={() => setControlMode(mode.id)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: controlMode === mode.id ? '4px solid var(--accent-blue)' : '1px solid var(--glass-border)' }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{mode.id}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{mode.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs Dashboard Snippet */}
          <div className="glass-card" style={{ flexGrow: 1, minHeight: '180px' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Latest Activity Logs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activityLogs.slice(0, 3).map(log => (
                <div key={log.id} style={{ fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                    <span>{log.source} ({log.action})</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)' }}>{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

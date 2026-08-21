import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Brain, CloudRain, Sun, Compass, Check, AlertCircle } from 'lucide-react';

export default function AIRecommendations() {
  const { controlMode, setControlMode, isRaining, togglePump, addLog } = useFarm();
  const [recAccepted, setRecAccepted] = useState(false);

  // Generate 48-hour mock depletion curve data for Recharts
  const forecastData = [
    { hour: '0h', moisture: 24.5 },
    { hour: '6h', moisture: 23.8 },
    { hour: '12h', moisture: 22.1 },
    { hour: '18h', moisture: 20.5 },
    { hour: '24h', moisture: 18.2 }, // Wilting Point threshold at 18%
    { hour: '30h', moisture: 16.8 },
    { hour: '36h', moisture: 15.2 },
    { hour: '42h', moisture: 14.0 },
    { hour: '48h', moisture: 12.8 }
  ];

  // Accept AI Rec logic
  const handleAcceptRec = () => {
    setRecAccepted(true);
    addLog('AI_REC_ACCEPTED', 'User accepted AI irrigation recommendation (12,500 L)', 'User');
    // Start watering if not already running
    togglePump('ON');
  };

  return (
    <div className="ai-page">
      <div className="header-panel">
        <div className="header-title">
          <h1>AI Prediction & Scheduling</h1>
          <p>Evapotranspiration calculations and machine learning forecasts</p>
        </div>
      </div>

      <div className="layout-split">
        {/* Left Side: 48h Depletion curve chart */}
        <div className="glass-card" style={{ height: '430px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Predicted 48-Hour Soil Moisture Depletion Curve</h2>
          <div style={{ flexGrow: 1, width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorMoist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 40]} stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '0.75rem',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Area type="monotone" dataKey="moisture" stroke="var(--accent-blue)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMoist)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            * Red dashed line indicates target crop Wilting Point (18%). The model predicts threshold breach in <strong>24 hours</strong>.
          </p>
        </div>

        {/* Right Side: AI Recommendations details panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI Recommendation Summary */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <Brain size={24} className="status-rose" style={{ color: 'var(--accent-purple)' }} />
              <h2 style={{ fontSize: '1.15rem' }}>AI recommendation</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Watering Action</span>
                <strong className="status-blue" style={{ fontSize: '1.05rem' }}>IRRIGATE</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Target Volume</span>
                <strong>12,500 Liters</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Est. Duration</span>
                <strong>24 Minutes</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Model Confidence</span>
                <strong className="status-green">94.2%</strong>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {recAccepted ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  border: '1px solid var(--accent-emerald)', 
                  color: 'var(--accent-emerald)',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  justifyContent: 'center',
                  fontWeight: '600'
                }}>
                  <Check size={18} />
                  Recommendation Applied
                </div>
              ) : (
                <>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleAcceptRec}
                    style={{ flexGrow: 1, justifyContent: 'center' }}
                  >
                    Accept
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setControlMode('Manual')}
                    style={{ flexGrow: 1, justifyContent: 'center' }}
                  >
                    Reject (Manual)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Meteorological API cache widget */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Localized 3-Day Weather Cache</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Day 1 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sun size={18} className="status-amber" />
                  <span>Today (Sunny)</span>
                </div>
                <span>32°C / <strong>10% Rain</strong></span>
              </div>

              {/* Day 2 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CloudRain size={18} className="status-blue" />
                  <span>Tomorrow (Showers)</span>
                </div>
                <span>28°C / <strong>85% Rain</strong></span>
              </div>

              {/* Day 3 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass size={18} className="status-muted" />
                  <span>Friday (Clear)</span>
                </div>
                <span>30°C / <strong>15% Rain</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

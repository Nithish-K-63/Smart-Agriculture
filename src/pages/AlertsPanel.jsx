import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { ShieldAlert, CheckCircle, BellRing, Smartphone, Mail, ShieldCheck } from 'lucide-react';

export default function AlertsPanel() {
  const { alerts, clearAlert, addLog } = useFarm();
  
  // Notification channels preference state
  const [smsPref, setSmsPref] = useState(true);
  const [pushPref, setPushPref] = useState(true);
  const [emailPref, setEmailPref] = useState(false);

  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const resolvedAlerts = alerts.filter(a => a.status === 'Resolved');

  const handleTogglePref = (channel, currentVal, setter) => {
    setter(!currentVal);
    addLog('ALERT_PREF_CHANGED', `Changed notification preferences for ${channel} to ${!currentVal ? 'Enabled' : 'Disabled'}`, 'User');
  };

  return (
    <div className="alerts-page">
      <div className="header-panel">
        <div className="header-title">
          <h1>Alarms & Alerts Center</h1>
          <p>Real-time hardware alerts and push notifications preferences</p>
        </div>
      </div>

      <div className="layout-split">
        {/* Left Side: Active and Resolved alerts list */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Alerts */}
          <div>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert className="status-rose" />
              <span>Active Alarms ({activeAlerts.length})</span>
            </h2>
            
            {activeAlerts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--glass-border)', borderRadius: '0.75rem' }}>
                <ShieldCheck size={32} className="status-green" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>All systems operating optimally. No active alarms.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeAlerts.map(alert => (
                  <div key={alert.id} className={`alert-row ${alert.type === 'Critical' ? 'critical' : 'warning'}`}>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: '700', 
                          textTransform: 'uppercase',
                          background: alert.type === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: alert.type === 'Critical' ? 'var(--accent-rose)' : 'var(--accent-amber)',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '0.25rem'
                        }}>{alert.type}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Module: {alert.module}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{alert.message}</p>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => clearAlert(alert.id)}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolved History */}
          {resolvedAlerts.length > 0 && (
            <div style={{ marginTop: 'auto' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Resolved Alarms Log</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {resolvedAlerts.map(alert => (
                  <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{alert.message}</span>
                    <span className="status-green" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={12} />
                      Resolved ({alert.timestamp})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Notification channel configuration */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <BellRing size={20} className="status-blue" />
            <h2 style={{ fontSize: '1.25rem' }}>Alert Delivery Channels</h2>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Configure alert channels to receive real-time notifications for critical events.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {/* SMS Preference toggle */}
            <div className="toggle-control">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={18} className="status-blue" />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>SMS Text Messages</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Emergency updates via Twilio</span>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={smsPref} 
                  onChange={() => handleTogglePref('SMS', smsPref, setSmsPref)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Push Notifications Preference toggle */}
            <div className="toggle-control">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BellRing size={18} className="status-purple" style={{ color: 'var(--accent-purple)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Web Push Notifications</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Live updates in browser</span>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={pushPref} 
                  onChange={() => handleTogglePref('Web Push', pushPref, setPushPref)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Email Preferences toggle */}
            <div className="toggle-control">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} className="status-green" />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Email Alert Summaries</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Daily reports to inbox</span>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={emailPref} 
                  onChange={() => handleTogglePref('Email Summaries', emailPref, setEmailPref)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

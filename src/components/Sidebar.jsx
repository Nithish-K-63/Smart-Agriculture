import React from 'react';
import { LayoutDashboard, Map, BrainCircuit, Cpu, AlertOctagon, Settings, CloudRain } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const { isRaining, setIsRaining, alerts } = useFarm();
  
  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'map', name: 'Field Map', icon: Map },
    { id: 'ai', name: 'AI Recs', icon: BrainCircuit },
    { id: 'nodes', name: 'Node Manager', icon: Cpu },
    { id: 'alerts', name: 'Alarms', icon: AlertOctagon, badge: activeAlertsCount > 0 ? activeAlertsCount : null }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <LayoutDashboard size={28} style={{ strokeWidth: 2.5 }} />
        <span>PRECISION FARM</span>
      </div>

      <nav style={{ flexGrow: 1 }}>
        <ul className="nav-links">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <a 
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => setActivePage(item.id)}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span style={{
                      marginLeft: 'auto',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '1rem',
                      boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                    }}>{item.badge}</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Raining trigger controls */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button 
          className={`btn ${isRaining ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setIsRaining(!isRaining)}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <CloudRain size={18} />
          <span>{isRaining ? 'Simulate Stop Rain' : 'Simulate Rain'}</span>
        </button>
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onLogout}
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.4rem', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Sign Out
          </button>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <p>System Version 1.0.0</p>
            <p style={{ marginTop: '0.15rem' }}>Connected over MQTT</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

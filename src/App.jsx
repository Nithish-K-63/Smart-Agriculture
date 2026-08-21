import React, { useState } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import MapView from './pages/MapView';
import AIRecommendations from './pages/AIRecommendations';
import NodeManager from './pages/NodeManager';
import AlertsPanel from './pages/AlertsPanel';
import Login from './pages/Login';
import { Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import './styles/dashboard.css';

function ToastContainer() {
  const { toasts } = useFarm();
  
  const getIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertOctagon size={18} className="status-rose" />;
      case 'warning':
        return <AlertTriangle size={18} className="status-amber" />;
      default:
        return <Info size={18} className="status-blue" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-alert ${toast.type}`}>
          {getIcon(toast.type)}
          <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{toast.message}</span>
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  );
}

function DashboardContent({ onLogout }) {
  const [activePage, setActivePage] = useState('overview');

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview />;
      case 'map':
        return <MapView />;
      case 'ai':
        return <AIRecommendations />;
      case 'nodes':
        return <NodeManager />;
      case 'alerts':
        return <AlertsPanel />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />
      <main className="main-content">
        {renderPage()}
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('user_token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('user_email') || '');

  const handleLoginSuccess = (email, role) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <FarmProvider>
      {isAuthenticated ? (
        <DashboardContent onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </FarmProvider>
  );
}

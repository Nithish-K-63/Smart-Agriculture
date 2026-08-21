import React, { useState } from 'react';
import { Droplet, Brain, Lock, Mail, User, Phone, CheckCircle } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Login({ onLoginSuccess }) {
  const { addToast } = useFarm();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    const targetUrl = isRegister 
      ? 'http://localhost:5000/api/auth/register' 
      : 'http://localhost:5000/api/auth/login';

    const payload = isRegister 
      ? { email, password, firstName, lastName, phoneNumber }
      : { email, password };

    try {
      // 1. Attempt real API connection to our Node.js backend
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (response.ok) {
        if (isRegister) {
          addToast('info', 'Registration successful! Please login.');
          setIsRegister(false);
        } else {
          addToast('info', 'Connected to REST API Server.');
          // Save JWT in localStorage
          localStorage.setItem('user_token', resData.data.token);
          localStorage.setItem('user_email', resData.data.email);
          localStorage.setItem('user_role', resData.data.role);
          onLoginSuccess(resData.data.email, resData.data.role);
        }
      } else {
        setErrorMsg(resData.message || 'Authentication failed');
      }
    } catch (err) {
      // 2. Offline / Server not running fallback
      console.warn('Backend REST server unreachable. Running offline mock authentication...');
      
      if (isRegister) {
        addToast('info', 'Offline Mode: Registration successful (Mocked)');
        setIsRegister(false);
      } else {
        // Safe default developer credentials
        if (email === 'admin@farm.com' && password === 'admin') {
          addToast('info', 'Offline Mode: Signed in as developer.');
          localStorage.setItem('user_token', 'Bearer mock-jwt-token-12345');
          localStorage.setItem('user_email', 'admin@farm.com');
          localStorage.setItem('user_role', 'Admin');
          onLoginSuccess('admin@farm.com', 'Admin');
        } else if (email && password.length >= 4) {
          addToast('info', 'Offline Mode: Signed in successfully (Mocked).');
          localStorage.setItem('user_token', 'Bearer mock-jwt-token-12345');
          localStorage.setItem('user_email', email);
          localStorage.setItem('user_role', 'Farmer');
          onLoginSuccess(email, 'Farmer');
        } else {
          setErrorMsg('Invalid email or password (Try admin@farm.com / admin)');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <Droplet size={32} style={{ strokeWidth: 2.5 }} />
          </div>
          <h2>PRECISION IRRIGATION</h2>
          <p>{isRegister ? 'Register your farming profile' : 'Sign in to monitor your farm'}</p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--accent-rose)',
            color: 'var(--accent-rose)',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>First Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="John" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Doe" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="tel" 
                    className="form-control" 
                    placeholder="+1 555 0199" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-control" 
                placeholder="farmer.bob@gmail.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegister ? 'Create Profile' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isRegister ? 'Already have a profile?' : "Don't have a profile?"}
          </span>{' '}
          <a 
            style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '500' }}
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
          >
            {isRegister ? 'Sign In' : 'Register Here'}
          </a>
        </div>
      </div>
    </div>
  );
}

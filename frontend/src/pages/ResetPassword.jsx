import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      setStatus({ type: 'error', message: 'Invalid or missing security token.' });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ type: 'error', message: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
    }

    setLoading(true);
    setStatus(null);

    try {
      await axios.post(`${API_URL}/reset-password`, { token, password });
      setStatus({ type: 'success', message: 'Security credentials updated successfully. You can now log in.' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to reset password. Link may be expired.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: '#fff',
        padding: '3rem 2.5rem',
        borderRadius: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', height: '64px', background: '#f1f5f9', color: '#0f172a', 
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Secure Reset</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Define your new professional access credentials below.</p>
        </div>

        {status && (
          <div style={{
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'left',
            background: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: status.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                style={{
                  width: '100%', height: '3.25rem', paddingLeft: '42px', borderRadius: '12px',
                  border: '1px solid #e2e8f0', fontSize: '0.9375rem', outline: 'none'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                style={{
                  width: '100%', height: '3.25rem', paddingLeft: '42px', borderRadius: '12px',
                  border: '1px solid #e2e8f0', fontSize: '0.9375rem', outline: 'none'
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            style={{
              width: '100%', height: '3.5rem', background: '#0f172a', color: '#fff',
              border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!loading && token) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 23, 42, 0.4)';
                e.currentTarget.style.background = '#1e293b';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(15, 23, 42, 0.3)';
              e.currentTarget.style.background = '#0f172a';
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Finalize Password Update'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;

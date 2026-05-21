import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      setStatus({ type: 'success', message: 'Credentials updated successfully. Redirecting...' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to reset. Link may be expired.' });
    } finally {
      setLoading(false);
    }
  };

  const inputContainerStyle = { position: 'relative', marginBottom: '1.25rem' };
  const inputStyle = {
    width: '100%', height: '3.25rem', paddingLeft: '44px', paddingRight: '44px',
    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '0.9rem', outline: 'none', background: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0', fontFamily: 'inherit', transition: 'all 0.2s'
  };
  const iconStyle = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' };
  const toggleStyle = { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer', padding: '4px', width: 'auto', boxShadow: 'none' };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#080a10',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '15%', right: '20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '15%', left: '15%', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        padding: '2.5rem',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}></div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '60px', height: '60px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
            color: '#818cf8', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            border: '1px solid rgba(99,102,241,0.15)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Secure Reset</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>Define your new access credentials below.</p>
        </div>

        {status && (
          <div style={{
            padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '1.25rem',
            fontSize: '0.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left',
            background: status.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
            color: status.type === 'success' ? '#34d399' : '#fb7185',
            border: `1px solid ${status.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`
          }}>
            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Password</label>
            <div style={inputContainerStyle}>
              <Lock size={16} style={iconStyle} />
              <input type={showPass ? "text" : "password"} required placeholder="••••••••" style={inputStyle}
                value={password} onChange={(e) => setPassword(e.target.value)}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={toggleStyle}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirm Password</label>
            <div style={inputContainerStyle}>
              <Lock size={16} style={iconStyle} />
              <input type={showConfirm ? "text" : "password"} required placeholder="••••••••" style={inputStyle}
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={toggleStyle}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Password strength hint */}
          {password && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '0.4rem' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: '3px', borderRadius: '3px',
                    background: password.length >= i * 3
                      ? (password.length >= 12 ? '#34d399' : password.length >= 8 ? '#fbbf24' : '#fb7185')
                      : 'rgba(255,255,255,0.06)',
                    transition: 'all 0.3s'
                  }}></div>
                ))}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
                {password.length < 6 ? 'Too short' : password.length < 8 ? 'Weak' : password.length < 12 ? 'Good' : 'Strong'}
              </span>
            </div>
          )}

          <button type="submit" disabled={loading || !token} className="rp-btn-primary" style={{
            width: '100%', height: '3.25rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
            border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
            fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
            opacity: (!token) ? 0.5 : 1
          }}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .rp-btn-primary {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .rp-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 28px rgba(99,102,241,0.4) !important;
        }
      `}} />
    </div>
  );
}

export default ResetPassword;

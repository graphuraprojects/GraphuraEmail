import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await axios.post(`${API_URL}/forgot-password`, { email });
      setStatus({ type: 'success', message: 'A secure reset link has been dispatched to your email.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to initiate password reset.' });
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
      background: '#080a10',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

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
            <Mail size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Account Recovery</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Enter your registered email and we'll send you a secure link to reset your credentials.
          </p>
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

        {status?.type === 'success' ? (
          <button onClick={() => navigate('/login')} className="fp-btn-primary" style={btnStyle}>
            Back to Login
          </button>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                <input type="email" required placeholder="name@company.com" style={{
                  width: '100%', height: '3.25rem', paddingLeft: '42px', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.9rem', outline: 'none',
                  background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
                value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="fp-btn-primary" style={btnStyle}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Request Reset Link'}
            </button>
            <button type="button" onClick={() => navigate('/login')} style={{
              marginTop: '1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '100%',
              boxShadow: 'none', padding: '0.5rem'
            }}>
              <ArrowLeft size={15} /> Return to Sign In
            </button>
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .fp-btn-primary {
          width: 100%; height: 3.25rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
          color: #fff; border: none; border-radius: 12px;
          font-weight: 700; cursor: pointer; font-size: 0.9rem;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          box-shadow: 0 8px 20px rgba(99,102,241,0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .fp-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 28px rgba(99,102,241,0.4) !important;
        }
      `}} />
    </div>
  );
}

const btnStyle = {
  width: '100%', height: '3.25rem',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
  border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
  fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  boxShadow: '0 8px 20px rgba(99,102,241,0.3)'
};

export default ForgotPassword;

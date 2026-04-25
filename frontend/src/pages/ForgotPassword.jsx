import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await axios.post(`${API_URL}/forgot-password`, { email });
      setStatus({ type: 'success', message: 'A secure reset link has been dispatched to your corporate email.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to initiate password reset. Verify your email.' });
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
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: '#fff',
        padding: '3rem 2.5rem',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', height: '64px', background: '#eff6ff', color: '#3b82f6', 
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Mail size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Account Recovery</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Enter your registered email address and we'll send you a secure link to reset your credentials.
          </p>
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

        {status?.type === 'success' ? (
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', padding: '1rem', background: '#0f172a', color: '#fff',
              border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                style={{
                  width: '100%', height: '3.25rem', padding: '0 1rem', borderRadius: '12px',
                  border: '1px solid #e2e8f0', fontSize: '0.9375rem', outline: 'none'
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: '3.25rem', background: '#0f172a', color: '#fff',
                border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 23, 42, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(15, 23, 42, 0.2)';
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Request Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                marginTop: '1.25rem', background: 'none', border: 'none', color: '#64748b',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
              onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <ArrowLeft size={16} /> Return to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;

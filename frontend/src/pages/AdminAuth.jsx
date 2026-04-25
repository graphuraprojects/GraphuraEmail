import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, Loader2, AlertCircle, Shield, ArrowRight, Server, Cloud, Database, Wifi, Code, Globe, Cpu, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function AdminAuth({ onLogin, token }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/admin');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await axios.post(`${API_URL}${endpoint}`, {
        email,
        password,
        role: 'admin',
        adminCode: !isLogin ? adminCode : undefined
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userEmail', response.data.email);
      localStorage.setItem('userRole', response.data.role);
      onLogin(response.data, '/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f1f5f9',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Left Panel - Green Admin Aesthetic */}
      <div className="admin-auth-left admin-bg-animate" style={{
        flex: '1.2',
        background: 'linear-gradient(-45deg, #059669, #10b981, #0d9488, #047857, #34d399, #14b8a6)',
        backgroundSize: '300% 300%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        color: '#fff',
        overflow: 'hidden'
      }}>
        {/* Animated Spheres - Green */}
        <div className="adm-sphere-glow" style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
        <div className="adm-sphere-1" style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '300px', height: '300px', background: '#34d399', borderRadius: '50%', boxShadow: '0 0 80px rgba(52,211,153,0.3)' }}></div>
        <div className="adm-sphere-2" style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '200px', height: '200px', background: '#6ee7b7', borderRadius: '50%', boxShadow: '0 0 60px rgba(110,231,183,0.2)' }}></div>

        {/* Floating Tech Icons */}
        <div className="adm-ti adm-ti-1" style={{ position: 'absolute', top: '12%', left: '15%' }}><Shield size={22} /></div>
        <div className="adm-ti adm-ti-2" style={{ position: 'absolute', top: '25%', right: '12%' }}><Server size={20} /></div>
        <div className="adm-ti adm-ti-3" style={{ position: 'absolute', top: '55%', left: '8%' }}><Database size={24} /></div>
        <div className="adm-ti adm-ti-4" style={{ position: 'absolute', top: '70%', right: '20%' }}><Cloud size={26} /></div>
        <div className="adm-ti adm-ti-5" style={{ position: 'absolute', top: '40%', left: '70%' }}><Cpu size={18} /></div>
        <div className="adm-ti adm-ti-6" style={{ position: 'absolute', top: '8%', right: '30%' }}><Globe size={20} /></div>
        <div className="adm-ti adm-ti-7" style={{ position: 'absolute', top: '85%', left: '40%' }}><Code size={22} /></div>
        <div className="adm-ti adm-ti-8" style={{ position: 'absolute', top: '18%', left: '55%' }}><Wifi size={24} /></div>
        <div className="adm-ti adm-ti-9" style={{ position: 'absolute', top: '60%', right: '8%' }}><Zap size={20} /></div>
        <div className="adm-ti adm-ti-10" style={{ position: 'absolute', top: '45%', left: '25%' }}><Lock size={18} /></div>
        <div className="adm-ti adm-ti-11" style={{ position: 'absolute', top: '75%', left: '65%' }}><Mail size={16} /></div>
        <div className="adm-ti adm-ti-12" style={{ position: 'absolute', top: '35%', left: '45%' }}><Shield size={16} /></div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <div className="adm-anim-fade" style={{
            display: 'inline-block',
            background: '#fff',
            padding: '10px 20px',
            borderRadius: '14px',
            marginBottom: '3rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <img src="/GraphuraLogo.jpg" alt="Graphura" style={{ height: '45px', display: 'block', objectFit: 'contain' }} />
          </div>
          <h1 className="adm-slide-1" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em' }}>ADMIN GATEWAY</h1>
          <h2 className="adm-slide-2" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>SYSTEM MANAGEMENT & GOVERNANCE</h2>
          <p className="adm-slide-3" style={{ maxWidth: '450px', lineHeight: 1.8, fontSize: '0.95rem' }}>
            Access the core infrastructure controls. Manage enterprise configurations, monitor system health, and oversee global communication protocols with industrial-grade security.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        flex: '1',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              {isLogin ? 'Sign in' : 'Initialize'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Authorize administrative access to the platform
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="Admin Email"
                  style={{ height: '3.5rem', width: '100%', paddingLeft: '50px', borderRadius: '14px', border: 'none', background: '#f8fafc', fontSize: '0.9375rem', outline: 'none' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  placeholder="Secret Password"
                  style={{ height: '3.5rem', width: '100%', paddingLeft: '50px', borderRadius: '14px', border: 'none', background: '#f8fafc', fontSize: '0.9375rem', outline: 'none' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <Shield size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#10b981' }} />
                  <input
                    type="password"
                    placeholder="Master Access Code"
                    style={{ height: '3.5rem', width: '100%', paddingLeft: '50px', borderRadius: '14px', border: 'none', background: '#f8fafc', fontSize: '0.9375rem', outline: 'none' }}
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '1rem', background: '#fff1f2', color: '#be123c', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #fecaca' }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="adm-btn-primary"
              style={{
                height: '3.5rem', width: '100%', borderRadius: '14px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff',
                border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem',
                boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                position: 'relative', overflow: 'hidden'
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isLogin ? 'Secure Entry' : 'Create Administrator'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="adm-link-btn"
              style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {isLogin ? "Initialize new system admin?" : "Return to secure entry"}
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Back to User Portal
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Text entrance animations */
        @keyframes admFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes admSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .adm-anim-fade { animation: admFadeIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .adm-slide-1 { opacity: 0; animation: admSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; }
        .adm-slide-2 { opacity: 0; animation: admSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s forwards; }
        .adm-slide-3 { opacity: 0; animation: admSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.6s forwards; }

        /* Sphere animations */
        @keyframes admFloat1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes admFloat2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -15px); }
        }
        @keyframes admPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .adm-sphere-1 { animation: admFloat1 6s ease-in-out infinite; }
        .adm-sphere-2 { animation: admFloat2 8s ease-in-out infinite; }
        .adm-sphere-glow { animation: admPulse 5s ease-in-out infinite; }

        /* Floating tech icons */
        @keyframes admDrift1 {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(8px,-12px) rotate(8deg); }
        }
        @keyframes admDrift2 {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(-10px,-8px) rotate(-6deg); }
        }
        @keyframes admDrift3 {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(6px,10px) rotate(10deg); }
        }
        .adm-ti { color: rgba(255,255,255,0.12); z-index: 2; pointer-events: none; }
        .adm-ti-1  { animation: admDrift1 7s ease-in-out infinite; }
        .adm-ti-2  { animation: admDrift2 9s ease-in-out 0.5s infinite; }
        .adm-ti-3  { animation: admDrift3 8s ease-in-out 1s infinite; }
        .adm-ti-4  { animation: admDrift1 10s ease-in-out 1.5s infinite; }
        .adm-ti-5  { animation: admDrift2 7.5s ease-in-out 0.8s infinite; }
        .adm-ti-6  { animation: admDrift3 9.5s ease-in-out 0.3s infinite; }
        .adm-ti-7  { animation: admDrift1 8.5s ease-in-out 2s infinite; }
        .adm-ti-8  { animation: admDrift2 11s ease-in-out 0.7s infinite; }
        .adm-ti-9  { animation: admDrift3 7s ease-in-out 1.2s infinite; }
        .adm-ti-10 { animation: admDrift1 9s ease-in-out 0.4s infinite; }
        .adm-ti-11 { animation: admDrift2 8s ease-in-out 1.8s infinite; }
        .adm-ti-12 { animation: admDrift3 10s ease-in-out 0.6s infinite; }

        /* Background colour cycling - Green */
        @keyframes admBgShift {
          0%   { background-position: 0% 50%; }
          25%  { background-position: 50% 100%; }
          50%  { background-position: 100% 50%; }
          75%  { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }
        .admin-bg-animate {
          animation: admBgShift 12s ease infinite !important;
        }

        /* Button animations */
        @keyframes admShimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .adm-btn-primary {
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important;
        }
        .adm-btn-primary:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 20px 25px -5px rgba(5,150,105,0.4) !important;
        }
        .adm-btn-primary:active {
          transform: translateY(-1px) scale(0.98) !important;
        }
        .adm-btn-primary::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }
        .adm-btn-primary:hover::after {
          animation: admShimmer 0.8s ease-in-out;
        }
        .adm-link-btn {
          transition: all 0.2s ease !important;
        }
        .adm-link-btn:hover {
          color: #047857 !important;
          text-decoration: underline;
        }

        @media (max-width: 1000px) {
          .admin-auth-left { display: none !important; }
        }
      `}} />
    </div>
  );
}

export default AdminAuth;

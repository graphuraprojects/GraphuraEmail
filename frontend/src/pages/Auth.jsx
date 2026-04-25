import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, UserPlus, Loader2, AlertCircle, Shield, Server, Cloud, Database, Wifi, Code, Globe, Cpu, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const impToken = params.get('impersonate_token');
    const impEmail = params.get('email');
    const impRole = params.get('role');

    if (impToken && impEmail && impRole) {
      console.log('Detecting impersonation token, logging in...');
      localStorage.setItem('token', impToken);
      localStorage.setItem('userEmail', impEmail);
      localStorage.setItem('userRole', impRole);
      
      onLogin({
        token: impToken,
        email: impEmail,
        role: impRole
      });
      
      navigate('/dashboard');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await axios.post(`${API_URL}${endpoint}`, {
        email,
        password,
        name: isLogin ? undefined : name,
        phone: isLogin ? undefined : phone,
        location: isLogin ? undefined : locationStr,
        secretKey: isLogin ? undefined : secretKey,
        role: 'user'
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userEmail', response.data.email);
      localStorage.setItem('userRole', response.data.role);
      onLogin(response.data);
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
      background: '#0f172a',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Left Panel - Decorative */}
      <div className="auth-left-panel auth-bg-animate" style={{
        flex: '1.2',
        background: 'linear-gradient(-45deg, #0f172a, #1e3a5f, #1e293b, #0c2d48, #163a5f, #0f172a)',
        backgroundSize: '300% 300%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        color: '#fff',
        overflow: 'hidden'
      }}>
        {/* Animated Spheres */}
        <div className="sphere-glow" style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
        <div className="sphere-float-1" style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '300px', height: '300px', background: '#1e3a5f', borderRadius: '50%', boxShadow: '0 0 80px rgba(30,58,95,0.4)' }}></div>
        <div className="sphere-float-2" style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '200px', height: '200px', background: '#2563eb', borderRadius: '50%', boxShadow: '0 0 60px rgba(37,99,235,0.2)' }}></div>

        {/* Floating Tech Icons */}
        <div className="tech-icon ti-1" style={{ position: 'absolute', top: '12%', left: '15%' }}><Mail size={22} /></div>
        <div className="tech-icon ti-2" style={{ position: 'absolute', top: '25%', right: '12%' }}><Shield size={20} /></div>
        <div className="tech-icon ti-3" style={{ position: 'absolute', top: '55%', left: '8%' }}><Server size={24} /></div>
        <div className="tech-icon ti-4" style={{ position: 'absolute', top: '70%', right: '20%' }}><Cloud size={26} /></div>
        <div className="tech-icon ti-5" style={{ position: 'absolute', top: '40%', left: '70%' }}><Database size={18} /></div>
        <div className="tech-icon ti-6" style={{ position: 'absolute', top: '8%', right: '30%' }}><Wifi size={20} /></div>
        <div className="tech-icon ti-7" style={{ position: 'absolute', top: '85%', left: '40%' }}><Code size={22} /></div>
        <div className="tech-icon ti-8" style={{ position: 'absolute', top: '18%', left: '55%' }}><Globe size={24} /></div>
        <div className="tech-icon ti-9" style={{ position: 'absolute', top: '60%', right: '8%' }}><Cpu size={20} /></div>
        <div className="tech-icon ti-10" style={{ position: 'absolute', top: '45%', left: '25%' }}><Zap size={18} /></div>
        <div className="tech-icon ti-11" style={{ position: 'absolute', top: '75%', left: '65%' }}><Lock size={16} /></div>
        <div className="tech-icon ti-12" style={{ position: 'absolute', top: '35%', left: '45%' }}><Mail size={16} /></div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <div className="anim-fade-in" style={{ 
            display: 'inline-block', 
            background: '#fff', 
            padding: '10px 20px', 
            borderRadius: '14px', 
            marginBottom: '3rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <img src="/GraphuraLogo.jpg" alt="Graphura" style={{ height: '45px', display: 'block', objectFit: 'contain' }} />
          </div>
          <h1 className="anim-slide-up-1" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>WELCOME</h1>
          <h2 className="anim-slide-up-2" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>YOUR ENTERPRISE MAIL HUB</h2>
          <p className="anim-slide-up-3" style={{ maxWidth: '450px', lineHeight: 1.8, fontSize: '0.95rem' }}>
            Experience the next generation of enterprise communication. Secure, fast, and intelligent email management designed for high-performance teams.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        flex: '1',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '420px', width: '100%' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              {isLogin ? 'Login' : 'Register'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ position: 'relative' }}>
                  <UserPlus size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    style={{ height: '3.5rem', width: '100%', paddingLeft: '50px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', fontSize: '0.9375rem', outline: 'none', color: '#fff' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="User Name / Email"
                  style={{ height: '3.5rem', width: '100%', paddingLeft: '50px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', fontSize: '0.9375rem', outline: 'none', color: '#fff' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  placeholder="Password"
                  style={{ height: '3.5rem', width: '100%', paddingLeft: '50px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', fontSize: '0.9375rem', outline: 'none', color: '#fff' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <input
                    type="text"
                    placeholder="Phone"
                    style={{ height: '3.5rem', padding: '0 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', fontSize: '0.9rem', outline: 'none', color: '#fff' }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    style={{ height: '3.5rem', padding: '0 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', fontSize: '0.9rem', outline: 'none', color: '#fff' }}
                    value={locationStr}
                    onChange={(e) => setLocationStr(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    placeholder="Secret Key (Mandatory)"
                    style={{ height: '3.5rem', width: '100%', padding: '0 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', fontSize: '0.9rem', outline: 'none', color: '#fff' }}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input type="checkbox" style={{ accentColor: '#059669' }} /> Remember me
              </label>
              {isLogin && (
                <button type="button" onClick={() => navigate('/forgot-password')} style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                  Forgot Password?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
              style={{
                height: '3.5rem', width: '100%', borderRadius: '14px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff',
                border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem',
                boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)',
                position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Login' : 'Create Account')}
            </button>

            <div style={{ textAlign: 'center', position: 'relative', marginBottom: '1.5rem' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
              <span style={{ position: 'relative', background: '#0f172a', padding: '0 1rem', fontSize: '0.75rem', color: '#94a3b8', zIndex: 1 }}>Or</span>
            </div>

            <button
              type="button"
              className="auth-btn-admin"
              onClick={() => navigate('/admin/login')}
              style={{
                height: '3.5rem', width: '100%', borderRadius: '14px', background: '#1e293b', color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)',
                position: 'relative', overflow: 'hidden'
              }}
            >
              <Shield size={18} /> Admin Login
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="auth-link-btn" onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 10px 15px -3px rgba(7, 78, 140, 0.3); }
          50% { box-shadow: 0 10px 25px -3px rgba(7, 78, 140, 0.5); }
        }
        .auth-btn-primary {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .auth-btn-primary:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 20px 25px -5px rgba(5, 150, 105, 0.4) !important;
        }
        .auth-btn-primary:active {
          transform: translateY(-1px) scale(0.98) !important;
        }
        .auth-btn-primary::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: none;
        }
        .auth-btn-primary:hover::after {
          animation: shimmer 0.8s ease-in-out;
        }
        .auth-btn-admin {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .auth-btn-admin:hover {
          transform: translateY(-3px) !important;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.4) !important;
        }
        .auth-btn-admin:active {
          transform: translateY(-1px) scale(0.98) !important;
        }
        .auth-btn-admin::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        .auth-btn-admin:hover::after {
          animation: shimmer 0.8s ease-in-out;
        }
        .auth-link-btn {
          transition: all 0.2s ease !important;
        }
        .auth-link-btn:hover {
          color: #047857 !important;
          text-decoration: underline;
        }
        /* Text entrance animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-slide-up-1 {
          opacity: 0;
          animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }
        .anim-slide-up-2 {
          opacity: 0;
          animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
        }
        .anim-slide-up-3 {
          opacity: 0;
          animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }

        /* Sphere floating animations */
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes floatDiag {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -15px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .sphere-float-1 {
          animation: floatUp 6s ease-in-out infinite;
        }
        .sphere-float-2 {
          animation: floatDiag 8s ease-in-out infinite;
        }
        .sphere-glow {
          animation: pulseGlow 5s ease-in-out infinite;
        }

        /* Floating tech icons */
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(8px, -12px) rotate(8deg); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-10px, -8px) rotate(-6deg); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(6px, 10px) rotate(10deg); }
        }
        .tech-icon {
          color: rgba(255,255,255,0.12);
          z-index: 2;
          pointer-events: none;
        }
        .ti-1  { animation: drift1 7s ease-in-out infinite; }
        .ti-2  { animation: drift2 9s ease-in-out 0.5s infinite; }
        .ti-3  { animation: drift3 8s ease-in-out 1s infinite; }
        .ti-4  { animation: drift1 10s ease-in-out 1.5s infinite; }
        .ti-5  { animation: drift2 7.5s ease-in-out 0.8s infinite; }
        .ti-6  { animation: drift3 9.5s ease-in-out 0.3s infinite; }
        .ti-7  { animation: drift1 8.5s ease-in-out 2s infinite; }
        .ti-8  { animation: drift2 11s ease-in-out 0.7s infinite; }
        .ti-9  { animation: drift3 7s ease-in-out 1.2s infinite; }
        .ti-10 { animation: drift1 9s ease-in-out 0.4s infinite; }
        .ti-11 { animation: drift2 8s ease-in-out 1.8s infinite; }
        .ti-12 { animation: drift3 10s ease-in-out 0.6s infinite; }

        /* Background colour cycling */
        @keyframes bgShift {
          0%   { background-position: 0% 50%; }
          25%  { background-position: 50% 100%; }
          50%  { background-position: 100% 50%; }
          75%  { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }
        .auth-bg-animate {
          background: linear-gradient(-45deg, #0284c7, #4f46e5, #0d9488, #0369a1, #7c3aed, #0891b2) !important;
          background-size: 300% 300% !important;
          animation: bgShift 12s ease infinite !important;
        }

        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
        }
      `}} />
    </div>
  );
}

export default Auth;

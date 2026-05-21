import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, UserPlus, Loader2, AlertCircle, Shield, ArrowRight, Eye, EyeOff, MapPin, Phone, Key, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function Auth({ onLogin, token }) {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const impToken = params.get('impersonate_token');
    const impEmail = params.get('email');
    const impRole = params.get('role');

    if (impToken && impEmail && impRole) {
      localStorage.setItem('token', impToken);
      localStorage.setItem('userEmail', impEmail);
      localStorage.setItem('userRole', impRole);
      onLogin({ token: impToken, email: impEmail, role: impRole });
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
      onLogin(response.data, '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    height: '3.25rem', width: '100%', paddingLeft: '48px', paddingRight: '1rem',
    borderRadius: '12px', border: '1px solid var(--border)',
    background: 'var(--input-bg)', fontSize: '0.9rem', outline: 'none',
    color: 'var(--text-main)', fontFamily: 'inherit', transition: 'all 0.2s ease'
  };

  const iconStyle = {
    position: 'absolute', left: '16px', top: '50%',
    transform: 'translateY(-50%)', color: 'var(--text-muted)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-dark)',
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Left Panel */}
      <div className="auth-left-panel" style={{
        flex: '1.15',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        color: '#fff', // Keep white for hero image contrast
        overflow: 'hidden'
      }}>
        {/* Hero Background Image */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/user_login_hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>

        {/* Gradient Overlay for Text Readability */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to right, rgba(12, 14, 20, 0.9) 0%, rgba(12, 14, 20, 0.4) 100%)'
        }}></div>

        {/* Floating orbs for extra depth */}
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div className="auth-anim-fade" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
            padding: '10px 20px', borderRadius: '14px', marginBottom: '2.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img src="/GraphuraLogo.jpg" alt="Graphura" style={{ height: '38px', display: 'block', objectFit: 'contain', borderRadius: '8px', filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', color: '#fff' }}>Graphura Mail</span>
          </div>

          <h1 className="auth-anim-1" style={{ fontSize: '3.25rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
            Enterprise<br/>Communication
          </h1>
          <h2 className="auth-anim-2" style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '2rem', color: 'rgba(255,255,255,0.7)' }}>
            Secure • Intelligent • High-Performance
          </h2>

          <div className="auth-anim-3" style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            {[
              { label: '99.9%', sub: 'Uptime' },
              { label: '256-bit', sub: 'Encrypted' },
              { label: '10K+', sub: 'Emails/day' }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '1rem 1.25rem', borderRadius: '14px',
                background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.08)', minWidth: '100px'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.2rem', color: '#fff' }}>{item.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        flex: '1',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative'
      }}>
        {/* Subtle glow */}
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <div style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px var(--primary-glow)'
              }}>
                {isLogin ? <LogIn size={16} color="white" /> : <UserPlus size={16} color="white" />}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
              {isLogin ? 'Sign in' : 'Create Account'}
            </h1>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.875rem', fontWeight: 500 }}>
              {isLogin ? 'Enter your credentials to access the platform' : 'Fill in details to set up your workspace'}
            </p>
          </div>

          {error && (
            <div style={{
              padding: '0.875rem 1rem', background: 'var(--error-glow)',
              border: '1px solid var(--error)', borderRadius: '12px',
              marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
              color: 'var(--error)', fontSize: '0.85rem', fontWeight: 600
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <UserPlus size={17} style={iconStyle} />
                  <input type="text" placeholder="Full Name" style={inputStyle}
                    value={name} onChange={(e) => setName(e.target.value)} required
                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={iconStyle} />
                <input type="email" placeholder="Email address" style={inputStyle}
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={iconStyle} />
                <input type={showPassword ? "text" : "password"} placeholder="Password" style={{ ...inputStyle, paddingRight: '48px' }}
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', width: 'auto', boxShadow: 'none' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={iconStyle} />
                    <input type="text" placeholder="Phone" style={{ ...inputStyle, paddingLeft: '42px' }}
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={iconStyle} />
                    <input type="text" placeholder="Location" style={{ ...inputStyle, paddingLeft: '42px' }}
                      value={locationStr} onChange={(e) => setLocationStr(e.target.value)}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                  <Key size={17} style={iconStyle} />
                  <input type="text" placeholder="Secret Key (Required)" style={inputStyle}
                    value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required
                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </>
            )}

            {isLogin && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }} /> Remember me
                </label>
                <button type="button" onClick={() => navigate('/forgot-password')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', width: 'auto', boxShadow: 'none', padding: 0 }}>
                  Forgot Password?
                </button>
              </div>
            )}

            {!isLogin && <div style={{ height: '0.75rem' }}></div>}

            <button type="submit" disabled={loading} className="auth-submit-btn" style={{
              height: '3.25rem', width: '100%', borderRadius: '12px',
              background: 'var(--gradient-primary)', color: '#fff',
              border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 20px var(--primary-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              position: 'relative', overflow: 'hidden', marginBottom: '1.25rem'
            }}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={17} /></>
              )}
            </button>

            {/* Divider */}
            <div style={{ textAlign: 'center', position: 'relative', marginBottom: '1.25rem' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ position: 'relative', background: 'var(--bg-card)', padding: '0 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Or</span>
            </div>

            <button type="button" className="auth-admin-btn" onClick={() => navigate('/admin/login')} style={{
              height: '3.25rem', width: '100%', borderRadius: '12px',
              background: 'var(--input-bg)', color: 'var(--text-main)',
              border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              position: 'relative', overflow: 'hidden'
            }}>
              <Shield size={16} /> Admin Portal
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
            <button type="button" className="auth-toggle-link" onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', width: 'auto', boxShadow: 'none', padding: 0, display: 'inline-block' }}>
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Floating orbs */
        .auth-orb {
          position: absolute;
          border-radius: 50%;
          z-index: 2;
          pointer-events: none;
        }
        .auth-orb-1 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          top: -10%; right: -5%;
          animation: authOrbFloat1 8s ease-in-out infinite;
        }
        .auth-orb-2 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
          bottom: 10%; left: -5%;
          animation: authOrbFloat2 10s ease-in-out infinite;
        }
        @keyframes authOrbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(1.1); }
        }
        @keyframes authOrbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -25px) scale(1.05); }
        }

        /* Text animations */
        .auth-anim-fade {
          animation: authFadeScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .auth-anim-1 {
          opacity: 0;
          animation: authSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        }
        .auth-anim-2 {
          opacity: 0;
          animation: authSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }
        .auth-anim-3 {
          opacity: 0;
          animation: authSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
        }
        @keyframes authFadeScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes authSlideUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Button effects */
        .auth-submit-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 28px var(--primary-glow) !important;
        }
        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98) !important;
        }
        .auth-submit-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }
        .auth-submit-btn:hover::after {
          animation: authShimmer 0.8s ease-in-out;
        }
        @keyframes authShimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .auth-admin-btn {
          transition: all 0.3s ease !important;
        }
        .auth-admin-btn:hover {
          background: var(--border) !important;
          border-color: var(--border-hover) !important;
          transform: translateY(-1px) !important;
        }

        .auth-toggle-link {
          transition: filter 0.2s ease !important;
        }
        .auth-toggle-link:hover {
          filter: brightness(1.2);
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
        }
      `}} />
    </div>
  );
}

export default Auth;

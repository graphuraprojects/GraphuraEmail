import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, Loader2, AlertCircle, Shield, ArrowRight, Eye, EyeOff, Terminal, Server, Database, Cpu, Globe, Zap, Code, Cloud, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function AdminAuth({ onLogin, token }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/admin');
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await axios.post(`${API_URL}${endpoint}`, {
        email, password, role: 'admin',
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
      <div className="adm-auth-left" style={{
        flex: '1.15',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        color: '#fff',
        overflow: 'hidden'
      }}>
        {/* Hero Background Image */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/admin_login_hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>

        {/* Gradient Overlay for Text Readability */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to right, rgba(12, 14, 20, 0.9) 0%, rgba(12, 14, 20, 0.4) 100%)'
        }}></div>

        {/* Floating orbs */}
        <div className="adm-orb adm-orb-1"></div>
        <div className="adm-orb adm-orb-2"></div>

        {/* Floating icons overlay */}
        {[
          { Icon: Shield, top: '12%', left: '15%', cls: 'adm-fi-1' },
          { Icon: Server, top: '25%', right: '12%', cls: 'adm-fi-2' },
          { Icon: Database, top: '55%', left: '8%', cls: 'adm-fi-3' },
          { Icon: Cloud, top: '70%', right: '20%', cls: 'adm-fi-4' },
          { Icon: Cpu, top: '40%', left: '70%', cls: 'adm-fi-5' },
          { Icon: Globe, top: '8%', right: '30%', cls: 'adm-fi-6' },
          { Icon: Code, top: '85%', left: '40%', cls: 'adm-fi-7' },
          { Icon: Wifi, top: '18%', left: '55%', cls: 'adm-fi-8' },
          { Icon: Zap, top: '60%', right: '8%', cls: 'adm-fi-9' },
        ].map(({ Icon, cls, ...pos }, i) => (
          <div key={i} className={`adm-fi ${cls}`} style={{ position: 'absolute', ...pos, zIndex: 2, color: 'rgba(16,185,129,0.2)', pointerEvents: 'none' }}>
            <Icon size={20} />
          </div>
        ))}

        <div style={{ position: 'relative', zIndex: 10 }}>
          <div className="adm-anim-fade" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(16,185,129,0.1)', backdropFilter: 'blur(20px)',
            padding: '10px 20px', borderRadius: '14px', marginBottom: '2.5rem',
            border: '1px solid rgba(16,185,129,0.2)'
          }}>
            <img src="/GraphuraLogo.jpg" alt="Graphura" style={{ height: '38px', display: 'block', objectFit: 'contain', borderRadius: '8px', filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', color: '#fff' }}>Admin Console</span>
          </div>

          <h1 className="adm-anim-1" style={{ fontSize: '3.25rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
            System<br/>Control Center
          </h1>
          <h2 className="adm-anim-2" style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '2rem', color: 'rgba(255,255,255,0.7)' }}>
            Infrastructure • Governance • Security
          </h2>

          <div className="adm-anim-3" style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            {[
              { label: 'RBAC', sub: 'Access Control' },
              { label: 'Full', sub: 'Audit Logs' },
              { label: 'Live', sub: 'Monitoring' }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '1rem 1.25rem', borderRadius: '14px',
                background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.08)', minWidth: '100px'
              }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.2rem', color: '#34d399' }}>{item.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: '1',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <div style={{ maxWidth: '400px', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
              }}>
                <Terminal size={16} color="white" />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Admin Access
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
              {isLogin ? 'Secure Entry' : 'Initialize Admin'}
            </h1>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.875rem', fontWeight: 500 }}>
              Authorize administrative access to the platform
            </p>
          </div>

          {error && (
            <div style={{
              padding: '0.875rem 1rem', background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.15)', borderRadius: '12px',
              marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
              color: 'var(--error)', fontSize: '0.85rem', fontWeight: 600
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={iconStyle} />
                <input type="email" placeholder="Admin Email" style={inputStyle}
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={iconStyle} />
                <input type={showPassword ? "text" : "password"} placeholder="Secret Password" style={{ ...inputStyle, paddingRight: '48px' }}
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', width: 'auto', boxShadow: 'none' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ position: 'relative' }}>
                  <Shield size={17} style={{ ...iconStyle, color: '#34d399' }} />
                  <input type="password" placeholder="Master Access Code" style={{ ...inputStyle, borderColor: 'var(--border)', background: 'var(--input-bg)' }}
                    value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required
                    onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="adm-submit-btn" style={{
              height: '3.25rem', width: '100%', borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff',
              border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(16,185,129,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              position: 'relative', overflow: 'hidden', marginTop: '1.5rem'
            }}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>{isLogin ? 'Authorize' : 'Create Administrator'} <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="adm-toggle-link"
              style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', width: 'auto', boxShadow: 'none', padding: 0, display: 'inline-block' }}>
              {isLogin ? "Initialize new system admin?" : "Return to secure entry"}
            </button>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button type="button" onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', width: 'auto', boxShadow: 'none', padding: 0, display: 'inline-block' }}>
              ← Back to User Portal
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Orbs */
        .adm-orb { position: absolute; border-radius: 50%; z-index: 2; pointer-events: none; }
        .adm-orb-1 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
          top: -10%; right: -5%;
          animation: admOrbF1 8s ease-in-out infinite;
        }
        .adm-orb-2 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%);
          bottom: 10%; left: -5%;
          animation: admOrbF2 10s ease-in-out infinite;
        }
        @keyframes admOrbF1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20px, 30px) scale(1.1); } }
        @keyframes admOrbF2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(15px, -25px) scale(1.05); } }

        /* Floating icons */
        @keyframes admDrift1 { 0%, 100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(8px,-12px) rotate(8deg); } }
        @keyframes admDrift2 { 0%, 100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-10px,-8px) rotate(-6deg); } }
        @keyframes admDrift3 { 0%, 100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(6px,10px) rotate(10deg); } }
        .adm-fi-1 { animation: admDrift1 7s ease-in-out infinite; }
        .adm-fi-2 { animation: admDrift2 9s ease-in-out 0.5s infinite; }
        .adm-fi-3 { animation: admDrift3 8s ease-in-out 1s infinite; }
        .adm-fi-4 { animation: admDrift1 10s ease-in-out 1.5s infinite; }
        .adm-fi-5 { animation: admDrift2 7.5s ease-in-out 0.8s infinite; }
        .adm-fi-6 { animation: admDrift3 9.5s ease-in-out 0.3s infinite; }
        .adm-fi-7 { animation: admDrift1 8.5s ease-in-out 2s infinite; }
        .adm-fi-8 { animation: admDrift2 11s ease-in-out 0.7s infinite; }
        .adm-fi-9 { animation: admDrift3 7s ease-in-out 1.2s infinite; }

        /* Text animations */
        .adm-anim-fade { animation: admFadeScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .adm-anim-1 { opacity: 0; animation: admSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards; }
        .adm-anim-2 { opacity: 0; animation: admSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; }
        .adm-anim-3 { opacity: 0; animation: admSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards; }
        @keyframes admFadeScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes admSlideUp { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }

        /* Button */
        .adm-submit-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; }
        .adm-submit-btn:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 12px 28px rgba(16,185,129,0.35) !important; }
        .adm-submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.98) !important; }
        .adm-submit-btn::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
        }
        .adm-submit-btn:hover::after { animation: admShimmer 0.8s ease-in-out; }
        @keyframes admShimmer { 0% { left: -100%; } 100% { left: 100%; } }

        .adm-toggle-link { transition: filter 0.2s !important; }
        .adm-toggle-link:hover { filter: brightness(1.2); text-decoration: underline; }

        @media (max-width: 900px) {
          .adm-auth-left { display: none !important; }
        }
      `}} />
    </div>
  );
}

export default AdminAuth;

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  Mail, LogOut, LayoutDashboard, UserCircle,
  Plus, Inbox, Send, Trash2, Clock,
  Menu, X, Users, Settings, MessageSquare, History, Globe, Sun, Moon
} from 'lucide-react';
import AdminAuth from './pages/AdminAuth';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import ComposeMail from './pages/Dashboard';
import SentLogs from './pages/SentLogs';
import StatsOverview from './pages/StatsOverview';
import ScheduledMails from './pages/ScheduledMails';
import AdminDashboard from './pages/AdminDashboard';
import EmailConfiguration from './pages/EmailConfiguration';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ComposeSms from './pages/ComposeSms';
import SmsLogs from './pages/SmsLogs';
import SmsInbox from './pages/SmsInbox';
import WebhookSettings from './pages/WebhookSettings';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [stats, setStats] = useState(null);
  const [userData, setUserData] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const fetchGlobalStats = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
      setUserData(res.data.user);
    } catch (err) {
      console.error('Global stats fetch error');
    }
  };

  // Global Axios Interceptor for real-time status check
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403 && error.response?.data?.error === 'Account Deactivated') {
          handleLogout();
          alert('Your account has been deactivated or blocked by an administrator.');
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [userRole]);

  useEffect(() => {
    if (token) {
      fetchGlobalStats();
      const interval = setInterval(fetchGlobalStats, 10000); // Every 10s
      return () => clearInterval(interval);
    }
  }, [token]);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleLogin = (data, redirectTo) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    setToken(data.token);
    setUserEmail(data.email);
    setUserRole(data.role);

    if (redirectTo) {
      navigate(redirectTo);
    } else if (data.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    const roleBeforeLogout = userRole;
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setToken(null);
    setUserEmail(null);
    setUserRole(null);
    setStats(null);
    setUserData(null);

    if (roleBeforeLogout === 'admin') {
      navigate('/admin/login');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    const publicPaths = ['/login', '/register', '/admin/login', '/forgot-password', '/reset-password'];
    if (!token && !publicPaths.includes(location.pathname)) {
      if (location.pathname.startsWith('/admin')) {
        navigate('/admin/login');
      } else {
        navigate('/login');
      }
    }
  }, [token, location.pathname, navigate, userRole]);

  if (!token && !['/login', '/register', '/admin/login', '/forgot-password', '/reset-password'].includes(location.pathname)) {
    return null;
  }

  if (token) {
    return (
      <div className="app-layout">
        {/* Mobile Header */}
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
            <Mail size={22} />
            <span style={{ letterSpacing: '-0.02em' }}>Graphura Mail</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={toggleTheme} 
              style={{ width: '38px', height: '38px', padding: 0, borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={toggleMenu} style={{ width: '38px', height: '38px', padding: 0, background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '10px' }}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Overlay */}
        <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}></div>

        <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
              <Mail size={18} color="white" />
            </div>
            <span className="logo-text" style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Graphura</span>
          </div>

          <div className="sidebar-menu-wrapper">
            <Link to="/compose" className="compose-btn" onClick={closeMenu}>
              <Plus size={18} />
              <span>Compose Mail</span>
            </Link>

            <div style={{ padding: '0 0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</span>
            </div>

            <nav>
              <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={closeMenu}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/sent" className={`nav-item ${location.pathname === '/sent' ? 'active' : ''}`} onClick={closeMenu}>
                <Send size={18} />
                <span>Sent Mail</span>
              </Link>
              <Link to="/scheduled" className={`nav-item ${location.pathname === '/scheduled' ? 'active' : ''}`} onClick={closeMenu}>
                <Clock size={18} />
                <span>Scheduled</span>
              </Link>
              <Link to="/trash" className={`nav-item ${location.pathname === '/trash' ? 'active' : ''}`} onClick={closeMenu}>
                <Trash2 size={18} />
                <span>Trash</span>
              </Link>

              <div style={{ margin: '1.25rem 0 0.5rem 0', padding: '0 0.75rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                Messaging
              </div>

              <Link to="/compose-sms" className={`nav-item ${location.pathname === '/compose-sms' ? 'active' : ''}`} onClick={closeMenu}>
                <MessageSquare size={18} />
                <span>Send SMS</span>
              </Link>
              <Link to="/sms-logs" className={`nav-item ${location.pathname === '/sms-logs' ? 'active' : ''}`} onClick={closeMenu}>
                <History size={18} />
                <span>SMS History</span>
              </Link>
              <Link to="/sms-inbox" className={`nav-item ${location.pathname === '/sms-inbox' ? 'active' : ''}`} onClick={closeMenu}>
                <Inbox size={18} />
                <span>SMS Inbox</span>
              </Link>
              <Link to="/webhooks" className={`nav-item ${location.pathname === '/webhooks' ? 'active' : ''}`} onClick={closeMenu}>
                <Globe size={18} />
                <span>Webhooks</span>
              </Link>

              {userRole === 'admin' && (
                <>
                  <div style={{ margin: '1.25rem 0 0.5rem 0', padding: '0 0.75rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                    Administration
                  </div>
                  <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`} onClick={closeMenu}>
                    <Users size={18} />
                    <span>Manage Users</span>
                  </Link>
                  <Link to="/admin/config" className={`nav-item ${location.pathname === '/admin/config' ? 'active' : ''}`} onClick={closeMenu}>
                    <Settings size={18} />
                    <span>System Config</span>
                  </Link>
                </>
              )}

              <div style={{ margin: '1.25rem 0 0.5rem 0', padding: '0 0.75rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                Account
              </div>

              <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`} onClick={closeMenu}>
                <UserCircle size={18} />
                <span>Profile</span>
              </Link>
            </nav>

            {/* Real Data Monitor Widget */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.4rem', color: 'var(--text-soft)' }}>
                  <span style={{ fontWeight: 600 }}>Daily Emails</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{userRole === 'admin' ? `${stats?.sentToday || 0} / ∞` : `${stats?.sentToday || 0} / ${userData?.dailyLimit || 100}`}</span>
                </div>
                {userRole !== 'admin' && (
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, ((stats?.sentToday || 0) / (userData?.dailyLimit || 100)) * 100)}%`,
                      height: '100%',
                      background: 'var(--gradient-accent)',
                      borderRadius: '4px',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>
                  </div>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.4rem', color: 'var(--text-soft)' }}>
                  <span style={{ fontWeight: 600 }}>Storage</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{userRole === 'admin' ? `${formatBytes(stats?.totalStorageUsed)} / ∞` : `${formatBytes(stats?.totalStorageUsed)} / ${formatBytes(userData?.storageLimit || 10485760)}`}</span>
                </div>
                {userRole !== 'admin' && (
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, ((stats?.totalStorageUsed || 0) / (userData?.storageLimit || 10485760)) * 100)}%`,
                      height: '100%',
                      background: 'var(--gradient-primary)',
                      borderRadius: '4px',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'rgba(244, 63, 94, 0.06)', cursor: 'pointer', color: '#fb7185', borderRadius: '10px', marginTop: '0.5rem' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <div className="main-content">
          <header className="desktop-only-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 style={{ margin: 0, textTransform: 'capitalize', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                {location.pathname === '/dashboard' ? 'Analytics Overview' : location.pathname.replace('/', '').replace('-', ' ')}
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage your communications efficiently</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right', marginRight: '0.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{userEmail?.split('@')[0]}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{userRole === 'admin' ? 'Super Admin' : 'Email User'}</div>
              </div>
              <button 
                onClick={toggleTheme} 
                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)', transition: 'all 0.2s' }}>
                {userEmail?.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <Routes>
            <Route path="/dashboard" element={<StatsOverview />} />
            <Route path="/compose" element={<ComposeMail token={token} onSent={fetchGlobalStats} />} />
            <Route path="/compose-sms" element={<ComposeSms token={token} onSent={fetchGlobalStats} />} />
            <Route path="/sent" element={<SentLogs token={token} />} />
            <Route path="/scheduled" element={<ScheduledMails token={token} />} />
            <Route path="/trash" element={<SentLogs token={token} isTrash={true} />} />
            <Route path="/profile" element={<Profile onBack={() => navigate('/dashboard')} />} />
            <Route path="/sms-logs" element={<SmsLogs token={token} />} />
            <Route path="/sms-inbox" element={<SmsInbox token={token} />} />
            <Route path="/webhooks" element={<WebhookSettings token={token} />} />
            {userRole === 'admin' && <Route path="/admin" element={<AdminDashboard token={token} />} />}
            {userRole === 'admin' && <Route path="/admin/config" element={<EmailConfiguration token={token} />} />}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Auth onLogin={handleLogin} token={token} />} />
      <Route path="/register" element={<Auth onLogin={handleLogin} token={token} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminAuth onLogin={handleLogin} token={token} />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;

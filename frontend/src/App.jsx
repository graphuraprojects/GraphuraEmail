import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  Mail, LogOut, LayoutDashboard, UserCircle,
  Plus, Inbox, Send, Trash2, Clock,
  Menu, X, Users, Settings
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

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [stats, setStats] = useState(null);
  const [userData, setUserData] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

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

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    setToken(data.token);
    setUserEmail(data.email);
    setUserRole(data.role);

    if (data.role === 'admin') {
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
    } else if (token && publicPaths.includes(location.pathname)) {
      // Redirect based on role if logged in but on a public page
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
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
            <Mail size={24} />
            <span>ZEPTO-BULK</span>
          </div>
          <button onClick={toggleMenu} style={{ width: '40px', height: '40px', padding: 0, background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Overlay */}
        <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}></div>

        <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: 'var(--primary)', fontSize: '1.25rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
            <Mail size={28} />
            <span className="logo-text">Graphura-Mail</span>
          </div>

          <div className="sidebar-menu-wrapper">
            <Link to="/compose" className="compose-btn" onClick={closeMenu}>
              <Plus size={20} />
              <span>Compose</span>
            </Link>

            <nav>
              <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={closeMenu}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/sent" className={`nav-item ${location.pathname === '/sent' ? 'active' : ''}`} onClick={closeMenu}>
                <Send size={20} />
                <span>Sent Mail</span>
              </Link>
              <Link to="/scheduled" className={`nav-item ${location.pathname === '/scheduled' ? 'active' : ''}`} onClick={closeMenu}>
                <Clock size={20} />
                <span>Scheduled</span>
              </Link>
              <Link to="/trash" className={`nav-item ${location.pathname === '/trash' ? 'active' : ''}`} onClick={closeMenu}>
                <Trash2 size={20} />
                <span>Trash</span>
              </Link>

              {userRole === 'admin' && (
                <>
                  <div style={{ margin: '2rem 0 0.5rem 0', padding: '0 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Administration
                  </div>
                  <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`} onClick={closeMenu}>
                    <Users size={20} />
                    <span>Manage Users</span>
                  </Link>
                  <Link to="/admin/config" className={`nav-item ${location.pathname === '/admin/config' ? 'active' : ''}`} onClick={closeMenu}>
                    <Settings size={20} />
                    <span>System Config</span>
                  </Link>
                </>
              )}

              <div style={{ margin: '2rem 0 0.5rem 0', padding: '0 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Account
              </div>

              <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`} onClick={closeMenu}>
                <UserCircle size={20} />
                <span>Profile Settings</span>
              </Link>
            </nav>

            {/* Real Data Monitor Widget */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '1rem', marginBottom: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>Daily Emails</span>
                  <span>{userRole === 'admin' ? `${stats?.sentToday || 0} / Unlimited` : `${stats?.sentToday || 0} / ${userData?.dailyLimit || 100}`}</span>
                </div>
                {userRole !== 'admin' && (
                  <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, ((stats?.sentToday || 0) / (userData?.dailyLimit || 100)) * 100)}%`,
                      height: '100%',
                      background: 'var(--accent)',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>Account Storage</span>
                  <span>{userRole === 'admin' ? `${formatBytes(stats?.totalStorageUsed)} / Unlimited` : `${formatBytes(stats?.totalStorageUsed)} / ${formatBytes(userData?.storageLimit || 10485760)}`}</span>
                </div>
                {userRole !== 'admin' && (
                  <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, ((stats?.totalStorageUsed || 0) / (userData?.storageLimit || 10485760)) * 100)}%`,
                      height: '100%',
                      background: 'var(--primary)',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--error)' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        <div className="main-content">
          <header className="desktop-only-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ margin: 0, textTransform: 'capitalize', fontSize: '1.5rem' }}>
                {location.pathname === '/dashboard' ? 'Analytics Overview' : location.pathname.replace('/', '').replace('-', ' ')}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{userEmail?.split('@')[0]}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userRole === 'admin' ? 'Super Admin' : 'Email User'}</div>
              </div>
              <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                {userEmail?.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <Routes>
            <Route path="/dashboard" element={<StatsOverview />} />
            <Route path="/compose" element={<ComposeMail token={token} onSent={fetchGlobalStats} />} />
            <Route path="/sent" element={<SentLogs token={token} />} />
            <Route path="/scheduled" element={<ScheduledMails token={token} />} />
            <Route path="/trash" element={<SentLogs token={token} isTrash={true} />} />
            <Route path="/profile" element={<Profile onBack={() => navigate('/dashboard')} />} />
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
      <Route path="/login" element={<Auth onLogin={handleLogin} />} />
      <Route path="/register" element={<Auth onLogin={handleLogin} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminAuth onLogin={handleLogin} />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;

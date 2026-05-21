import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, Mail, BarChart3, ArrowLeft, Loader2,
  Shield, CheckCircle2, XCircle, Activity,
  Settings, Key, ExternalLink, Calendar, X,
  BadgeCheck, Clock, Hash
} from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function Profile({ onBack }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'edit' or 'password'
  const [formData, setFormData] = useState({ email: '', oldPassword: '', newPassword: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState({ type: '', message: '' });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(response.data);
      setFormData({ ...formData, email: response.data.user.email });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalStatus({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/auth/update-profile`, { email: formData.email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalStatus({ type: 'success', message: 'Profile updated!' });
      localStorage.setItem('userEmail', formData.email);
      fetchProfile();
      setTimeout(() => setModal(null), 1500);
    } catch (err) {
      setModalStatus({ type: 'error', message: err.response?.data?.error || 'Update failed' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalStatus({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/auth/change-password`, {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalStatus({ type: 'success', message: 'Password changed!' });
      setTimeout(() => setModal(null), 1500);
    } catch (err) {
      setModalStatus({ type: 'error', message: err.response?.data?.error || 'Update failed' });
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  const user = profileData?.user;
  const stats = profileData?.stats;
  const initial = user?.email?.charAt(0).toUpperCase() || '?';

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="profile-page animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '18px', 
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'white',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
          }}>
            {initial}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>Account Settings</h1>
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
              Manage your personal information and security
            </p>
          </div>
        </div>
        <button 
          onClick={() => setModal('edit')}
          style={{ width: 'auto', padding: '0.55rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', boxShadow: 'none' }}
        >
          Edit Profile
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
              <CheckCircle2 size={18} />
            </div>
            <span className="stat-label">Today Success</span>
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            {stats?.sentToday || 0}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {user?.role === 'admin' ? '∞' : '250'}</span>
          </div>
          {user?.role !== 'admin' && (
            <div style={{ marginTop: '0.875rem' }}>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min(100, ((stats?.sentToday || 0) / 250) * 100)}%`, 
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  borderRadius: '5px',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8' }}>
              <Activity size={18} />
            </div>
            <span className="stat-label">Account Storage</span>
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', fontSize: '1.25rem' }}>
            {formatBytes(stats?.totalStorageUsed || 0)}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {user?.role === 'admin' ? '∞' : formatBytes(user?.storageLimit || 10485760)}</span>
          </div>
          {user?.role !== 'admin' && (
            <div style={{ marginTop: '0.875rem' }}>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min(100, ((stats?.totalStorageUsed || 0) / (user?.storageLimit || 10485760)) * 100)}%`, 
                  background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                  borderRadius: '5px',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.12)', color: '#fb7185' }}>
              <XCircle size={18} />
            </div>
            <span className="stat-label">Total Failures</span>
          </div>
          <div className="stat-value">{stats?.totalFailed || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
        {/* Main Info */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, color: 'var(--text-main)' }}>
            <User size={18} color="#818cf8" /> Personal Information
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div className="info-row">
              <div className="info-label"><Mail size={15} /> Email Address</div>
              <div className="info-value">{user?.email}</div>
            </div>
            <div className="info-row">
              <div className="info-label"><Shield size={15} /> Account Role</div>
              <div className="info-value">
                <span style={{ 
                  textTransform: 'capitalize', 
                  background: user?.role === 'admin' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.06)',
                  color: user?.role === 'admin' ? '#a5b4fc' : 'var(--text-main)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em'
                }}>
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-label"><Calendar size={15} /> Member Since</div>
              <div className="info-value">{new Date(user?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div className="info-row">
              <div className="info-label"><Hash size={15} /> User ID</div>
              <div className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?._id}</div>
            </div>
          </div>
        </div>

        {/* Security Quick Access */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              <Key size={16} color="#818cf8" /> Security
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Ensure your account is protected with a strong password.
            </p>
            <button 
              className="outline-btn"
              onClick={() => setModal('password')}
              style={{ fontSize: '0.85rem' }}
            >
              Update Password
            </button>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.1)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.875rem', color: '#a5b4fc', fontWeight: 700 }}>System Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
              <BadgeCheck size={17} /> API Connection Active
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '2rem', animation: 'slideUp 0.3s ease-out', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{modal === 'edit' ? 'Edit Profile' : 'Change Password'}</h2>
              <button onClick={() => setModal(null)} style={{ width: 'auto', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', padding: '0.35rem', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'none' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={modal === 'edit' ? handleUpdateProfile : handleChangePassword}>
              {modal === 'edit' ? (
                <div className="form-group">
                  <label>New Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="name@example.com"
                    required 
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      value={formData.oldPassword} 
                      onChange={e => setFormData({ ...formData, oldPassword: e.target.value })} 
                      placeholder="••••••••"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={formData.newPassword} 
                      onChange={e => setFormData({ ...formData, newPassword: e.target.value })} 
                      placeholder="••••••••"
                      required 
                    />
                  </div>
                </>
              )}

              {modalStatus.message && (
                <div style={{ 
                  padding: '0.75rem', 
                  borderRadius: '10px', 
                  marginBottom: '1rem', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: modalStatus.type === 'error' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: modalStatus.type === 'error' ? '#fb7185' : '#34d399',
                  border: `1px solid ${modalStatus.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)'}`
                }}>
                  {modalStatus.message}
                </div>
              )}

              <button type="submit" disabled={modalLoading} style={{ marginTop: '0.5rem' }}>
                {modalLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 0;
          border-bottom: 1px solid var(--border);
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.825rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .info-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .outline-btn {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid var(--border) !important;
          color: var(--text-main) !important;
          width: 100%;
          box-shadow: none !important;
        }
        .outline-btn:hover {
          background: rgba(99,102,241,0.08) !important;
          border-color: rgba(99,102,241,0.2) !important;
          color: #a5b4fc !important;
          transform: none !important;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 768px) {
          .profile-page .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}

export default Profile;

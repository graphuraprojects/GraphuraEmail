import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, Mail, BarChart3, ArrowLeft, Loader2,
  Shield, CheckCircle2, XCircle, Activity,
  Settings, Key, ExternalLink, Calendar, X,
  BadgeCheck, Clock, Hash
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

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
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'white',
            boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)'
          }}>
            {initial}
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Account Settings</h1>
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Manage your personal information and security
            </p>
          </div>
        </div>
        <button 
          onClick={() => setModal('edit')}
          style={{ width: 'auto', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.875rem' }}
        >
          Edit Profile
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)' }}>
              <CheckCircle2 size={20} />
            </div>
            <span className="stat-label">Today Success</span>
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            {stats?.sentToday || 0}<span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ {user?.role === 'admin' ? 'Unlimited' : '250'}</span>
          </div>
          {user?.role !== 'admin' && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min(100, ((stats?.sentToday || 0) / 250) * 100)}%`, 
                  background: 'var(--accent)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
              <Activity size={20} />
            </div>
            <span className="stat-label">Account Storage</span>
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            {formatBytes(stats?.totalStorageUsed || 0)}<span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ {user?.role === 'admin' ? 'Unlimited' : formatBytes(user?.storageLimit || 10485760)}</span>
          </div>
          {user?.role !== 'admin' && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min(100, ((stats?.totalStorageUsed || 0) / (user?.storageLimit || 10485760)) * 100)}%`, 
                  background: 'var(--primary)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
              <XCircle size={20} />
            </div>
            <span className="stat-label">Total Failures</span>
          </div>
          <div className="stat-value">{stats?.totalFailed || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
        {/* Main Info */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={20} color="var(--primary)" /> Personal Information
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="info-row">
              <div className="info-label"><Mail size={16} /> Email Address</div>
              <div className="info-value">{user?.email}</div>
            </div>
            <div className="info-row">
              <div className="info-label"><Shield size={16} /> Account Role</div>
              <div className="info-value">
                <span style={{ 
                  textTransform: 'capitalize', 
                  background: user?.role === 'admin' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0,0,0,0.05)',
                  color: user?.role === 'admin' ? 'var(--primary)' : 'inherit',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-label"><Calendar size={16} /> Member Since</div>
              <div className="info-value">{new Date(user?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div className="info-row">
              <div className="info-label"><Hash size={16} /> User ID</div>
              <div className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?._id}</div>
            </div>
          </div>
        </div>

        {/* Security Quick Access */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={18} color="var(--primary)" /> Security
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Ensure your account is protected with a strong password.
            </p>
            <button 
              className="outline-btn"
              onClick={() => setModal('password')}
              style={{ fontSize: '0.875rem' }}
            >
              Update Password
            </button>
          </div>

          <div className="card" style={{ padding: '1.5rem', background: 'rgba(79, 70, 229, 0.02)', borderColor: 'rgba(79, 70, 229, 0.1)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)' }}>System Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600 }}>
              <BadgeCheck size={18} /> API Connection Active
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{modal === 'edit' ? 'Edit Profile' : 'Change Password'}</h2>
              <button onClick={() => setModal(null)} style={{ width: 'auto', background: 'none', color: 'var(--text-muted)', padding: '0.25rem' }}>
                <X size={20} />
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
                  borderRadius: '0.75rem', 
                  marginBottom: '1rem', 
                  fontSize: '0.875rem',
                  background: modalStatus.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: modalStatus.type === 'error' ? 'var(--error)' : 'var(--accent)'
                }}>
                  {modalStatus.message}
                </div>
              )}

              <button type="submit" disabled={modalLoading} style={{ marginTop: '0.5rem' }}>
                {modalLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
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
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border);
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .info-value {
          font-size: 0.875rem;
          font-weight: 600;
        }
        .outline-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-main);
          width: 100%;
        }
        .outline-btn:hover {
          background: var(--glass);
          border-color: var(--primary);
          color: var(--primary);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default Profile;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
  Users, Shield, Trash2, Search, Mail, Settings, Save, Globe, Lock, UserCircle,
  CheckCircle2, AlertCircle, Loader2,
  Ban, Check, Edit2, HardDrive, Zap, X, TrendingUp, LogIn, Eye, Plus, RefreshCw
} from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin`;

function AdminDashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'user', 
    department: 'General',
    phone: '',
    designation: '',
    location: '',
    secretKey: '',
    gender: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('users');
  const [actionLoading, setActionLoading] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const location = useLocation();

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('FETCHING ADMIN DATA...');
      const [usersRes, statsRes, logsRes, dailyRes] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/logs`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/stats/daily`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      console.log('ADMIN DATA RECEIVED:', {
        usersCount: usersRes.data.length,
        stats: statsRes.data,
        firstUser: usersRes.data[0]
      });
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setLogs(logsRes.data);
      setDailyStats(dailyRes.data);
    } catch (err) {
      console.error('FETCH DATA ERROR:', err);
      console.error('Error Details:', err.response?.data);
      setError(`Failed to fetch system data: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleUpdateUser = async (userId, data) => {
    try {
      setActionLoading(userId);
      await axios.put(`${API_URL}/users/${userId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingUser(null);
      fetchData(); // Refresh everything
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete their email logs.')) return;
    try {
      setActionLoading(userId);
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== userId));
      fetchData(); // Refresh everything
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleImpersonate = async (userId) => {
    try {
      setActionLoading(userId);
      const res = await axios.post(`${API_URL}/impersonate/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { token: userToken, email, role } = res.data;

      // Construct the URL with impersonation data
      const impersonateUrl = `${window.location.origin}/login?impersonate_token=${userToken}&email=${encodeURIComponent(email)}&role=${role}`;

      // Open in new tab
      window.open(impersonateUrl, '_blank');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to impersonate user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.split('@')[1]?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAddModalOpen(false);
      setNewUser({ 
        name: '', email: '', password: '', role: 'user', department: 'General',
        phone: '', designation: '', location: '', secretKey: '', gender: '', 
        joiningDate: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#fff', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', margin: '2rem' }}>
        <div style={{ width: '80px', height: '80px', background: '#fef2f2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <AlertCircle size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Connection Failed</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={fetchData}
            style={{ padding: '0.75rem 2rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}
          >
            Retry Connection
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{ padding: '0.75rem 2rem', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Back to User Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="admin-container animate-fade-in" style={{ padding: '2.5rem', minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Stats Cards */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Users */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '12px', background: '#eef2ff', color: '#6366f1', borderRadius: '14px' }}>
              <Users size={22} />
            </div>
            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>User Registry</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{stats?.users?.total || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>{stats?.users?.active || 0} active</div>
          </div>
        </div>

        {/* Global Traffic */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '12px', background: '#ecfdf5', color: '#10b981', borderRadius: '14px' }}>
              <Mail size={22} />
            </div>
            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Email Volume</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{stats?.emails?.totalSent || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>{stats?.emails?.successCount || 0} success</div>
          </div>
        </div>

        {/* Storage */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '12px', background: '#fff7ed', color: '#f59e0b', borderRadius: '14px' }}>
              <HardDrive size={22} />
            </div>
            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Cloud Storage</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{formatBytes(stats?.emails?.totalSize || 0)}</div>
        </div>

        {/* ZeptoMail Balance - Premium Dark Card */}
        <div style={{
          background: '#0f172a', padding: '1.5rem', borderRadius: '24px', color: '#fff',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.2)', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)', zIndex: 0 }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '10px', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', borderRadius: '12px' }}>
                  <Shield size={20} />
                </div>
                <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credits</span>
              </div>
              <button
                onClick={async () => {
                  const newTotal = prompt('Enter Total Purchased Credits:', stats?.emails?.totalPurchased || 0);
                  if (newTotal !== null) {
                    try {
                      await axios.post(`${API_URL}/credits`, { totalPurchased: parseInt(newTotal) }, { headers: { Authorization: `Bearer ${token}` } });
                      fetchData();
                    } catch (err) { alert('Failed to update credits'); }
                  }
                }}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', color: '#fff', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Update Credits"
              >
                <Plus size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '0.25rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: (stats?.emails?.remainingCredits || 0) < 1000 ? '#f87171' : '#fbbf24', letterSpacing: '-0.02em' }}>
                {stats?.emails?.remainingCredits?.toLocaleString() || 0}
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Of {stats?.emails?.totalPurchased?.toLocaleString() || 0} remaining
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'users' ? '#4f46e5' : '#fff',
            color: activeTab === 'users' ? '#fff' : '#6b7280',
            boxShadow: activeTab === 'users' ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'activity' ? '#4f46e5' : '#fff',
            color: activeTab === 'activity' ? '#fff' : '#6b7280',
            boxShadow: activeTab === 'activity' ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          Platform Activity
        </button>
      </div>

      {/* Filters & Search */}
      <div className="filters-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-wrapper" style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by name, email or domain..."
            style={{ paddingLeft: '40px', width: '100%', height: '2.75rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group" style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ height: '2.75rem', padding: '0 1rem', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.875rem' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="user">User</option>
            <option value="intern">Intern</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: '2.75rem', padding: '0 1rem', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.875rem' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{ height: '2.75rem', padding: '0 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Users size={18} /> Add User
        </button>
      </div>

      {/* Content Section */}
      {activeTab === 'users' ? (
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>Core User Management</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>Full control over organization users, roles, and email limits</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Basic Info</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Department/Role</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status/Login</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Email Activity</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Limits</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>
                      <Users size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                      <p>No users found matching your search</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{user.name || 'No Name'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user.email}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.department}</div>
                        <div style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase' }}>{user.role}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.625rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 700,
                          background: user.status === 'active' ? '#ecfdf5' : user.status === 'blocked' ? '#fef2f2' : '#f9fafb',
                          color: user.status === 'active' ? '#059669' : user.status === 'blocked' ? '#dc2626' : '#6b7280'
                        }}>{(user.status || 'inactive').toUpperCase()}</span>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '4px' }}>Last: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <div title="Success Sent">
                            <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>Sent</div>
                            <div style={{ fontWeight: 700, color: '#059669' }}>{user.totalSentAllTime || 0}</div>
                          </div>
                          <div title="Failed Emails">
                            <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>Fail</div>
                            <div style={{ fontWeight: 700, color: '#dc2626' }}>{user.totalFailedAllTime || 0}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8125rem' }}>
                        <div style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={12} /> {user.sentToday || 0}/{user.dailyLimit}</div>
                        <div style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}><HardDrive size={12} /> {formatBytes(user.totalUsedStorage || 0)}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingUser(user)}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#4f46e5', cursor: 'pointer' }}
                            title="Edit User"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleImpersonate(user._id)}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#10b981', cursor: 'pointer' }}
                            title="Login as User"
                          >
                            <LogIn size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={user.role === 'admin' || actionLoading === user._id}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#ef4444', cursor: 'pointer', opacity: user.role === 'admin' ? 0.4 : 1 }}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Traffic Summary */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800, color: '#111827' }}>7-Day Platform Traffic</h3>
            <div style={{ display: 'flex', gap: '0.5rem', height: '150px', alignItems: 'flex-end', paddingBottom: '20px' }}>
              {dailyStats.map((day) => {
                const total = (day.success || 0) + (day.failed || 0);
                const totals = dailyStats.map(d => (d.success || 0) + (d.failed || 0));
                const maxTotal = totals.length > 0 ? Math.max(...totals) : 1;
                const safeMaxTotal = maxTotal > 0 ? maxTotal : 1;
                const height = (total / safeMaxTotal) * 100;
                return (
                  <div key={day._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100px', gap: '2px' }}>
                      <div style={{ height: `${((day.success || 0) / (total || 1)) * height}%`, background: '#10b981', borderRadius: '4px', width: '100%' }}></div>
                      <div style={{ height: `${((day.failed || 0) / (total || 1)) * height}%`, background: '#ef4444', borderRadius: '4px', width: '100%' }}></div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>{day._id.split('-').slice(1).join('/')}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }}></div>
                <span style={{ color: '#4b5563' }}>Success</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }}></div>
                <span style={{ color: '#4b5563' }}>Failed</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>Real-Time System Activity</h2>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>Live monitoring of all organizational email transactions</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Timestamp</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Sender</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Subject</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Content Preview</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: '#6b7280' }}>
                        {new Date(log.sentAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{log.sentBy?.email || 'Unknown'}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: '#111827', fontWeight: 600 }}>
                        {log.subject}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#6b7280', maxWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}>
                            {log.body?.replace(/<[^>]*>?/gm, '') || 'No content'}
                          </div>
                          <button
                            onClick={() => setSelectedLog(log)}
                            style={{ padding: '4px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: '#4f46e5', cursor: 'pointer', display: 'flex' }}
                            title="View Full Content"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: log.status === 'success' ? '#ecfdf5' : '#fef2f2',
                          color: log.status === 'success' ? '#059669' : '#dc2626'
                        }}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* Add User Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Create New User</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Full Name</label>
                  <input required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Email Address</label>
                  <input required type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Department</label>
                  <input required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Password</label>
                  <input required type="password" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Role</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="hr">HR</option>
                    <option value="intern">Intern</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Status</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Phone Number</label>
                  <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} placeholder="+91 ..." />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Designation</label>
                  <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.designation} onChange={e => setNewUser({ ...newUser, designation: e.target.value })} placeholder="e.g. Software Engineer" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Gender</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.gender} onChange={e => setNewUser({ ...newUser, gender: e.target.value })}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Joining Date</label>
                  <input type="date" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.joiningDate} onChange={e => setNewUser({ ...newUser, joiningDate: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Location</label>
                  <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.location} onChange={e => setNewUser({ ...newUser, location: e.target.value })} placeholder="e.g. Mumbai, India" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Personal Secret Key</label>
                  <input required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={newUser.secretKey} onChange={e => setNewUser({ ...newUser, secretKey: e.target.value })} placeholder="Required PIN/Key" />
                </div>
              </div>
              <button type="submit" style={{ marginTop: '1rem', padding: '0.875rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Create User Account</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Update Profile: {editingUser.email.split('@')[0]}</h3>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Full Name</label>
                  <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Department</label>
                  <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.department} onChange={e => setEditingUser({ ...editingUser, department: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Role</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="hr">HR</option>
                    <option value="intern">Intern</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Status</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.status} onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Phone</label>
                  <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.phone || ''} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Designation</label>
                  <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.designation || ''} onChange={e => setEditingUser({ ...editingUser, designation: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Gender</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.gender || ''} onChange={e => setEditingUser({ ...editingUser, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Joining Date</label>
                  <input type="date" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.joiningDate ? new Date(editingUser.joiningDate).toISOString().split('T')[0] : ''} onChange={e => setEditingUser({ ...editingUser, joiningDate: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Location</label>
                  <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.location || ''} onChange={e => setEditingUser({ ...editingUser, location: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Secret Key</label>
                  <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.secretKey || ''} onChange={e => setEditingUser({ ...editingUser, secretKey: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Daily Limit</label>
                  <input type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={editingUser.dailyLimit} onChange={e => setEditingUser({ ...editingUser, dailyLimit: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem' }}>Storage (MB)</label>
                  <input type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb' }} value={(editingUser.storageLimit / (1024 * 1024)).toFixed(0)} onChange={e => setEditingUser({ ...editingUser, storageLimit: parseInt(e.target.value) * 1024 * 1024 })} />
                </div>
              </div>
              <button
                onClick={() => handleUpdateUser(editingUser._id, editingUser)}
                style={{ marginTop: '1rem', padding: '0.875rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Body Content Modal */}
      {selectedLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '0', borderRadius: '24px', width: '90%', maxWidth: '800px', maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Email Message Preview</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Subject: {selectedLog.subject}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, background: '#fff', color: '#334155', lineHeight: 1.6 }}>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Recipients:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedLog.recipients.join(', ')}</div>
              </div>
              <div
                style={{ fontSize: '0.95rem' }}
                dangerouslySetInnerHTML={{ __html: selectedLog.body }}
              />
            </div>
            <div style={{ padding: '1rem 2rem', borderTop: '1px solid #f1f5f9', textAlign: 'right', background: '#f8fafc' }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ padding: '0.6rem 1.5rem', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .admin-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-action-btn:hover:not(:disabled) {
          background: #f9fafb;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .admin-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 1.5rem;
          }
          .filters-container {
            flex-direction: column;
            align-items: stretch !important;
          }
          .search-wrapper {
            width: 100% !important;
          }
          .filter-group {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }
          .filter-group select {
            width: 100% !important;
          }
          .modal-content {
            width: 95% !important;
            padding: 1.5rem !important;
          }
        }

        @media (max-width: 480px) {
          .admin-container {
            padding: 1rem !important;
          }
          .tab-nav {
            width: 100%;
            flex-direction: column;
          }
          .tab-nav button {
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}

export default AdminDashboard;

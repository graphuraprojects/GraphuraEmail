import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, CheckCircle2, XCircle, Activity, TrendingUp, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function StatsOverview() {
  const [data, setData] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('week');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const [profileRes, dailyRes] = await Promise.all([
        axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/email-stats/daily?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (profileRes.data && profileRes.data.stats) {
        setData(profileRes.data);
        setError(null);
      }

      setDailyStats(dailyRes.data || []);
    } catch (err) {
      console.error('DASHBOARD FETCH ERROR:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [period]);

  if (loading && !data) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw className="animate-spin" style={{ marginBottom: '1rem' }} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const successCount = data?.stats?.totalSent ?? 0;
  const failedCount = data?.stats?.totalFailed ?? 0;
  const totalCount = data?.stats?.totalTransactions ?? 0;
  const deliveryRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;
  const todaySuccess = data?.stats?.sentToday ?? 0;

  const statsCards = [
    { title: 'Today Success', value: todaySuccess, icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Total Success', value: successCount, icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Total Failed', value: failedCount, icon: XCircle, color: '#ef4444', bg: '#fef2f2' },
    { title: 'Delivery Rate', value: `${deliveryRate}%`, icon: TrendingUp, color: '#f59e0b', bg: '#fffbeb' },
  ];

  const getLocalDateStr = (date) => {
    return date.toLocaleDateString('en-CA');
  };

  let chartData = [];
  if (period === 'day') {
    chartData = [...Array(24)].map((_, i) => {
      const d = new Date();
      d.setHours(d.getHours() - (23 - i), 0, 0, 0);
      const hourStr24 = `${d.getHours().toString().padStart(2, '0')}:00`;
      const hourStr12 = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
      const match = dailyStats.find(s => s._id === hourStr24);
      return {
        label: d.getHours() % 4 === 0 ? hourStr12 : '',
        success: match ? match.success : 0,
        failed: match ? match.failed : 0,
        full: hourStr12
      };
    });
  } else if (period === 'month') {
    chartData = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = getLocalDateStr(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayDate = d.getDate();
      const match = dailyStats.find(s => s._id === dateStr);
      return {
        label: `${dayName.charAt(0)}${dayDate}`,
        success: match ? match.success : 0,
        failed: match ? match.failed : 0,
        full: `${dayName} ${dayDate}`
      };
    });
  } else if (period === 'year') {
    chartData = [...Array(12)].map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const monthStr = getLocalDateStr(d).slice(0, 7);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const match = dailyStats.find(s => s._id === monthStr);
      return {
        label: monthName,
        success: match ? match.success : 0,
        failed: match ? match.failed : 0,
        full: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    });
  } else {
    chartData = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = getLocalDateStr(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayDate = d.getDate();
      const match = dailyStats.find(s => s._id === dateStr);
      return {
        label: `${dayName} ${dayDate}`,
        success: match ? match.success : 0,
        failed: match ? match.failed : 0,
        full: `${dayName} ${dayDate}`
      };
    });
  }

  const maxCount = Math.max(...chartData.map(d => d.success + d.failed), 5);

  return (
    <div>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Sync Status:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {statsCards.map((item, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{item.title}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{item.value}</h3>
              </div>
              <div style={{ background: item.bg, padding: '0.75rem', borderRadius: '0.75rem' }}>
                <item.icon size={24} color={item.color} />
              </div>
            </div>
          </div>
        ))}

        {/* Daily Limit Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Daily Emails</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {data?.stats?.sentToday || 0}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {localStorage.getItem('userRole') === 'admin' ? 'Unlimited' : (data?.user?.dailyLimit || 100)}</span>
              </h3>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.75rem' }}>
              <TrendingUp size={24} color="var(--accent)" />
            </div>
          </div>
          {localStorage.getItem('userRole') !== 'admin' && (
            <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, ((data?.stats?.sentToday || 0) / (data?.user?.dailyLimit || 100)) * 100)}%`,
                background: 'var(--accent)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          )}
        </div>

        {/* Storage Limit Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Account Storage</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {formatBytes(data?.stats?.totalStorageUsed || 0)} 
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {localStorage.getItem('userRole') === 'admin' ? 'Unlimited' : formatBytes(data?.user?.storageLimit || 10485760)}</span>
              </h3>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '0.75rem' }}>
              <Activity size={24} color="var(--primary)" />
            </div>
          </div>
          {localStorage.getItem('userRole') !== 'admin' && (
            <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, ((data?.stats?.totalStorageUsed || 0) / (data?.user?.storageLimit || 10485760)) * 100)}%`,
                background: 'var(--primary)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="var(--primary)" />
              Usage Overview
            </h2>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }}></div>
                <span style={{ color: 'var(--text-muted)' }}>Success</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }}></div>
                <span style={{ color: 'var(--text-muted)' }}>Failed</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', background: 'var(--sidebar-bg)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            {['day', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  width: 'auto', padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '0.375rem',
                  background: period === p ? 'white' : 'transparent',
                  color: period === p ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none', fontWeight: 600, textTransform: 'capitalize'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          height: '200px', display: 'flex', alignItems: 'flex-end',
          gap: period === 'month' ? '4px' : '1rem', padding: '0'
        }}>
          {chartData.map((d, i) => {
            const total = d.success + d.failed;
            const successPct = total > 0 ? (d.success / total) * 100 : 0;
            const failedPct = total > 0 ? (d.failed / total) * 100 : 0;

            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%' }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${(total / maxCount) * 100}%`,
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      borderRadius: '2px 2px 0 0',
                      overflow: 'hidden',
                      opacity: total > 0 ? 1 : 0.05,
                      transition: 'height 0.3s ease-out'
                    }}
                    title={`${d.full}: ${d.success} Success, ${d.failed} Failed`}
                  >
                    <div style={{ height: `${successPct}%`, background: '#10b981', width: '100%' }} />
                    <div style={{ height: `${failedPct}%`, background: '#ef4444', width: '100%' }} />
                  </div>
                </div>
                <div style={{
                  fontSize: period === 'month' ? '0.55rem' : '0.65rem',
                  color: 'var(--text-muted)',
                  height: '12px',
                  whiteSpace: 'nowrap',
                  transform: period === 'month' ? 'scale(0.85)' : 'none',
                  fontWeight: 600
                }}>
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StatsOverview;

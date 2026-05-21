import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, CheckCircle2, XCircle, Activity, TrendingUp, RefreshCw, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function StatsOverview() {
  const [data, setData] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('week');
  const [hoveredBar, setHoveredBar] = useState(null);

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
    { title: 'Today Success', value: todaySuccess, icon: Zap, gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(52,211,153,0.08) 100%)', iconBg: 'rgba(16,185,129,0.15)', iconColor: '#34d399', trend: '+12%', trendUp: true },
    { title: 'Total Delivered', value: successCount, icon: CheckCircle2, gradient: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)', iconBg: 'rgba(99,102,241,0.15)', iconColor: '#818cf8', trend: '+8%', trendUp: true },
    { title: 'Total Failed', value: failedCount, icon: XCircle, gradient: 'linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(251,113,133,0.08) 100%)', iconBg: 'rgba(244,63,94,0.15)', iconColor: '#fb7185', trend: '-3%', trendUp: false },
    { title: 'Delivery Rate', value: `${deliveryRate}%`, icon: TrendingUp, gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(251,191,36,0.08) 100%)', iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24', trend: '+2%', trendUp: true },
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
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {error && (
        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', color: '#fb7185', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <XCircle size={16} />
          <strong>Sync Status:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statsCards.map((item, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.title}</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{item.value}</h3>
              </div>
              <div style={{ background: item.iconBg, padding: '0.7rem', borderRadius: '12px' }}>
                <item.icon size={22} color={item.iconColor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Limit + Storage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Daily Limit Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Daily Emails</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {data?.stats?.sentToday || 0}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}> / {localStorage.getItem('userRole') === 'admin' ? '∞' : (data?.user?.dailyLimit || 100)}</span>
              </h3>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.12)', padding: '0.7rem', borderRadius: '12px' }}>
              <TrendingUp size={22} color="#34d399" />
            </div>
          </div>
          {localStorage.getItem('userRole') !== 'admin' && (
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, ((data?.stats?.sentToday || 0) / (data?.user?.dailyLimit || 100)) * 100)}%`,
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                borderRadius: '6px',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}></div>
            </div>
          )}
        </div>

        {/* Storage Limit Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Account Storage</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {formatBytes(data?.stats?.totalStorageUsed || 0)} 
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}> / {localStorage.getItem('userRole') === 'admin' ? '∞' : formatBytes(data?.user?.storageLimit || 10485760)}</span>
              </h3>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.12)', padding: '0.7rem', borderRadius: '12px' }}>
              <Activity size={22} color="#818cf8" />
            </div>
          </div>
          {localStorage.getItem('userRole') !== 'admin' && (
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, ((data?.stats?.totalStorageUsed || 0) / (data?.user?.storageLimit || 10485760)) * 100)}%`,
                background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                borderRadius: '6px',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              <BarChart3 size={18} color="var(--primary)" />
              Usage Overview
            </h2>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Success</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fb7185' }}></div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Failed</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            {['day', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  width: 'auto', padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '8px',
                  background: period === p ? 'var(--primary)' : 'transparent',
                  color: period === p ? 'white' : 'var(--text-muted)',
                  boxShadow: period === p ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                  border: 'none', fontWeight: 600, textTransform: 'capitalize',
                  transition: 'all 0.2s ease'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          height: '220px', display: 'flex', alignItems: 'flex-end',
          gap: period === 'month' ? '3px' : '0.75rem', padding: '0'
        }}>
          {chartData.map((d, i) => {
            const total = d.success + d.failed;
            const successPct = total > 0 ? (d.success / total) * 100 : 0;
            const failedPct = total > 0 ? (d.failed / total) * 100 : 0;
            const isHovered = hoveredBar === i;

            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%' }}
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {isHovered && total > 0 && (
                  <div style={{
                    position: 'absolute', top: '-2rem', transform: 'translateY(-100%)',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    padding: '0.4rem 0.7rem', borderRadius: '8px', fontSize: '0.7rem',
                    fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap',
                    boxShadow: 'var(--shadow-md)', zIndex: 10
                  }}>
                    {d.full}: {d.success}✓ {d.failed}✗
                  </div>
                )}
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${(total / maxCount) * 100}%`,
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      borderRadius: '4px 4px 0 0',
                      overflow: 'hidden',
                      opacity: total > 0 ? (isHovered ? 1 : 0.8) : 0.08,
                      transition: 'all 0.3s ease-out',
                      cursor: total > 0 ? 'pointer' : 'default',
                      transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                      transformOrigin: 'bottom'
                    }}
                    title={`${d.full}: ${d.success} Success, ${d.failed} Failed`}
                  >
                    <div style={{ height: `${successPct}%`, background: 'linear-gradient(180deg, #34d399, #10b981)', width: '100%' }} />
                    <div style={{ height: `${failedPct}%`, background: 'linear-gradient(180deg, #fb7185, #f43f5e)', width: '100%' }} />
                  </div>
                </div>
                <div style={{
                  fontSize: period === 'month' ? '0.5rem' : '0.6rem',
                  color: isHovered ? 'var(--text-main)' : 'var(--text-muted)',
                  height: '14px',
                  whiteSpace: 'nowrap',
                  transform: period === 'month' ? 'scale(0.85)' : 'none',
                  fontWeight: isHovered ? 700 : 500,
                  transition: 'all 0.2s'
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

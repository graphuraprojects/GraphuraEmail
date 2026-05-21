import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Clock, Smartphone, Inbox, Loader2, RefreshCw, ChevronLeft, ChevronRight, Wifi, WifiOff } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function SmsInbox({ token }) {
  const [smsList, setSmsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSms();
    fetchStats();
    fetchDeviceStatus();
  }, [page]);

  const fetchSms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/sms?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSmsList(res.data.sms || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching SMS inbox');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/sms/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {}
  };

  const fetchDeviceStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/device/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeviceStatus(res.data);
    } catch (err) {}
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) { fetchSms(); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/sms/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSmsList(res.data || []);
      setTotalPages(1);
    } catch (err) {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0.5rem' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Inbox size={22} color="#818cf8" /> SMS Inbox
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Messages received from connected devices.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total</div>
            <div style={statValueStyle}>{stats.total}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Today</div>
            <div style={statValueStyle}>{stats.today}</div>
          </div>
          {deviceStatus && (
            <div style={{ ...statCardStyle, borderColor: deviceStatus.status === 'online' ? 'rgba(16,185,129,0.2)' : 'var(--border)' }}>
              <div style={statLabelStyle}>Device</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {deviceStatus.status === 'online' ? <Wifi size={12} color="#34d399" /> : <WifiOff size={12} color="#fb7185" />}
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: deviceStatus.status === 'online' ? '#34d399' : '#fb7185' }}>
                  {deviceStatus.status === 'online' ? 'Live' : 'Off'}
                </span>
              </div>
            </div>
          )}
          <button onClick={() => { fetchSms(); fetchStats(); fetchDeviceStatus(); }} style={{ width: '36px', height: '36px', padding: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search sender or content..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', fontSize: '0.875rem', transition: 'border-color 0.2s' }}
        />
      </div>

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
          </div>
        ) : smsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
            <Inbox size={48} style={{ marginBottom: '1rem', opacity: 0.15 }} />
            <p style={{ fontWeight: 500 }}>No messages found.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Connect a device to start receiving SMS here.</p>
          </div>
        ) : (
          smsList.map((sms) => (
            <div key={sms._id} style={smsCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={avatarStyle}>{sms.sender?.charAt(0)?.toUpperCase() || '?'}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{sms.sender}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Smartphone size={10} /> {sms.deviceId || 'Unknown'}</span>
                      {sms.sim && <span>• SIM {sms.sim}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <Clock size={11} /> {getTimeAgo(sms.receivedAt)}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', fontSize: '0.875rem', color: '#ffffff', border: '1px solid var(--border)', lineHeight: '1.5' }}>
                {sms.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
            style={pageBtnStyle}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={pageBtnStyle}><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}

const smsCardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' };
const avatarStyle = { width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 };
const statCardStyle = { background: 'var(--bg-card)', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center', minWidth: '60px' };
const statLabelStyle = { fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' };
const statValueStyle = { fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' };
const pageBtnStyle = { width: '36px', height: '36px', padding: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' };

export default SmsInbox;

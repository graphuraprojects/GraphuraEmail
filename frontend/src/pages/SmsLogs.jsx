import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Clock, CheckCircle, XCircle, Phone, History, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function SmsLogs({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/sms-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
      const s = res.data.reduce((acc, l) => {
        acc.total++;
        if (l.status === 'success') acc.success++;
        else acc.failed++;
        return acc;
      }, { total: 0, success: 0, failed: 0 });
      setStats(s);
    } catch (err) {
      console.error('Error fetching SMS logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0.5rem' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={22} color="#818cf8" /> SMS History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Transmission logs for all sent messages.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <div style={statPillStyle}><span style={{ color: 'var(--text-muted)' }}>Total</span> <strong>{stats.total}</strong></div>
          <div style={statPillStyle}><span style={{ color: '#34d399' }}>✓</span> <strong style={{ color: '#34d399' }}>{stats.success}</strong></div>
          <div style={statPillStyle}><span style={{ color: '#fb7185' }}>✗</span> <strong style={{ color: '#fb7185' }}>{stats.failed}</strong></div>
          <button onClick={fetchLogs} style={{ width: '36px', height: '36px', padding: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.15 }} />
            <p style={{ fontWeight: 500 }}>No SMS logs found.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Messages will appear here after you send them.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log._id} style={logCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
                  <div style={statusIconStyle(log.status)}>
                    {log.status === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </div>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.message.length > 80 ? log.message.substring(0, 80) + '...' : log.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, marginTop: '2px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Phone size={10} /> {log.recipients.length} recipient(s)</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {new Date(log.sentAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <div style={badgeStyle(log.status)}>{log.status}</div>
                  {expandedId === log._id ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>
              </div>

              {expandedId === log._id && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', animation: 'fadeIn 0.2s ease-out' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', fontSize: '0.875rem', color: '#ffffff', border: '1px solid var(--border)', lineHeight: '1.6', marginBottom: '1rem' }}>
                    {log.message}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0', width: '100%', marginBottom: '0.15rem' }}>Recipients:</span>
                    {log.recipients.map((phone, i) => (
                      <span key={i} style={phoneTagStyle}><Phone size={10} /> {phone}</span>
                    ))}
                  </div>
                  {log.messageSid && log.messageSid !== 'N/A' && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      SID: <span style={{ fontFamily: 'monospace', color: 'var(--text-soft)' }}>{log.messageSid}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const logCardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' };
const statusIconStyle = (status) => ({ width: '34px', height: '34px', borderRadius: '10px', background: status === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)', color: status === 'success' ? '#34d399' : '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });
const badgeStyle = (status) => ({ padding: '4px 12px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: status === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)', color: status === 'success' ? '#34d399' : '#fb7185' });
const phoneTagStyle = { background: 'rgba(255,255,255,0.04)', color: 'var(--text-soft)', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid var(--border)' };
const statPillStyle = { background: 'var(--bg-card)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' };

export default SmsLogs;

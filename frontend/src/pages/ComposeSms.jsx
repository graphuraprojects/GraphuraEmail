import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, MessageSquare, Loader2, X, Phone, AlertCircle, CheckCircle2, Info, Smartphone } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function ComposeSms({ token, onSent }) {
  const [recipientTags, setRecipientTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    fetchRecentLogs();
  }, []);

  const fetchRecentLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/sms-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentLogs(res.data.slice(0, 5));
    } catch (err) {}
  };

  const addTag = (val) => {
    if (!val.trim()) return;
    const phones = val.split(/[,\s]+/).filter(p => p.trim().length > 0);
    const newTags = [...recipientTags];
    let added = false;
    phones.forEach(phone => {
      const clean = phone.trim().replace(/[^0-9+\-() ]/g, '');
      if (clean.length >= 10 && !newTags.includes(clean)) {
        newTags.push(clean);
        added = true;
      }
    });
    if (added) setRecipientTags(newTags);
    setInputValue('');
  };

  const removeTag = (index) => {
    setRecipientTags(recipientTags.filter((_, i) => i !== index));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (recipientTags.length === 0) {
      setStatus({ type: 'error', message: 'Add at least one phone number.' });
      return;
    }
    if (!message.trim()) {
      setStatus({ type: 'error', message: 'Message cannot be empty.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await axios.post(`${API_URL}/send-sms`, { 
        recipients: recipientTags, 
        message 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setStatus({ type: 'success', message: `${res.data.successCount} SMS dispatched successfully.` });
      setRecipientTags([]);
      setMessage('');
      if (onSent) onSent();
      fetchRecentLogs();
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to send SMS.';
      setStatus({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const smsUnits = Math.ceil(message.length / 160) || 0;
  const charsLeft = message.length > 0 ? (160 - (message.length % 160)) % 160 : 160;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0.5rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={22} color="#818cf8" /> Compose SMS
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Send text messages via your configured gateway.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <div style={miniStatStyle}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipients</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#818cf8' }}>{recipientTags.length}</div>
          </div>
          <div style={miniStatStyle}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SMS Units</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: smsUnits > 1 ? '#fbbf24' : '#34d399' }}>{smsUnits}</div>
          </div>
        </div>
      </header>

      {/* Status Alert */}
      {status.message && (
        <div style={{
          padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '1.25rem',
          fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: status.type === 'error' ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)',
          color: status.type === 'error' ? '#fb7185' : '#34d399',
          border: `1px solid ${status.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)'}`
        }}>
          {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {status.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        {/* Compose Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
          
          <form onSubmit={handleSend}>
            {/* Recipients */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ minWidth: '32px', paddingTop: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>To:</span>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  {recipientTags.map((tag, i) => (
                    <div key={i} style={chipStyle}>
                      <Phone size={10} /> {tag}
                      <X size={12} style={{ cursor: 'pointer', opacity: 0.6, marginLeft: '2px' }} onClick={() => removeTag(i)} />
                    </div>
                  ))}
                  <input
                    type="text" value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                        e.preventDefault();
                        if (inputValue.trim()) addTag(inputValue);
                      }
                      if (e.key === 'Backspace' && !inputValue && recipientTags.length > 0) {
                        removeTag(recipientTags.length - 1);
                      }
                    }}
                    onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
                    placeholder={recipientTags.length === 0 ? "+91 9876543210, +1 5551234..." : "Add more..."}
                    style={{ border: 'none', outline: 'none', flex: 1, minWidth: '150px', fontSize: '0.875rem', fontWeight: 500, background: 'transparent', color: 'var(--text-main)', padding: '4px 0' }}
                  />
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div style={{ padding: '1.5rem' }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                style={{
                  width: '100%', minHeight: '160px',
                  border: 'none', outline: 'none', fontSize: '0.95rem',
                  color: 'var(--text-main)', lineHeight: '1.6',
                  resize: 'none', background: 'transparent', fontFamily: 'inherit'
                }}
              />

              {/* Character counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontWeight: 600, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <span>{message.length} characters</span>
                  <span style={{ color: charsLeft < 20 && message.length > 0 ? '#fbbf24' : 'var(--text-muted)' }}>{charsLeft} chars to next unit</span>
                </div>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>{smsUnits} SMS unit{smsUnits !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Smartphone size={14} />
                <span>Gateway: <strong style={{ color: 'var(--text-soft)' }}>SMSSync</strong></span>
              </div>
              <button type="submit" disabled={loading || recipientTags.length === 0 || !message.trim()} className="sms-send-btn">
                {loading ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
                {loading ? 'Sending...' : 'Send SMS'}
              </button>
            </div>
          </form>
        </div>

        {/* Recent SMS Logs */}
        {recentLogs.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Dispatches</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentLogs.map(log => (
                <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{log.message}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.recipients.length} recipient(s) • {new Date(log.sentAt).toLocaleString()}</div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                    background: log.status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                    color: log.status === 'success' ? '#34d399' : '#fb7185'
                  }}>{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .sms-send-btn {
          background: var(--gradient-primary) !important;
          color: white; padding: 0.65rem 2rem; border-radius: 10px;
          font-weight: 700; border: none; display: flex; align-items: center;
          gap: 8px; cursor: pointer; transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(99,102,241,0.25);
          width: auto; font-size: 0.85rem;
        }
        .sms-send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,0.35); }
        .sms-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
      `}} />
    </div>
  );
}

const chipStyle = { background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid rgba(16,185,129,0.15)', color: '#6ee7b7' };
const miniStatStyle = { background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center', minWidth: '80px' };

export default ComposeSms;

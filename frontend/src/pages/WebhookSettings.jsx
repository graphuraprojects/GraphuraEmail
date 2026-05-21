import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, Trash2, Plus, Shield, CheckCircle2, AlertCircle, Webhook } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function WebhookSettings({ token }) {
  const [webhooks, setWebhooks] = useState([]);
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/webhooks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWebhooks(res.data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/webhooks`, { url, secret }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUrl('');
      setSecret('');
      fetchWebhooks();
    } catch (err) {
      alert('Failed to add webhook');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this webhook?')) return;
    try {
      await axios.delete(`${API_URL}/webhooks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWebhooks();
    } catch (err) {}
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0.5rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={22} color="#818cf8" /> Webhook Integration
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Receive real-time notifications for incoming SMS on your server.</p>
      </header>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>Connection Credentials</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Server URL</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input readOnly value={window.location.origin} style={{ ...inputStyle, background: 'rgba(255,255,255,0.03)' }} />
              <button onClick={() => { navigator.clipboard.writeText(window.location.origin); alert('Copied!'); }} style={smallButtonStyle}>Copy</button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Your API Key (X-API-Key)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input readOnly value="Click to reveal" type="password" style={{ ...inputStyle, background: 'rgba(255,255,255,0.03)' }} onClick={(e) => { e.target.type = 'text'; e.target.value = localStorage.getItem('token') ? 'Using JWT (or see profile for Secret Key)' : ''; }} />
              <button onClick={() => alert('Your Secret Key is used as the API Key. You can find it in your Profile settings.')} style={smallButtonStyle}>Info</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
          <Plus size={17} color="#818cf8" /> Add New Webhook
        </h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={labelStyle}>Destination URL</label>
            <input 
              required 
              type="url" 
              placeholder="https://your-server.com/webhook" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={labelStyle}>Signing Secret (Optional)</label>
            <input 
              type="password" 
              placeholder="Webhook secret" 
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>Register</button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Webhooks</h3>
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : webhooks.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '14px', border: '1px dashed var(--border)', color: 'var(--text-muted)', fontWeight: 500 }}>
            No webhooks configured yet.
          </div>
        ) : (
          webhooks.map(hook => (
            <div key={hook._id} style={hookCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, overflow: 'hidden' }}>
                <div style={{ padding: '10px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', borderRadius: '10px', flexShrink: 0 }}>
                  <Globe size={18} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>{hook.url}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                    <Shield size={10} /> {hook.secret ? 'HMAC-SHA256 Signed' : 'No Signature'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <span style={activeBadgeStyle}>Active</span>
                <button onClick={() => handleDelete(hook._id)} style={deleteButtonStyle}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' };
const inputStyle = { width: '100%', padding: '0.7rem 0.875rem', borderRadius: '10px', border: '1px solid var(--border)', outline: 'none', background: 'rgba(255,255,255,0.04)', color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'inherit' };
const smallButtonStyle = { padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text-soft)', width: 'auto', transition: 'all 0.2s' };
const buttonStyle = { padding: '0.7rem 1.5rem', background: 'var(--gradient-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', width: 'auto', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(99,102,241,0.25)', transition: 'all 0.3s' };
const hookCardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'all 0.2s' };
const activeBadgeStyle = { background: 'rgba(16,185,129,0.12)', color: '#34d399', fontSize: '0.6rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const deleteButtonStyle = { padding: '8px', color: '#fb7185', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.1)', cursor: 'pointer', borderRadius: '8px', width: 'auto', boxShadow: 'none', transition: 'all 0.2s' };

export default WebhookSettings;

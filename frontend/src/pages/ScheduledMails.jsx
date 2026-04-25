import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Trash2, Calendar, Mail, Loader2, AlertCircle } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function ScheduledMails({ token }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScheduled = async () => {
    try {
      const res = await axios.get(`${API_URL}/scheduled-emails`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load scheduled emails.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, [token]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled email?')) return;
    try {
      await axios.delete(`${API_URL}/scheduled-emails/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(emails.filter(e => e._id !== id));
    } catch (err) {
      alert('Failed to cancel email.');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Loader2 className="animate-spin" size={32} color="var(--primary)" />
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Scheduled Transmissions</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Emails waiting in the dispatch queue.</p>
      </header>

      {emails.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
          <Clock size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#4b5563' }}>No scheduled emails</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>When you schedule a message, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {emails.map((mail) => (
            <div key={mail._id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>{mail.subject || '(No Subject)'}</h4>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {mail.recipients.length} Recipient(s)</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 700 }}><Clock size={14} /> {new Date(mail.scheduledAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCancel(mail._id)}
                style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '0.6rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                title="Cancel Schedule"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

export default ScheduledMails;

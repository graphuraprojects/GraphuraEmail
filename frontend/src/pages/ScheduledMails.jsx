import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Clock, Trash2, Calendar, Mail, Loader2, AlertCircle, CheckCircle2, Edit3, X, Users, Save, Send } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const getCountdown = (scheduledAt) => {
  const diff = new Date(scheduledAt).getTime() - Date.now();
  if (diff <= 0) return 'sending soon';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs < 24) return `in ${hrs}h ${remMins}m`;
  const days = Math.floor(hrs / 24);
  return `in ${days}d ${hrs % 24}h`;
};

const getCountdownColor = (scheduledAt) => {
  const diff = new Date(scheduledAt).getTime() - Date.now();
  if (diff <= 0) return '#fbbf24';
  if (diff < 3600000) return '#fbbf24';
  return '#34d399';
};

function ScheduledMails({ token }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMail, setEditingMail] = useState(null);
  const [editForm, setEditForm] = useState({ subject: '', recipients: [], body: '', scheduledAt: '', recipientInput: '' });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  const editorRef = useRef(null);

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

  const openEdit = (mail) => {
    const dt = new Date(mail.scheduledAt);
    // Convert to local datetime-local format
    const localISO = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEditForm({
      subject: mail.subject || '',
      recipients: [...mail.recipients],
      body: mail.body || '',
      scheduledAt: localISO,
      recipientInput: ''
    });
    setEditingMail(mail);
    setSaveStatus({ type: '', message: '' });
    // Set editor content after modal renders
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = mail.body || '';
    }, 50);
  };

  const closeEdit = () => {
    setEditingMail(null);
    setEditForm({ subject: '', recipients: [], body: '', scheduledAt: '', recipientInput: '' });
    setSaveStatus({ type: '', message: '' });
  };

  const addEditRecipient = (val) => {
    if (!val.trim()) return;
    const emails = val.split(/[,\s]+/).filter(e => e.trim().includes('@'));
    const updated = [...editForm.recipients];
    emails.forEach(email => {
      const clean = email.trim();
      if (clean && !updated.includes(clean)) updated.push(clean);
    });
    setEditForm({ ...editForm, recipients: updated, recipientInput: '' });
  };

  const removeEditRecipient = (index) => {
    setEditForm({ ...editForm, recipients: editForm.recipients.filter((_, i) => i !== index) });
  };

  const handleSaveEdit = async () => {
    if (!editForm.subject.trim()) {
      setSaveStatus({ type: 'error', message: 'Subject is required.' });
      return;
    }
    if (editForm.recipients.length === 0) {
      setSaveStatus({ type: 'error', message: 'At least one recipient is required.' });
      return;
    }
    if (!editForm.scheduledAt) {
      setSaveStatus({ type: 'error', message: 'Scheduled time is required.' });
      return;
    }
    const scheduledDate = new Date(editForm.scheduledAt);
    if (scheduledDate <= new Date()) {
      setSaveStatus({ type: 'error', message: 'Scheduled time must be in the future.' });
      return;
    }

    setSaving(true);
    setSaveStatus({ type: '', message: '' });

    try {
      const bodyContent = editorRef.current ? editorRef.current.innerHTML : editForm.body;
      await axios.put(`${API_URL}/scheduled-emails/${editingMail._id}`, {
        subject: editForm.subject,
        recipients: editForm.recipients,
        body: bodyContent,
        scheduledAt: new Date(editForm.scheduledAt).toISOString()
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSaveStatus({ type: 'success', message: 'Email updated successfully!' });
      // Refresh list after a short delay
      setTimeout(() => {
        closeEdit();
        fetchScheduled();
      }, 1200);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update.' });
    } finally {
      setSaving(false);
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={22} color="#818cf8" /> Scheduled Transmissions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Emails waiting in the dispatch queue. Edit them before they send.</p>
      </header>

      {emails.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
          <Clock size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>No scheduled emails</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>When you schedule a message, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {emails.map((mail) => (
            <div key={mail._id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s', position: 'relative', overflow: 'hidden', flexWrap: 'wrap', gap: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                  <Calendar size={22} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{mail.subject || '(No Subject)'}</h4>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={13} /> {mail.recipients.length} Recipient(s)</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8', fontWeight: 700 }}><Clock size={13} /> {new Date(mail.scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</span>
                    <span style={{ fontSize: '0.7rem', color: getCountdownColor(mail.scheduledAt), fontWeight: 600 }}>
                      ({getCountdown(mail.scheduledAt)})
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => openEdit(mail)} style={editBtnStyle} title="Edit">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleCancel(mail._id)} style={cancelBtnStyle} title="Cancel Schedule">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingMail && (
        <div style={overlayStyle} onClick={closeEdit}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={16} color="white" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Edit Scheduled Email</h3>
              </div>
              <button onClick={closeEdit} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, boxShadow: 'none' }}>
                <X size={16} />
              </button>
            </div>

            {/* Status */}
            {saveStatus.message && (
              <div style={{
                margin: '1rem 1.5rem 0', padding: '0.75rem 1rem', borderRadius: '10px',
                fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: saveStatus.type === 'error' ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)',
                color: saveStatus.type === 'error' ? '#fb7185' : '#34d399',
                border: `1px solid ${saveStatus.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)'}`
              }}>
                {saveStatus.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                {saveStatus.message}
              </div>
            )}

            {/* Modal Body */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>
              {/* Subject */}
              <div>
                <label style={labelStyle}>Subject</label>
                <input type="text" value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {/* Recipients */}
              <div>
                <label style={labelStyle}>Recipients</label>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', minHeight: '44px' }}>
                  {editForm.recipients.map((r, i) => (
                    <span key={i} style={chipStyle}>
                      {r}
                      <X size={12} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => removeEditRecipient(i)} />
                    </span>
                  ))}
                  <input type="text" value={editForm.recipientInput}
                    onChange={e => setEditForm({ ...editForm, recipientInput: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                        e.preventDefault();
                        if (editForm.recipientInput.trim()) addEditRecipient(editForm.recipientInput);
                      }
                      if (e.key === 'Backspace' && !editForm.recipientInput && editForm.recipients.length > 0) {
                        removeEditRecipient(editForm.recipients.length - 1);
                      }
                    }}
                    onBlur={() => { if (editForm.recipientInput.trim()) addEditRecipient(editForm.recipientInput); }}
                    placeholder={editForm.recipients.length === 0 ? "Add recipients..." : "Add more..."}
                    style={{ border: 'none', outline: 'none', flex: 1, minWidth: '140px', fontSize: '0.85rem', background: 'transparent', color: 'var(--text-main)', padding: '4px' }}
                  />
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>Separate with comma, space, or Enter</span>
              </div>

              {/* Scheduled Time */}
              <div>
                <label style={labelStyle}>Scheduled Time</label>
                <input type="datetime-local" value={editForm.scheduledAt}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  onChange={e => setEditForm({ ...editForm, scheduledAt: e.target.value })}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {/* Email Body */}
              <div>
                <label style={labelStyle}>Email Body</label>
                <div ref={editorRef} contentEditable
                  onInput={() => {
                    if (editorRef.current) {
                      const c = editorRef.current.innerHTML;
                      setEditForm(prev => ({ ...prev, body: c === '<br>' ? '' : c }));
                    }
                  }}
                  style={{
                    width: '100%', minHeight: '180px', padding: '1rem',
                    borderRadius: '10px', border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.03)', fontSize: '0.9rem',
                    color: '#ffffff', lineHeight: '1.6', outline: 'none',
                    fontFamily: 'inherit', overflow: 'auto'
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={closeEdit} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.6rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer', width: 'auto', boxShadow: 'none' }}>
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving} className="sched-save-btn" style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                border: 'none', borderRadius: '10px', padding: '0.6rem 1.75rem',
                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto',
                boxShadow: '0 4px 15px rgba(99,102,241,0.25)',
                opacity: saving ? 0.6 : 1
              }}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .sched-save-btn { transition: all 0.3s ease !important; }
        .sched-save-btn:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(99,102,241,0.35) !important; }
        [contenteditable]:empty:before { content: 'Write your email body...'; color: rgba(255,255,255,0.15); pointer-events: none; }
      `}} />
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
};

const modalStyle = {
  width: '100%', maxWidth: '640px', background: 'var(--bg-card)',
  borderRadius: '18px', border: '1px solid var(--border)',
  boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden', position: 'relative'
};

const labelStyle = {
  display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem',
  fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.06em'
};

const inputStyle = {
  width: '100%', padding: '0.7rem 1rem', borderRadius: '10px',
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)',
  fontSize: '0.9rem', color: 'var(--text-main)', outline: 'none',
  fontFamily: 'inherit', transition: 'border-color 0.2s'
};

const chipStyle = {
  background: 'rgba(99,102,241,0.1)', padding: '4px 10px', borderRadius: '8px',
  fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center',
  gap: '6px', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc'
};

const editBtnStyle = {
  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
  color: '#818cf8', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer',
  transition: 'all 0.2s', width: 'auto', boxShadow: 'none', display: 'flex',
  alignItems: 'center', justifyContent: 'center'
};

const cancelBtnStyle = {
  background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)',
  color: '#fb7185', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer',
  transition: 'all 0.2s', width: 'auto', boxShadow: 'none', display: 'flex',
  alignItems: 'center', justifyContent: 'center'
};

export default ScheduledMails;

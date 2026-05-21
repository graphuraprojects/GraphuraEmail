import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, Eye, EyeOff, Calendar, Users, FileText, Trash2, RotateCcw, AlertCircle, Send, Mail } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function SentLogs({ token, isTrash = false }) {
  const [logs, setLogs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const fetchLogs = async () => {
    try {
      const endpoint = isTrash ? '/email-logs/trash' : '/email-logs';
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Logs received in frontend:', response.data);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [isTrash]);

  const handleDelete = async (id) => {
    if (!window.confirm('Move this email to trash?')) return;
    try {
      await axios.delete(`${API_URL}/email-logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleRestore = async (id) => {
    try {
      await axios.post(`${API_URL}/email-logs/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs();
    } catch (error) {
      alert('Failed to restore');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
      <div style={{ padding: '1.5rem 1.75rem 1rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isTrash ? <Trash2 size={18} color="#fb7185" /> : <Send size={18} color="#818cf8" />}
          {isTrash ? 'Trash' : 'Sent History'}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
          <Mail size={16} />
          <span>{logs.length} Emails</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.15 }} />
            <p style={{ fontWeight: 500 }}>No emails {isTrash ? 'in trash' : 'sent'} yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.75rem' }}>Subject</th>
                <th>Recipients</th>
                <th>Sent At</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '1.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log._id}>
                  <tr className={expandedId === log._id ? 'table-row-expanded' : ''} style={{ transition: 'background 0.2s' }}>
                    <td style={{ paddingLeft: '1.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{log.subject}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.recipients.join(', ')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>{new Date(log.sentAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${log.status === 'success' ? 'status-success' : 'status-failed'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => toggleExpand(log._id)}
                          style={{ width: 'auto', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '0.35rem 0.7rem', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, borderRadius: '8px', boxShadow: 'none' }}
                        >
                          {expandedId === log._id ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>

                        {!isTrash ? (
                          <button
                            onClick={() => handleDelete(log._id)}
                            style={{ width: 'auto', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)', padding: '0.35rem 0.7rem', fontSize: '0.7rem', color: '#fb7185', borderRadius: '8px', boxShadow: 'none' }}
                            title="Move to Trash"
                          >
                            <Trash2 size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(log._id)}
                            style={{ width: 'auto', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', padding: '0.35rem 0.7rem', fontSize: '0.7rem', color: '#34d399', borderRadius: '8px', boxShadow: 'none' }}
                            title="Restore"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === log._id && (
                    <tr>
                      <td colSpan="5" style={{ padding: '0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{
                          padding: '1.5rem',
                          background: 'rgba(99,102,241,0.03)',
                          borderLeft: '3px solid var(--primary)',
                          margin: '0.75rem 1.5rem',
                          borderRadius: '0 10px 10px 0',
                          animation: 'slideDown 0.2s ease-out'
                        }}>
                          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.25rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Calendar size={13} color="var(--text-muted)" />
                              <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{new Date(log.sentAt).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Users size={13} color="var(--text-muted)" />
                              <span style={{ color: 'var(--text-muted)' }}>Recipients:</span>
                              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{log.recipients.length}</span>
                            </div>
                            {log.status === 'failed' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fb7185' }}>
                                <AlertCircle size={13} />
                                <span style={{ fontWeight: 600 }}>Reason:</span> {log.errorReason || 'Server Error'}
                              </div>
                            )}
                          </div>
                          <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>Email Content:</div>
                          <div
                            style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)', color: '#ffffff', lineHeight: '1.6', fontSize: '0.85rem' }}
                            dangerouslySetInnerHTML={{ __html: log.body || '<i style="color:var(--text-muted)">Content not available for this log.</i>' }}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SentLogs;

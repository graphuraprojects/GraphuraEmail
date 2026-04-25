import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, Eye, EyeOff, Calendar, Users, FileText, Trash2, RotateCcw, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

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
    <div className="card" style={{ padding: '0' }}>
      <div style={{ padding: '2rem 2rem 1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Sent History</h2>
        <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <List size={18} />
          <span>Total {logs.length} Transactions</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>No emails sent yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: '2rem' }}>Subject</th>
                <th>Recipients</th>
                <th>Sent At</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log._id}>
                  <tr className={expandedId === log._id ? 'table-row-expanded' : ''}>
                    <td style={{ paddingLeft: '2rem', fontWeight: 600 }}>{log.subject}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.recipients.join(', ')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{new Date(log.sentAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${log.status === 'success' ? 'status-success' : 'status-failed'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => toggleExpand(log._id)}
                          style={{ width: 'auto', background: 'none', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                        >
                          {expandedId === log._id ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>

                        {!isTrash ? (
                          <button
                            onClick={() => handleDelete(log._id)}
                            style={{ width: 'auto', background: 'none', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--error)' }}
                            title="Move to Trash"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(log._id)}
                            style={{ width: 'auto', background: 'none', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--accent)' }}
                            title="Restore"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === log._id && (
                    <tr>
                      <td colSpan="5" style={{ padding: '0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{
                          padding: '2rem',
                          background: '#fff',
                          borderLeft: '4px solid var(--primary)',
                          margin: '1rem 2rem',
                          borderRadius: '0.5rem',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                          animation: 'slideDown 0.2s ease-out'
                        }}>
                          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar size={14} color="var(--text-muted)" />
                              <span style={{ color: 'var(--text-muted)' }}>Date:</span> {new Date(log.sentAt).toLocaleString()}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Users size={14} color="var(--text-muted)" />
                              <span style={{ color: 'var(--text-muted)' }}>Recipients:</span> {log.recipients.length}
                            </div>
                            {log.status === 'failed' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)' }}>
                                <AlertCircle size={14} />
                                <span style={{ fontWeight: 600 }}>Reason:</span> {log.errorReason || 'Server Error'}
                              </div>
                            )}
                          </div>
                          <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>Email Content:</div>
                          <div
                            style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#334155', lineHeight: '1.6' }}
                            dangerouslySetInnerHTML={{ __html: log.body || '<i style="color:#94a3b8">Content not available for this log.</i>' }}
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

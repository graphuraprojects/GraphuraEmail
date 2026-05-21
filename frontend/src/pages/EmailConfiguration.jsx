import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, Zap, Globe, Save, Loader2, UserCircle, 
  Settings, CheckCircle2, AlertCircle, ChevronRight,
  Database, Server, HardDrive, History, Power, AlertTriangle,
  RefreshCw, Play, Pause
} from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin`;

function EmailConfiguration({ token }) {
  const [settings, setSettings] = useState({
    MAIL_GATEWAY: 'zeptomail',
    ZEPTOMAIL_API_KEY: '',
    ZEPTOMAIL_SENDER_EMAIL: '',
    ZEPTOMAIL_SENDER_NAME: '',
    ZEPTOMAIL_URL: 'https://api.zeptomail.in/',
    AWS_ACCESS_KEY: '',
    AWS_SECRET_KEY: '',
    AWS_REGION: 'us-east-1',
    AWS_SENDER_EMAIL: '',
    SYSTEM_EMAIL_STATUS: 'active',
    SMS_GATEWAY: 'twilio',
    TWILIO_ACCOUNT_SID: '',
    TWILIO_AUTH_TOKEN: '',
    TWILIO_FROM_NUMBER: '',
    SMSSYNC_SECRET: ''
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('[CONFIG] Fetching settings from:', `${API_URL}/settings`);
      const [settingsRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/settings`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/settings/history`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      console.log('[CONFIG] Data received:', { settings: Object.keys(settingsRes.data), historyCount: historyRes.data.length });
      setSettings(prev => ({ ...prev, ...settingsRes.data }));
      setHistory(historyRes.data);
    } catch (err) {
      console.error('[CONFIG] Fetch error:', err);
      setStatus({ type: 'error', message: 'Initialization failed. Verify server connection.' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (customSettings = null) => {
    if (!token) {
      setStatus({ type: 'error', message: 'Authentication required. Please re-login.' });
      return;
    }
    const targetSettings = customSettings || settings;
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      await axios.post(`${API_URL}/settings`, targetSettings, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setStatus({ type: 'success', message: 'Configuration synchronized successfully.' });
      fetchData(); // Refresh history and settings
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to synchronize configuration.';
      setStatus({ type: 'error', message: `Sync Failed: ${errorMsg}` });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickRestore = (log) => {
    const newSettings = { ...settings };
    if (log.type === 'gateway') {
      newSettings.MAIL_GATEWAY = log.to;
    } else {
      newSettings.SYSTEM_EMAIL_STATUS = log.to;
    }
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 className="animate-spin" size={32} color="#0f172a" />
      </div>
    );
  }

  return (
    <div className="config-container animate-fade-in">
      <div className="config-content">
        {/* Minimal Header */}
        <header className="config-header">
          <div>
            <h1>System Configuration</h1>
            <p>Configure global email infrastructure and delivery rules.</p>
          </div>
          <button 
            className={`save-btn ${saving ? 'loading' : ''}`} 
            onClick={() => saveSettings()}
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{saving ? 'Saving Changes' : 'Save Changes'}</span>
          </button>
        </header>

        {status.message && (
          <div className={`status-banner ${status.type}`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {status.message}
          </div>
        )}

        <div className="settings-grid">
          {/* Master Kill Switch Section */}
          <section className={`settings-section status-control ${settings.SYSTEM_EMAIL_STATUS}`}>
            <div className="section-info">
              <div className="icon-wrapper"><Power size={20} /></div>
              <div>
                <h2>Email Engine Status</h2>
                <p>{settings.SYSTEM_EMAIL_STATUS === 'active' ? 'System is accepting and sending emails.' : 'System is currently PAUSED. All sending is disabled.'}</p>
              </div>
            </div>
            <div className="toggle-group">
              <button 
                className={`toggle-btn ${settings.SYSTEM_EMAIL_STATUS === 'active' ? 'active' : ''}`}
                onClick={() => {
                  const newSettings = {...settings, SYSTEM_EMAIL_STATUS: 'active'};
                  setSettings(newSettings);
                  saveSettings(newSettings);
                }}
              >
                <Play size={14} /> ACTIVE
              </button>
              <button 
                className={`toggle-btn ${settings.SYSTEM_EMAIL_STATUS === 'inactive' ? 'inactive' : ''}`}
                onClick={() => {
                  const newSettings = {...settings, SYSTEM_EMAIL_STATUS: 'inactive'};
                  setSettings(newSettings);
                  saveSettings(newSettings);
                }}
              >
                <Pause size={14} /> INACTIVE
              </button>
            </div>
          </section>

          {/* Main Controls Section */}
          <section className="settings-section main-control">
            <div className="section-info">
              <div className="icon-wrapper"><Zap size={20} /></div>
              <div>
                <h2>Master Gateway</h2>
                <p>Select your primary email delivery engine.</p>
              </div>
            </div>
            <div className="gateway-badge-wrapper">
              <div className="status-pulse" style={{ background: settings.SYSTEM_EMAIL_STATUS === 'active' ? '#10b981' : '#ef4444' }}></div>
              <span className="active-label">LIVE GATEWAY:</span>
              <div className={`active-badge ${settings.MAIL_GATEWAY}`}>
                {settings.MAIL_GATEWAY === 'zeptomail' ? <Globe size={14} /> : <Shield size={14} />}
                {settings.MAIL_GATEWAY === 'zeptomail' ? 'Zoho ZeptoMail' : 'Amazon SES'}
              </div>
            </div>
            <div className="control-input">
              <select 
                value={settings.MAIL_GATEWAY}
                onChange={(e) => {
                  const newSettings = { ...settings, MAIL_GATEWAY: e.target.value };
                  setSettings(newSettings);
                  saveSettings(newSettings);
                }}
              >
                <option value="zeptomail">Zoho ZeptoMail</option>
                <option value="aws">Amazon SES</option>
              </select>
              <ChevronRight size={16} className="select-arrow" />
            </div>
          </section>

          {/* Conditional Provider Config */}
          <div className="provider-card">
            {settings.MAIL_GATEWAY === 'zeptomail' ? (
              <section className="settings-section">
                <div className="section-title">
                  <Globe size={18} />
                  <h3>ZeptoMail Credentials</h3>
                </div>
                <div className="form-stack">
                  <div className="input-group">
                    <label>API Key (Send Token)</label>
                    <input 
                      type="password" 
                      value={settings.ZEPTOMAIL_API_KEY} 
                      onChange={(e) => setSettings({ ...settings, ZEPTOMAIL_API_KEY: e.target.value })} 
                      placeholder="Zoho-enczapikey..." 
                    />
                  </div>
                  <div className="input-group">
                    <label>Verified Sender Email</label>
                    <input 
                      type="email" 
                      value={settings.ZEPTOMAIL_SENDER_EMAIL} 
                      onChange={(e) => setSettings({ ...settings, ZEPTOMAIL_SENDER_EMAIL: e.target.value })} 
                      placeholder="noreply@domain.online" 
                    />
                  </div>
                </div>
              </section>
            ) : (
              <section className="settings-section">
                <div className="section-title">
                  <Shield size={18} />
                  <h3>Amazon SES Credentials</h3>
                </div>
                <div className="form-stack">
                  <div className="input-group">
                    <label>AWS Access Key ID</label>
                    <input 
                      type="text" 
                      value={settings.AWS_ACCESS_KEY} 
                      onChange={(e) => setSettings({ ...settings, AWS_ACCESS_KEY: e.target.value })} 
                      placeholder="AKIA..." 
                    />
                  </div>
                  <div className="input-group">
                    <label>AWS Secret Access Key</label>
                    <input 
                      type="password" 
                      value={settings.AWS_SECRET_KEY} 
                      onChange={(e) => setSettings({ ...settings, AWS_SECRET_KEY: e.target.value })} 
                      placeholder="Enter secret key" 
                    />
                  </div>
                  <div className="row-group">
                    <div className="input-group">
                      <label>Region</label>
                      <input 
                        type="text" 
                        value={settings.AWS_REGION} 
                        onChange={(e) => setSettings({ ...settings, AWS_REGION: e.target.value })} 
                        placeholder="us-east-1" 
                      />
                    </div>
                    <div className="input-group">
                      <label>Verified Identity</label>
                      <input 
                        type="email" 
                        value={settings.AWS_SENDER_EMAIL} 
                        onChange={(e) => setSettings({ ...settings, AWS_SENDER_EMAIL: e.target.value })} 
                        placeholder="verified@aws.com" 
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* SMS Provider Config */}
          <div className="provider-card">
            <section className="settings-section">
              <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Shield size={18} />
                  <h3>SMS Gateway Configuration</h3>
                </div>
                <select 
                  value={settings.SMS_GATEWAY || 'twilio'}
                  onChange={(e) => {
                    const newSettings = { ...settings, SMS_GATEWAY: e.target.value };
                    setSettings(newSettings);
                    saveSettings(newSettings);
                  }}
                  style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  <option value="twilio">Twilio API</option>
                  <option value="smssync">SMSsync (Android App)</option>
                </select>
              </div>

              {settings.SMS_GATEWAY === 'smssync' ? (
                <div className="form-stack" style={{ marginTop: '1.5rem' }}>
                  <div className="input-group">
                    <label>SMSsync Sync URL</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        readOnly 
                        value={`${import.meta.env.VITE_API_URL}/api/smssync`} 
                        style={{ background: '#f8fafc', cursor: 'default' }}
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/api/smssync`);
                          alert('URL Copied!');
                        }}
                        style={{ padding: '0 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Copy
                      </button>
                    </div>
                    <p className="helper-text">Enter this URL in the SMSsync Android app settings.</p>
                  </div>
                  <div className="input-group">
                    <label>SMSsync Secret Key</label>
                    <input 
                      type="password" 
                      value={settings.SMSSYNC_SECRET} 
                      onChange={(e) => setSettings({ ...settings, SMSSYNC_SECRET: e.target.value })} 
                      placeholder="Enter secret key" 
                    />
                    <p className="helper-text">Must match the "Secret Key" in your Android app.</p>
                  </div>
                </div>
              ) : (
                <div className="form-stack" style={{ marginTop: '1.5rem' }}>
                  <div className="input-group">
                    <label>Account SID</label>
                    <input 
                      type="text" 
                      value={settings.TWILIO_ACCOUNT_SID} 
                      onChange={(e) => setSettings({ ...settings, TWILIO_ACCOUNT_SID: e.target.value })} 
                      placeholder="AC..." 
                    />
                  </div>
                  <div className="input-group">
                    <label>Auth Token</label>
                    <input 
                      type="password" 
                      value={settings.TWILIO_AUTH_TOKEN} 
                      onChange={(e) => setSettings({ ...settings, TWILIO_AUTH_TOKEN: e.target.value })} 
                      placeholder="Enter token" 
                    />
                  </div>
                  <div className="input-group">
                    <label>Twilio From Number</label>
                    <input 
                      type="text" 
                      value={settings.TWILIO_FROM_NUMBER} 
                      onChange={(e) => setSettings({ ...settings, TWILIO_FROM_NUMBER: e.target.value })} 
                      placeholder="+1234567890" 
                    />
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Branding & Global Metadata */}
          <section className="settings-section">
            <div className="section-title">
              <UserCircle size={18} />
              <h3>Identity Branding</h3>
            </div>
            <div className="form-stack">
              <div className="input-group">
                <label>Universal Display Name</label>
                <input 
                  type="text" 
                  value={settings.ZEPTOMAIL_SENDER_NAME} 
                  onChange={(e) => setSettings({ ...settings, ZEPTOMAIL_SENDER_NAME: e.target.value })} 
                  placeholder="e.g. Graphura India" 
                />
                <p className="helper-text">This name will appear as the "From" name for all recipients.</p>
              </div>
            </div>
          </section>

          {/* History Section */}
          <section className="settings-section history-section">
            <div className="section-title" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <History size={18} />
                <h3>Infrastructure Audit Log</h3>
              </div>
              <button onClick={fetchData} className="refresh-btn"><RefreshCw size={14} /></button>
            </div>
            <div className="history-table-wrapper">
              {history.length === 0 ? (
                <div className="empty-history">
                  <div className="empty-icon-circle">
                    <History size={32} />
                  </div>
                  <h4>No Governance Logs</h4>
                  <p>System transitions and infrastructure changes will appear here as they occur.</p>
                </div>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Action</th>
                      <th>Authorized By</th>
                      <th>Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((log, i) => (
                      <tr key={i}>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>
                          <span className={`type-tag ${log.type}`}>
                            {log.type === 'gateway' ? <Zap size={10} /> : <Power size={10} />}
                            {log.type.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`hist-badge ${log.from}`}>{log.from}</span>
                            <ChevronRight size={12} color="#94a3b8" />
                            <span className={`hist-badge ${log.to}`}>{log.to}</span>
                          </div>
                        </td>
                        <td>{log.changedBy}</td>
                        <td>
                          <button 
                            className="activate-row-btn"
                            disabled={saving || (log.type === 'gateway' ? settings.MAIL_GATEWAY === log.to : settings.SYSTEM_EMAIL_STATUS === log.to)}
                            onClick={() => handleQuickRestore(log)}
                          >
                            { (log.type === 'gateway' ? settings.MAIL_GATEWAY === log.to : settings.SYSTEM_EMAIL_STATUS === log.to) ? 'ACTIVE' : 'ACTIVATE' }
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>

        {/* Footer Info */}
        <footer className="config-footer">
          <div className="status-pill database">
            <div className="pill-icon"><Database size={12} /></div>
            <div className="pill-content">
              <span className="pill-label">DATABASE</span>
              <span className="pill-value">MongoDB Cluster</span>
            </div>
          </div>
          <div className="status-pill runtime">
            <div className="pill-icon"><Server size={12} /></div>
            <div className="pill-content">
              <span className="pill-label">RUNTIME</span>
              <span className="pill-value">Node.js 20.x</span>
            </div>
          </div>
          <div className="status-pill platform">
            <div className="pill-icon"><HardDrive size={12} /></div>
            <div className="pill-content">
              <span className="pill-label">STATUS</span>
              <span className={`pill-value ${settings.SYSTEM_EMAIL_STATUS === 'active' ? 'online' : 'paused'}`}>
                {settings.SYSTEM_EMAIL_STATUS === 'active' ? 'Operational' : 'Suspended'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .config-container { padding: 2.5rem; min-height: 100vh; background: #fcfcfd; font-family: 'Inter', sans-serif; }
        .config-content { max-width: 900px; margin: 0 auto; }
        .config-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #f1f1f4; }
        .config-header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
        .config-header p { margin: 0.25rem 0 0 0; color: #64748b; font-size: 0.9375rem; }
        
        .save-btn { 
          display: flex; 
          align-items: center; 
          gap: 0.625rem; 
          padding: 0.875rem 2rem; 
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          color: #fff; 
          border-radius: 12px; 
          border: 1px solid #0f172a;
          font-weight: 700; 
          font-size: 0.875rem; 
          cursor: pointer; 
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1);
        }
        .save-btn:hover { 
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.2), 0 4px 6px -4px rgba(15, 23, 42, 0.2);
          background: linear-gradient(180deg, #334155 0%, #0f172a 100%);
        }
        .save-btn:active { transform: translateY(0); }
        .save-btn:disabled { opacity: 0.6; transform: none; box-shadow: none; }

        .status-banner { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; border-radius: 10px; margin-bottom: 2rem; font-size: 0.875rem; font-weight: 500; }
        .status-banner.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .status-banner.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

        .settings-grid { display: flex; flex-direction: column; gap: 2.5rem; }
        .settings-section {
          background: #fff;
          border: 1px solid #f1f1f4;
          border-radius: 12px;
          padding: 1.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .status-control { display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; }
        .status-control.active { border-left: 4px solid #10b981; }
        .status-control.inactive { border-left: 4px solid #ef4444; }

        .toggle-group { 
          display: flex; 
          background: #f1f5f9; 
          padding: 0.35rem; 
          border-radius: 14px; 
          gap: 0.35rem;
          border: 1px solid #e2e8f0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .toggle-btn { 
          display: flex; 
          align-items: center; 
          gap: 0.625rem; 
          padding: 0.65rem 1.5rem; 
          border-radius: 10px; 
          border: none; 
          font-size: 0.8125rem; 
          font-weight: 800; 
          cursor: pointer; 
          color: #64748b; 
          background: transparent; 
          white-space: nowrap; 
          transition: all 0.2s;
        }
        .toggle-btn.active { 
          background: #fff; 
          color: #059669; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
        }
        .toggle-btn.inactive { 
          background: #fff; 
          color: #dc2626; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
        }

        .main-control { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .section-info { display: flex; gap: 1.25rem; align-items: center; }
        .icon-wrapper { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 10px; border: 1px solid #e2e8f0; color: #0f172a; }
        .section-info h2 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
        
        .gateway-badge-wrapper { display: flex; align-items: center; gap: 0.75rem; background: #fff; padding: 0.5rem 1rem; border-radius: 12px; border: 1px solid #e2e8f0; }
        .active-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; }
        .active-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; }
        .active-badge.zeptomail { background: #eff6ff; color: #2563eb; }
        .active-badge.aws { background: #fffbeb; color: #d97706; }

        .type-tag { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.6rem; font-weight: 800; border: 1px solid #e2e8f0; }
        .type-tag.gateway { color: #4f46e5; background: #f5f3ff; }
        .type-tag.status { color: #db2777; background: #fdf2f8; }

        .history-table-wrapper { margin-top: 1rem; }
        .history-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
        .history-table th { text-align: left; padding: 0.75rem; color: #64748b; border-bottom: 2px solid #f1f5f9; }
        .history-table td { padding: 1rem 0.75rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        
        .hist-badge { padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }
        .hist-badge.zeptomail { background: #eff6ff; color: #2563eb; }
        .hist-badge.aws { background: #fffbeb; color: #d97706; }
        .hist-badge.active { background: #f0fdf4; color: #10b981; }
        .hist-badge.inactive { background: #fef2f2; color: #ef4444; }

        .activate-row-btn { 
          padding: 0.5rem 1.25rem; 
          border-radius: 10px; 
          border: 1.5px solid #e2e8f0; 
          background: #fff; 
          font-size: 0.75rem; 
          font-weight: 800; 
          cursor: pointer; 
          white-space: nowrap;
          color: #64748b;
          transition: all 0.2s;
        }
        .activate-row-btn:hover:not(:disabled) { 
          background: #0f172a; 
          color: #fff; 
          border-color: #0f172a; 
          transform: scale(1.05);
        }
        .activate-row-btn:disabled { 
          background: #f0fdf4; 
          color: #10b981; 
          border-color: #bbf7d0; 
          cursor: default; 
          opacity: 1;
        }

        .refresh-btn { 
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff; 
          border: 1px solid #e2e8f0; 
          border-radius: 8px;
          color: #94a3b8; 
          cursor: pointer; 
          transition: all 0.2s; 
        }
        .refresh-btn:hover { color: #0f172a; border-color: #0f172a; background: #f8fafc; }

        .status-pulse { width: 10px; height: 10px; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

        .empty-history { 
          text-align: center; 
          padding: 4rem 2rem; 
          color: #94a3b8; 
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .empty-icon-circle {
          width: 64px;
          height: 64px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          margin-bottom: 0.5rem;
        }
        .empty-history h4 { margin: 0; color: #475569; font-size: 1.125rem; font-weight: 700; }
        .empty-history p { margin: 0; font-size: 0.875rem; max-width: 280px; line-height: 1.5; }

        .config-footer { 
          margin-top: 5rem; 
          padding: 2.5rem 0; 
          border-top: 1px solid #f1f1f4; 
          display: flex; 
          gap: 1.5rem; 
          justify-content: center; 
          flex-wrap: wrap; 
        }
        .status-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 1rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          min-width: 160px;
        }
        .pill-icon {
          width: 28px;
          height: 28px;
          background: #f8fafc;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          border: 1px solid #f1f5f9;
        }
        .pill-content { display: flex; flex-direction: column; }
        .pill-label { font-size: 0.6rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em; }
        .pill-value { font-size: 0.75rem; font-weight: 700; color: #334155; }
        .pill-value.online { color: #10b981; }
        .pill-value.paused { color: #ef4444; }

        @media (max-width: 768px) {
          .config-container { padding: 1.5rem 1rem; }
          .config-header { flex-direction: column; align-items: stretch; gap: 1.5rem; text-align: center; }
          .save-btn { justify-content: center; width: 100%; }
          .row-group { grid-template-columns: 1fr; }
          .main-control, .status-control { flex-direction: column; align-items: stretch; gap: 1.5rem; }
          .gateway-badge-wrapper { justify-content: center; }
          .control-input { min-width: 100%; }
          .toggle-group { width: 100%; }
          .toggle-btn { flex: 1; justify-content: center; }
          .section-info { flex-direction: column; text-align: center; }
          .icon-wrapper { margin: 0 auto; }
          .history-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid #f1f5f9; border-radius: 12px; }
          .history-table { min-width: 650px; }
        }
      `}} />
    </div>
  );
}

export default EmailConfiguration;

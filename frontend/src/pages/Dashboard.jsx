import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Send, AlertCircle, CheckCircle2, Loader2, X, Type,
  Bold, Italic, Underline, Link as LinkIcon, List, AlignLeft, AlignCenter,
  Trash2, Plus, Minus, Layout, Save, Trash, Clock, Calendar
} from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const FONTS = [
  { name: 'Arial (Standard)', family: 'Arial, Helvetica, sans-serif' },
  { name: 'Sans', family: 'Inter, system-ui, sans-serif' },
  { name: 'Serif', family: 'Georgia, serif' },
  { name: 'Mono', family: '"Courier New", monospace' },
  { name: 'Modern', family: 'Roboto, sans-serif' }
];

const PRESET_TEMPLATES = [
  {
    name: 'Professional Intro',
    subject: 'Introduction: [Your Name] | Exploring Synergies',
    body: `Hi [Recipient Name],<br><br>I hope this email finds you well.<br><br>I am writing to formally introduce myself and explore potential collaboration opportunities between our organizations.<br><br>Best regards,<br>[Your Name]`
  },
  {
    name: 'Meeting Follow-up',
    subject: 'Follow-up: Our meeting on [Date]',
    body: `Hi [Recipient Name],<br><br>Thank you for taking the time to speak with me today. It was great learning more about your goals.<br><br>Best,<br>[Your Name]`
  }
];

function ComposeMail({ token, onSent }) {
  const [recipientTags, setRecipientTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONTS[0].family);
  const [fontSize, setFontSize] = useState(11);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showTemplates, setShowTemplates] = useState(false);
  const [customTemplates, setCustomTemplates] = useState([]);

  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  const editorRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('graphura_custom_templates');
    if (saved) setCustomTemplates(JSON.parse(saved));
  }, []);

  const saveAsTemplate = () => {
    if (!subject || !body) {
      setStatus({ type: 'error', message: 'Subject and body are required.' });
      return;
    }
    const name = prompt('Enter template name:');
    if (!name) return;
    const updated = [...customTemplates, { name, subject, body }];
    setCustomTemplates(updated);
    localStorage.setItem('graphura_custom_templates', JSON.stringify(updated));
    setStatus({ type: 'success', message: `Template saved.` });
  };

  const deleteCustomTemplate = (e, index) => {
    e.stopPropagation();
    const updated = customTemplates.filter((_, i) => i !== index);
    setCustomTemplates(updated);
    localStorage.setItem('graphura_custom_templates', JSON.stringify(updated));
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    updateBody();
    if (editorRef.current) editorRef.current.focus();
  };

  const updateBody = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setBody(content === '<br>' || content === '<div><br></div>' ? '' : content);
    }
  };

  const applyTemplate = (temp) => {
    setSubject(temp.subject);
    setBody(temp.body);
    if (editorRef.current) editorRef.current.innerHTML = temp.body;
    setShowTemplates(false);
  };

  const handleSizeChange = (newSize) => {
    const s = Math.max(8, Math.min(72, parseInt(newSize) || 11));
    setFontSize(s);
    document.execCommand('fontSize', false, '7');
    const fontEls = editorRef.current?.getElementsByTagName('font') || [];
    for (let i = 0; i < fontEls.length; i++) {
      if (fontEls[i].getAttribute('size') === '7') {
        fontEls[i].removeAttribute('size');
        fontEls[i].style.fontSize = s + 'px';
      }
    }
    updateBody();
  };

  const addTag = (val) => {
    if (!val.trim()) return;
    const emails = val.split(/[,\s]+/).filter(e => e.trim().includes('@'));
    const newTags = [...recipientTags];
    let added = false;
    emails.forEach(email => {
      const clean = email.trim();
      if (clean && !newTags.includes(clean)) {
        newTags.push(clean);
        added = true;
      }
    });

    if (added) {
      setRecipientTags(newTags);
    }
    setInputValue('');
  };

  const removeTag = (index) => {
    setRecipientTags(recipientTags.filter((_, i) => i !== index));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (recipientTags.length === 0 || !subject || !body) {
      setStatus({ type: 'error', message: 'At least one recipient, subject, and body are required.' });
      return;
    }
    if (isScheduled && !scheduledTime) {
      setStatus({ type: 'error', message: 'Please select a date and time.' });
      return;
    }
    if (isScheduled) {
      const scheduledDate = new Date(scheduledTime);
      if (scheduledDate <= new Date()) {
        setStatus({ type: 'error', message: 'Scheduled time must be in the future.' });
        return;
      }
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    const styledBody = `<div style="font-family: ${selectedFont}; font-size: ${fontSize}px; line-height: 1.6; color: #1e293b;">${body}</div>`;
    const payload = { 
      recipients: recipientTags, 
      subject, 
      body: styledBody 
    };
    const endpoint = isScheduled ? '/schedule-email' : '/send-emails';
    // Convert local datetime-local value to proper ISO 8601 with timezone offset
    // This ensures the backend stores the exact intended time regardless of server timezone
    if (isScheduled) payload.scheduledAt = new Date(scheduledTime).toISOString();

    try {
      await axios.post(`${API_URL}${endpoint}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setStatus({ type: 'success', message: isScheduled ? 'Email scheduled.' : 'Email sent.' });
      setRecipientTags([]); setSubject(''); setBody('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setIsScheduled(false); setScheduledTime('');

      // Trigger global stats update
      if (onSent) onSent();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Error processing request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0.5rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>Compose</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Precision dispatch terminal.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setShowTemplates(!showTemplates)} className="header-btn">
            <Layout size={16} color="#818cf8" /> Templates
          </button>
          {showTemplates && (
            <div className="template-dropdown">
              <div style={templateHeaderStyle}>Presets</div>
              {PRESET_TEMPLATES.map((temp, i) => <div key={i} onClick={() => applyTemplate(temp)} style={templateItemStyle} className="template-item">{temp.name}</div>)}
              {customTemplates.length > 0 && (
                <>
                  <div style={templateHeaderStyle}>Custom</div>
                  {customTemplates.map((temp, i) => (
                    <div key={i} onClick={() => applyTemplate(temp)} style={{ ...templateItemStyle, display: 'flex', justifyContent: 'space-between' }} className="template-item">
                      {temp.name} <Trash size={12} color="#fb7185" onClick={(e) => deleteCustomTemplate(e, i)} />
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}></div>
        <form onSubmit={handleSend}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={inputLabelStyle}>To:</span>
              <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                {recipientTags.map((tag, i) => (
                  <div key={i} style={chipStyle}>{tag} <X size={12} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => removeTag(i)} /></div>
                ))}
                <input
                  type="text" value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                      e.preventDefault();
                      if (inputValue.trim()) addTag(inputValue);
                    }
                  }}
                  onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
                  placeholder={recipientTags.length === 0 ? "Add recipients..." : ""}
                  style={headerInputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={inputLabelStyle}>Subject:</span>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={headerInputStyle} />
            </div>
          </div>

          <div style={toolbarContainerStyle}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button type="button" onClick={() => execCommand('bold')} className="tool-btn"><Bold size={15} /></button>
              <button type="button" onClick={() => execCommand('italic')} className="tool-btn"><Italic size={15} /></button>
              <button type="button" onClick={() => execCommand('underline')} className="tool-btn"><Underline size={15} /></button>
              <div style={dividerStyle} />
              <button type="button" onClick={() => { const u = prompt('URL:'); if (u) execCommand('createLink', u); }} className="tool-btn"><LinkIcon size={15} /></button>
              <button type="button" onClick={() => execCommand('insertUnorderedList')} className="tool-btn"><List size={15} /></button>
              <div style={dividerStyle} />
              <button type="button" onClick={() => execCommand('justifyLeft')} className="tool-btn"><AlignLeft size={15} /></button>
              <button type="button" onClick={() => execCommand('justifyCenter')} className="tool-btn"><AlignCenter size={15} /></button>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} style={selectStyle}>
                {FONTS.map((f, i) => <option key={i} value={f.family}>{f.name}</option>)}
              </select>
              <div style={sizeContainerStyle}>
                <button type="button" onClick={() => handleSizeChange(fontSize - 1)} className="size-btn"><Minus size={12} /></button>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => handleSizeChange(e.target.value)}
                  style={{
                    width: '40px',
                    border: 'none',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    color: 'var(--text-main)',
                    outline: 'none',
                    background: 'transparent',
                    padding: '0',
                    margin: '0',
                    lineHeight: '1'
                  }}
                />
                <button type="button" onClick={() => handleSizeChange(fontSize + 1)} className="size-btn"><Plus size={12} /></button>
              </div>
            </div>
          </div>

          <div ref={editorRef} contentEditable onInput={updateBody} placeholder="Draft message..." style={{ padding: '2rem', minHeight: '350px', outline: 'none', fontSize: `${fontSize}px`, fontFamily: selectedFont, color: 'var(--text-main)', lineHeight: '1.7', background: 'rgba(255,255,255,0.02)' }} />

          {/* Footer Area with Scheduling Option */}
          <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)' }}>
            {isScheduled && (
              <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideIn 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-soft)' }}>
                  <Calendar size={15} color="#818cf8" /> Scheduled Time:
                </div>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, outline: 'none', color: 'var(--text-main)', background: 'rgba(255,255,255,0.04)', colorScheme: 'dark' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <button type="button" onClick={() => { if (editorRef.current) editorRef.current.innerHTML = ''; setBody(''); }} style={footerActionStyle('#fb7185')}><Trash2 size={15} /> Clear</button>
                <button type="button" onClick={saveAsTemplate} style={footerActionStyle('#818cf8')}><Save size={15} /> Save</button>
                <button type="button" onClick={() => setIsScheduled(!isScheduled)} style={footerActionStyle(isScheduled ? '#818cf8' : 'var(--text-muted)')}><Clock size={15} /> {isScheduled ? 'Schedule Active' : 'Schedule'}</button>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {status.message && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: status.type === 'error' ? '#fb7185' : '#34d399' }}>{status.message}</span>}
                <button type="submit" disabled={loading} className="send-main">
                  {loading ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
                  {isScheduled ? 'Schedule' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .header-btn { display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: 1px solid var(--border); padding: 0.55rem 1.1rem; font-size: 0.8rem; font-weight: 700; color: var(--text-soft); cursor: pointer; border-radius: 10px; transition: all 0.2s; }
        .header-btn:hover { border-color: var(--border-hover); color: var(--text-main); transform: translateY(-1px); }
        .template-dropdown { position: absolute; top: 110%; right: 0; width: 300px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; z-index: 10; max-height: 400px; overflow-y: auto; box-shadow: var(--shadow-lg); }
        .tool-btn { background: transparent; border: 1px solid transparent; border-radius: 8px; padding: 6px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; width: auto; }
        .tool-btn:hover { background: rgba(255,255,255,0.06); border-color: var(--border); color: var(--text-main); transform: none; box-shadow: none; }
        .template-item { transition: all 0.2s; }
        .template-item:hover { background: rgba(99,102,241,0.08); color: #818cf8 !important; }
        .size-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 2px; width: auto; }
        .size-btn:hover { color: var(--text-main); transform: none; box-shadow: none; }
        [contenteditable]:empty:before { content: attr(placeholder); color: rgba(255,255,255,0.15); pointer-events: none; }
        [contenteditable] { color: var(--text-main) !important; }
        .send-main { background: var(--gradient-primary) !important; color: white; padding: 0.65rem 2rem; border-radius: 10px; font-weight: 700; border: none; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(99,102,241,0.25); width: auto; font-size: 0.85rem; }
        .send-main:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,0.35); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

const templateHeaderStyle = { padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' };
const templateItemStyle = { padding: '0.8rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-soft)', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'all 0.2s' };
const inputLabelStyle = { minWidth: '55px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' };
const headerInputStyle = { border: 'none', outline: 'none', flex: 1, fontSize: '0.875rem', fontWeight: 500, background: 'transparent', color: 'var(--text-main)' };
const chipStyle = { background: 'rgba(99,102,241,0.1)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc' };
const toolbarContainerStyle = { background: 'rgba(255,255,255,0.02)', padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' };
const dividerStyle = { width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' };
const selectStyle = { border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-soft)', cursor: 'pointer', outline: 'none', padding: '4px 8px', borderRadius: '6px' };
const sizeContainerStyle = { display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '3px 6px' };
const footerActionStyle = (color) => ({ color, background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8, width: 'auto', padding: '0.4rem 0.5rem' });

export default ComposeMail;

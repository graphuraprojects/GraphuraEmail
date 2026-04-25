import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Send, AlertCircle, CheckCircle2, Loader2, X, Type,
  Bold, Italic, Underline, Link as LinkIcon, List, AlignLeft, AlignCenter,
  Trash2, Plus, Minus, Layout, Save, Trash, Clock, Calendar
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

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
    const emails = val.split(/[,\s]+/).filter(e => e.trim().includes('@'));
    const newTags = [...recipientTags];
    let added = false;
    emails.forEach(email => {
      const clean = email.trim();
      if (clean && !newTags.includes(clean)) { newTags.push(clean); added = true; }
    });
    if (added) { setRecipientTags(newTags); setInputValue(''); }
    else if (val.endsWith(',') || val.endsWith(' ')) setInputValue('');
  };

  const removeTag = (index) => setRecipientTags(recipientTags.filter((_, i) => i !== index));

  const handleSend = async (e) => {
    e.preventDefault();
    if (recipientTags.length === 0 || !subject || !body) {
      setStatus({ type: 'error', message: 'All fields are required.' });
      return;
    }
    if (isScheduled && !scheduledTime) {
      setStatus({ type: 'error', message: 'Please select a date and time.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    const styledBody = `<div style="font-family: ${selectedFont}; font-size: ${fontSize}px; line-height: 1.6; color: #111827;">${body}</div>`;
    const payload = { recipients: recipientTags, subject, body: styledBody };
    const endpoint = isScheduled ? '/schedule-email' : '/send-emails';
    if (isScheduled) payload.scheduledAt = scheduledTime;

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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>Compose</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Precision dispatch terminal.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setShowTemplates(!showTemplates)} className="header-btn">
            <Layout size={16} color="#6366f1" /> Templates
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
                      {temp.name} <Trash size={12} color="#ef4444" onClick={(e) => deleteCustomTemplate(e, i)} />
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSend}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={inputLabelStyle}>To:</span>
              <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {recipientTags.map((tag, i) => (
                  <div key={i} style={chipStyle}>{tag} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(i)} /></div>
                ))}
                <input
                  type="text" value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); if (e.target.value.includes(',') || e.target.value.includes(' ')) addTag(e.target.value); }}
                  placeholder={recipientTags.length === 0 ? "Add recipients..." : ""}
                  style={headerInputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={inputLabelStyle}>Subject:</span>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={headerInputStyle} />
            </div>
          </div>

          <div style={toolbarContainerStyle}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button type="button" onClick={() => execCommand('bold')} className="tool-btn"><Bold size={16} /></button>
              <button type="button" onClick={() => execCommand('italic')} className="tool-btn"><Italic size={16} /></button>
              <button type="button" onClick={() => execCommand('underline')} className="tool-btn"><Underline size={16} /></button>
              <div style={dividerStyle} />
              <button type="button" onClick={() => { const u = prompt('URL:'); if (u) execCommand('createLink', u); }} className="tool-btn"><LinkIcon size={16} /></button>
              <button type="button" onClick={() => execCommand('insertUnorderedList')} className="tool-btn"><List size={16} /></button>
              <div style={dividerStyle} />
              <button type="button" onClick={() => execCommand('justifyLeft')} className="tool-btn"><AlignLeft size={16} /></button>
              <button type="button" onClick={() => execCommand('justifyCenter')} className="tool-btn"><AlignCenter size={16} /></button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                    width: '55px',
                    border: 'none',
                    textAlign: 'center',
                    fontSize: '1rem',
                    fontWeight: '900',
                    color: '#000000',
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

          <div ref={editorRef} contentEditable onInput={updateBody} placeholder="Draft message..." style={{ padding: '2.5rem', minHeight: '400px', outline: 'none', fontSize: `${fontSize}px`, fontFamily: selectedFont, color: '#111827', lineHeight: '1.7' }} />

          {/* Footer Area with Scheduling Option */}
          <div style={{ padding: '1.5rem', background: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
            {isScheduled && (
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideIn 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                  <Calendar size={16} color="#3b82f6" /> Scheduled Time:
                </div>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.85rem', fontWeight: 600, outline: 'none' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <button type="button" onClick={() => { if (editorRef.current) editorRef.current.innerHTML = ''; setBody(''); }} style={footerActionStyle('#ef4444')}><Trash2 size={16} /> Clear</button>
                <button type="button" onClick={saveAsTemplate} style={footerActionStyle('#6366f1')}><Save size={16} /> Save</button>
                <button type="button" onClick={() => setIsScheduled(!isScheduled)} style={footerActionStyle(isScheduled ? '#3b82f6' : '#64748b')}><Clock size={16} /> {isScheduled ? 'Schedule Active' : 'Schedule'}</button>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {status.message && <span style={{ fontSize: '0.9rem', fontWeight: 700, color: status.type === 'error' ? '#ef4444' : '#10b981' }}>{status.message}</span>}
                <button type="submit" disabled={loading} className="send-main">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {isScheduled ? 'Schedule Email' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .header-btn { display: flex; align-items: center; gap: 8px; background: white; border: 1px solid #e5e7eb; padding: 0.6rem 1.2rem; borderRadius: 0.6rem; fontSize: 0.85rem; fontWeight: 700; color: #374151; cursor: pointer; border-radius: 8px; }
        .template-dropdown { position: absolute; top: 110%; right: 0; width: 300px; background: white; border: 1px solid #e5e7eb; border-radius: 0.8rem; boxShadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 10; max-height: 400px; overflow-y: auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .tool-btn { background: transparent; border: 1px solid transparent; border-radius: 6px; padding: 6px; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .tool-btn:hover { background: white; border-color: #d1d5db; color: #111827; }
        .template-item:hover { background: #f3f4f6; color: #6366f1 !important; }
        .size-btn { background: transparent; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; padding: 2px; }
        [contenteditable]:empty:before { content: attr(placeholder); color: #94a3b8; pointer-events: none; }
        .send-main { background: #111827; color: white; padding: 0.75rem 2.5rem; border-radius: 0.6rem; font-weight: 700; border: none; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
        .send-main:hover { background: #000; transform: translateY(-1px); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

const templateHeaderStyle = { padding: '0.75rem 1rem', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' };
const templateItemStyle = { padding: '0.85rem 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', transition: 'all 0.2s' };
const inputLabelStyle = { minWidth: '60px', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' };
const headerInputStyle = { border: 'none', outline: 'none', flex: 1, fontSize: '0.9rem', fontWeight: 500, background: 'transparent' };
const chipStyle = { background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e5e7eb' };
const toolbarContainerStyle = { background: '#f9fafb', padding: '0.75rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' };
const dividerStyle = { width: '1px', height: '20px', background: '#e5e7eb', margin: '0 8px' };
const selectStyle = { border: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', cursor: 'pointer', outline: 'none' };
const sizeContainerStyle = { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '4px 8px' };
const sizeInputStyle = { width: '40px', border: 'none', textAlign: 'center', fontSize: '0.9rem', fontWeight: '900', color: '#000', outline: 'none', background: 'transparent' };
const footerActionStyle = (color) => ({ color, background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 });

export default ComposeMail;

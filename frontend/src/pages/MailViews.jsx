import React from 'react';
import { Mail, Inbox, Trash2, Send, AlertCircle } from 'lucide-react';

function PlaceholderPage({ title, icon: Icon }) {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <div style={{ 
        width: '80px', height: '80px', 
        borderRadius: '20px', 
        background: 'rgba(99,102,241,0.08)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem auto'
      }}>
        <Icon size={36} style={{ color: '#818cf8', opacity: 0.6 }} />
      </div>
      <h1 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>This feature is coming soon in the next update.</p>
    </div>
  );
}

export const InboxPage = () => <PlaceholderPage title="Inbox" icon={Inbox} />;
export const TrashPage = () => <PlaceholderPage title="Trash" icon={Trash2} />;
export const SentPage = () => <PlaceholderPage title="Sent Mail" icon={Send} />;

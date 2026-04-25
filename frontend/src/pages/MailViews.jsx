import React from 'react';
import { Mail, Inbox, Trash2, Send, AlertCircle } from 'lucide-react';

function PlaceholderPage({ title, icon: Icon }) {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem', opacity: 0.5 }}>
      <Icon size={64} style={{ marginBottom: '1.5rem', color: 'var(--primary)' }} />
      <h1>{title}</h1>
      <p>This feature is coming soon in the next update.</p>
    </div>
  );
}

export const InboxPage = () => <PlaceholderPage title="Inbox" icon={Inbox} />;
export const TrashPage = () => <PlaceholderPage title="Trash" icon={Trash2} />;
export const SentPage = () => <PlaceholderPage title="Sent Mail" icon={Send} />;

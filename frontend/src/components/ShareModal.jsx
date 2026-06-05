import React, { useState } from 'react';
import { X, Send, Mail, MessageSquare, Copy, Check, Share2 } from 'lucide-react';

const InstagramIcon = ({ size = 24 }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function ShareModal({ isOpen, onClose, hostel }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !hostel) return null;

  const isRoom = hostel.type === 'room';
  const name = isRoom ? hostel.room_name : hostel.hostel_name;
  const address = hostel.address || 'Near SRKR Engineering College';
  const price = isRoom ? hostel.price_per_person : hostel.price_starting;
  const priceSuffix = isRoom ? '/month' : '/year';
  const shareUrl = `${window.location.origin}/NIVAS-2.O/detail?id=${hostel.id}&type=${isRoom ? 'room' : 'hostel'}`;
  const shareText = `Check out ${name} on Nivas Accommodations! Starting from ₹${Math.round(price)}${priceSuffix}. Address: ${address}.`;
  const shareSubject = isRoom ? `Premium Room Accommodation: ${name}` : `Premium Hostel Accommodation: ${name}`;

  // Pre-configured social URLs
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n\nLink: ' + shareUrl)}`;
  const gmailUrl = `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareText + '\n\nExplore details here: ' + shareUrl)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999999,
      animation: 'fadeIn 0.25s ease-out',
      padding: '1rem'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        padding: '2rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        background: '#ffffff',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        color: '#0f172a'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '3.2rem',
            height: '3.2rem',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Share2 size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
            Share {isRoom ? 'Room / PG' : 'Hostel'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Share {name} with friends and family
          </p>
        </div>

        {/* Share buttons grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* WhatsApp */}
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              color: '#4ade80',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Send size={24} style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>WhatsApp</span>
          </a>

          {/* Gmail */}
          <a 
            href={gmailUrl}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Mail size={24} style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Gmail</span>
          </a>

          {/* SMS / Default Messaging */}
          <a 
            href={smsUrl}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              color: 'var(--primary)',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <MessageSquare size={24} style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>SMS</span>
          </a>

          {/* Instagram prompt */}
          <div 
            onClick={() => {
              handleCopyLink();
              alert("Link copied! Paste it in your Instagram story, DM, or bio to share.");
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              color: '#f472b6',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <InstagramIcon size={24} style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Instagram</span>
          </div>
        </div>

        {/* Link input + copy button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f8fafc',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.25rem 0.25rem 0.25rem 0.75rem',
          gap: '0.5rem'
        }}>
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flexGrow: 1
          }}>
            {shareUrl}
          </span>
          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: copied ? '#22c55e' : 'var(--primary)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 700,
              transition: 'all 0.2s'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

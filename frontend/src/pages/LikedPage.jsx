import React, { useEffect, useState } from 'react';
import { Bookmark, ArrowLeft, Inbox, Hotel, Key } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { API_BASE_URL } from '../config';
import logoImg from '../assets/logo.jpeg';

export default function LikedPage({ 
  setPage, 
  openDetail, 
  userToken, 
  triggerLike, 
  triggerShare 
}) {
  const [likedHostels, setLikedHostels] = useState([]);
  const [likedRooms, setLikedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hostels'); // 'hostels' or 'rooms'

  useEffect(() => {
    if (!userToken) {
      setLoading(false);
      return;
    }

    async function fetchLikes() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/auth/likes`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setLikedHostels(data.hostels || []);
          setLikedRooms(data.rooms || []);
        }
      } catch (error) {
        console.error('Error fetching liked items:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLikes();
  }, [userToken]);

  const handleToggleLike = (id, type) => {
    triggerLike(id, type, (liked, likesCount) => {
      if (!liked) {
        // If user unliked it, remove from the local state list dynamically
        if (type === 'hostel') {
          setLikedHostels(prev => prev.filter(item => item.id !== id));
        } else {
          setLikedRooms(prev => prev.filter(item => item.id !== id));
        }
      }
    });
  };

  const activeList = activeTab === 'hostels' ? likedHostels : likedRooms;
  const bothEmpty = likedHostels.length === 0 && likedRooms.length === 0;

  return (
    <div className="list-page-container animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back button and page title */}
      <div>
        <button 
          onClick={() => setPage('home')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            padding: '0.5rem 0',
            marginBottom: '1rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bookmark size={28} fill="var(--primary)" style={{ color: 'var(--primary)' }} />
          <span>Saved Stays</span>
        </h1>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '1.5rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
            <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid var(--primary-glow)', animation: 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.8 }} />
            <img 
              src={logoImg} 
              alt="Loading" 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} 
            />
          </div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading liked accommodations...</span>
        </div>
      ) : !userToken ? (
        /* Logged Out Fallback State */
        <div className="no-results" style={{ padding: '3rem 1.5rem', margin: '2rem 0' }}>
          <Inbox size={48} className="no-results-icon" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, margin: '0.75rem 0 0.5rem 0' }}>Please Log In</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
            You need to be logged in to view your liked accommodations.
          </p>
          <button onClick={() => setPage('home')} className="nav-button">
            Go to Home
          </button>
        </div>
      ) : bothEmpty ? (
        /* Both empty Fallback State */
        <div className="no-results" style={{ padding: '4rem 1.5rem', margin: '1rem 0' }}>
          <Bookmark size={48} className="no-results-icon" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, margin: '0.75rem 0 0.5rem 0' }}>No saved hostels and rooms</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
            You haven't saved any listings yet. Explore properties and tap the bookmark icon to save them here.
          </p>
          <button onClick={() => setPage('home')} className="nav-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>
      ) : (
        /* Main tabs content list view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Sub-navbar tabs selector */}
          <div style={{ 
            display: 'inline-flex', 
            background: 'rgba(30, 41, 59, 0.4)', 
            border: '1px solid var(--border)', 
            padding: '0.35rem', 
            borderRadius: 'var(--radius-full)',
            alignSelf: 'flex-start',
            backdropFilter: 'blur(8px)'
          }}>
            <button 
              onClick={() => setActiveTab('hostels')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === 'hostels' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'hostels' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'hostels' ? '0 4px 12px var(--primary-glow)' : 'none'
              }}
            >
              <Hotel size={14} />
              <span>Hostels ({likedHostels.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('rooms')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === 'rooms' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'rooms' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'rooms' ? '0 4px 12px var(--primary-glow)' : 'none'
              }}
            >
              <Key size={14} />
              <span>PG & Rooms ({likedRooms.length})</span>
            </button>
          </div>

          {/* Active Tab Empty State */}
          {activeList.length === 0 ? (
            <div className="no-results" style={{ padding: '3.5rem 1.5rem', border: '1px dashed var(--border)' }}>
              <Inbox size={40} className="no-results-icon" style={{ opacity: 0.6 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0' }}>
                {activeTab === 'hostels' ? 'No saved hostels' : 'No saved rooms'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '320px', margin: '0 auto 1.5rem auto' }}>
                You haven't added any {activeTab === 'hostels' ? 'hostels' : 'rooms/PGs'} to your saved list yet.
              </p>
              <button onClick={() => setPage(activeTab)} className="nav-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                <span>Browse {activeTab === 'hostels' ? 'Hostels' : 'PG & Rooms'}</span>
              </button>
            </div>
          ) : (
            /* Listing Grid */
            <div className="grid-layout">
              {activeList.map(item => (
                <ListingCard 
                  key={`${activeTab}-${item.id}`}
                  item={item}
                  type={activeTab === 'hostels' ? 'hostel' : 'room'}
                  onClick={() => openDetail(item.id, activeTab === 'hostels' ? 'hostel' : 'room')}
                  triggerLike={handleToggleLike}
                  triggerShare={triggerShare}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

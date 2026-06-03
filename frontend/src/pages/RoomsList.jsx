import React, { useEffect, useState } from 'react';
import { Search, Inbox, Filter } from 'lucide-react';
import FiltersBar from '../components/FiltersBar';
import ListingCard from '../components/ListingCard';
import InlineBanner from '../components/InlineBanner';
import { API_BASE_URL } from '../config';
import logoImg from '../assets/logo.jpeg';

export default function RoomsList({ 
  setPage, 
  setDetailId, 
  setDetailType,
  filters,
  setFilters,
  search,
  setSearch,
  initialFilters
}) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearch('');
  };

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/banners`);
        const data = await res.json();
        setBanners(data.filter(b => b.in_between === 1 || b.in_between === true));
      } catch (error) {
        console.error('Error loading inline banners:', error);
      }
    }
    fetchBanners();
  }, []);

  useEffect(() => {
    async function fetchFilteredRooms() {
      try {
        setLoading(true);
        // Build query string
        const params = new URLSearchParams();
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.is_ac) params.append('is_ac', filters.is_ac);
        if (filters.price_min) params.append('price_min', filters.price_min);
        if (filters.price_max) params.append('price_max', filters.price_max);
        if (filters.distance_max) params.append('distance_max', filters.distance_max);
        if (filters.beds_per_room) params.append('beds_per_room', filters.beds_per_room);

        const res = await fetch(`${API_BASE_URL}/api/rooms?${params.toString()}`);
        const data = await res.json();
        setRooms(data);
      } catch (error) {
        console.error('Error loading filtered rooms:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredRooms();
  }, [filters]);

  const handleSelectRoom = (id) => {
    setDetailId(id);
    setDetailType('room');
    setPage('detail');
  };

  // Local Search Filter
  const filteredRoomsList = rooms.filter(room => 
    room.room_name.toLowerCase().includes(search.toLowerCase()) ||
    (room.address && room.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="list-page-container animate-fade">
      {/* Filters Sidebar */}
      <FiltersBar 
        type="room"
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        isOpen={showMobileFilters}
        setIsOpen={setShowMobileFilters}
      />

      {/* Main Listings Column */}
      <div className="grid-listings-wrapper">
        <div className="grid-listings-header">
          <div className="detail-title-col">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>Explore rental house</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input 
              type="text" 
              placeholder="Search rooms/PGs by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.8rem', borderRadius: 'var(--radius-full)' }}
            />
          </div>
          <button 
            className="mobile-filter-toggle-btn"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>

        {/* Grid List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '2rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: '140px', height: '140px', borderRadius: '50%', border: '2px solid var(--primary-glow)', animation: 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.8 }} />
              <div style={{ 
                width: '110px', 
                height: '110px', 
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={logoImg} 
                  alt="Nivas Logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    animation: 'morph-shape 6s ease-in-out infinite, pulse-slow 2s ease-in-out infinite' 
                  }} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>Finding rooms near SRKR...</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>developed by KaliX</span>
            </div>
            <style>{`
              @keyframes pulse-slow {
                0%, 100% { transform: scale(1); opacity: 0.95; }
                50% { transform: scale(1.08); opacity: 1; filter: brightness(1.08); }
              }
              @keyframes ping-slow {
                0% { transform: scale(0.95); opacity: 0.8; }
                70%, 100% { transform: scale(1.4); opacity: 0; }
              }
              @keyframes morph-shape {
                0%, 100% {
                  clip-path: polygon(50% 0%, 79.4% 9.5%, 97.6% 34.5%, 97.6% 65.5%, 79.4% 90.5%, 50% 100%, 20.6% 90.5%, 2.4% 65.5%, 2.4% 34.5%, 20.6% 9.5%);
                  border-radius: 50%;
                }
                33% {
                  clip-path: polygon(50% 0%, 100% 0%, 100% 50%, 100% 100%, 50% 100%, 50% 100%, 0% 100%, 0% 50%, 0% 0%, 0% 0%);
                  border-radius: 0%;
                }
                66% {
                  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
                  border-radius: 0%;
                }
              }
            `}</style>
          </div>
        ) : filteredRoomsList.length === 0 ? (
          <div className="no-results">
            <Inbox size={48} className="no-results-icon" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Rooms Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 1.5rem auto' }}>
              We couldn't find any rooms or PGs matching your selected filters or search terms. Try adjusting your preferences.
            </p>
            <button className="nav-button" onClick={resetFilters}>
              Reset Filters & Search
            </button>
          </div>
        ) : (
          <div className="grid-layout">
            {filteredRoomsList.map((room) => (
              <ListingCard 
                key={`room-${room.id}`}
                item={room}
                type="room"
                onClick={() => handleSelectRoom(room.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

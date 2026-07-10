import React, { useEffect, useState } from 'react';
import { Search, Inbox, Filter, Info } from 'lucide-react';
import FiltersBar from '../components/FiltersBar';
import ListingCard from '../components/ListingCard';
import { API_BASE_URL } from '../config';
import logoImg from '../assets/logo.jpeg';

export default function RoomsList({ 
  setPage, 
  openDetail,
  filters,
  setFilters,
  search,
  setSearch,
  initialFilters,
  userToken,
  triggerLike,
  triggerShare,
  selectedCollege,
  setSelectedCollege
}) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceBounds, setPriceBounds] = useState({ minPrice: 0, maxPrice: 10000 });
  const [showTeluguInfo, setShowTeluguInfo] = useState(false);

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearch('');
  };

  useEffect(() => {
    async function fetchPriceBounds() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/rooms/price-bounds`);
        const data = await res.json();
        if (data.minPrice !== undefined && data.maxPrice !== undefined) {
          setPriceBounds({ minPrice: data.minPrice, maxPrice: data.maxPrice });
        }
      } catch (error) {
        console.error('Error fetching room price bounds:', error);
      }
    }
    fetchPriceBounds();
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
        if (filters.associated_college) params.append('associated_college', filters.associated_college);

        const headers = {};
        if (userToken) {
          headers['Authorization'] = `Bearer ${userToken}`;
        }

        const res = await fetch(`${API_BASE_URL}/api/rooms?${params.toString()}`, { headers });
        const data = await res.json();
        setRooms(data);
      } catch (error) {
        console.error('Error loading filtered rooms:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredRooms();
  }, [filters, userToken]);

  const handleSelectRoom = (id) => {
    openDetail(id, 'room');
  };

  const handleToggleLike = (id, type) => {
    triggerLike(id, type, (liked, likesCount) => {
      setRooms(prev => 
        prev.map(item => item.id === id ? { ...item, is_liked: liked, likes_count: likesCount } : item)
      );
    });
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
        priceBounds={priceBounds}
      />

      {/* Main Listings Column */}
      <div className="grid-listings-wrapper">
        <div className="grid-listings-header">
          <div className="detail-title-col" style={{ width: '100%' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>
              Rooms & PGs near {selectedCollege === 'Vishnu engineering college' ? 'Vishnu' : 'SRKR'}
            </h1>
            
            {/* College selector dropdown */}
            <div style={{ 
              marginTop: '1rem',
              marginBottom: '1rem',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.4rem',
              maxWidth: '400px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Select your college
                </label>
                <button 
                  onClick={() => setShowTeluguInfo(!showTeluguInfo)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.2rem',
                    borderRadius: '50%',
                    transition: 'background 0.2s',
                    outline: 'none'
                  }}
                  title="to find hostel near ur college"
                  aria-label="College filter info"
                >
                  <Info size={16} />
                </button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  to find hostel near ur college
                </span>
              </div>

              {showTeluguInfo && (
                <div style={{ 
                  background: 'var(--primary-glow)', 
                  borderLeft: '4px solid var(--primary)', 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  animation: 'fadeIn 0.3s ease'
                }}>
                  మీ కాలేజీకి దగ్గరగా ఉన్న హాస్టల్స్ ని కనుగొనండి
                </div>
              )}

              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer'
                }}
              >
                <option value="SRKR Engineering">SRKR Engineering</option>
                <option value="Vishnu engineering college">Vishnu engineering college</option>
              </select>
            </div>
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
            className="filter-toggle-btn"
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
                    borderRadius: '50%',
                    animation: 'pulse-slow 2s ease-in-out infinite' 
                  }} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>Finding rooms near {selectedCollege === 'Vishnu engineering college' ? 'Vishnu' : 'SRKR'}...</span>
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
                triggerLike={handleToggleLike}
                triggerShare={triggerShare}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

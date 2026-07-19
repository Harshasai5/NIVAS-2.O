import React, { useEffect, useState } from 'react';
import { Search, Inbox, Filter, Info, Sparkles } from 'lucide-react';
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
    <div className="list-page-container animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem 1rem' }}>
      <div 
        className="glass" 
        style={{ 
          maxWidth: '600px', 
          width: '100%', 
          padding: '3rem 2rem', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border)', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--primary-glow)',
          color: 'var(--primary)'
        }}>
          <Sparkles size={40} style={{ animation: 'pulse-slow 2s ease-in-out infinite' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Launching Soon!!!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600 }}>
            Our Room & PG Listing Portal is under construction.
          </p>
        </div>

        <div style={{ 
          width: '100%', 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px dashed var(--border)', 
          borderRadius: 'var(--radius-md)', 
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Are you a property owner?
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            If you have rental rooms, PG accommodations, or houses to lease out, list them with us!
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--unisex-color)', marginTop: '0.5rem' }}>
            Contact Us to Partner up:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
            <a 
              href="tel:9676268929" 
              style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <span>Deepak:</span> <span style={{ color: 'var(--primary)' }}>9676268929</span>
            </a>
            <a 
              href="tel:8919892669" 
              style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <span>Harsha:</span> <span style={{ color: 'var(--primary)' }}>8919892669</span>
            </a>
            <a 
              href="tel:9059174370" 
              style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <span>Sudarsan:</span> <span style={{ color: 'var(--primary)' }}>9059174370</span>
            </a>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

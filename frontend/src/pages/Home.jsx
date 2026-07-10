import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Hotel, Key, MapPin, Navigation, X, Info } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import SponsoredHostels from '../components/SponsoredHostels';
import ListingCard from '../components/ListingCard';
import { API_BASE_URL } from '../config';
import logoImg from '../assets/logo.jpeg';

export default function Home({ setPage, openDetail, setHostelFilters, initialHostelFilters, userToken, triggerLike, triggerShare, selectedCollege, setSelectedCollege }) {
  const [banners, setBanners] = useState([]);
  const [sponsoredHostels, setSponsoredHostels] = useState([]);
  const [nearbyRooms, setNearbyRooms] = useState([]);
  const [allHostels, setAllHostels] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [collegeHostels, setCollegeHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTeluguInfo, setShowTeluguInfo] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const headers = {};
        if (userToken) {
          headers['Authorization'] = `Bearer ${userToken}`;
        }

        // 1. Fetch Banners
        const bannersRes = await fetch(`${API_BASE_URL}/api/banners`);
        const bannersJson = await bannersRes.json();
        const bannersData = Array.isArray(bannersJson) ? bannersJson : [];
        const mainBanners = bannersData.filter(b => b.main_display === 1 || b.main_display === true);
        setBanners(mainBanners.length > 0 ? mainBanners : bannersData);

        // 2. Fetch Sponsored Hostels
        const sponsoredRes = await fetch(`${API_BASE_URL}/api/hostels?sponsored=true&limit=6&associated_college=${encodeURIComponent(selectedCollege)}`, { headers });
        const sponsoredJson = await sponsoredRes.json();
        setSponsoredHostels(Array.isArray(sponsoredJson) ? sponsoredJson : []);

        // 3. Fetch Hostels (Limit to 6)
        const hostelsRes = await fetch(`${API_BASE_URL}/api/hostels?sponsored=false&limit=6&associated_college=${encodeURIComponent(selectedCollege)}`, { headers });
        const hostelsJson = await hostelsRes.json();
        setAllHostels(Array.isArray(hostelsJson) ? hostelsJson : []);

        // 4. Fetch PG Rooms (Limit to 6)
        const roomsRes = await fetch(`${API_BASE_URL}/api/rooms?limit=6&associated_college=${encodeURIComponent(selectedCollege)}`);
        const roomsJson = await roomsRes.json();
        setAllRooms(Array.isArray(roomsJson) ? roomsJson : []);

        // 5. Fetch Nearby Rooms (Limit to 6, under 1.2km)
        const nearbyRes = await fetch(`${API_BASE_URL}/api/rooms?distance_max=1.2&limit=6&associated_college=${encodeURIComponent(selectedCollege)}`);
        const nearbyJson = await nearbyRes.json();
        setNearbyRooms(Array.isArray(nearbyJson) ? nearbyJson : []);

        // 6. Fetch College Hostels (Limit to 6)
        const collegeRes = await fetch(`${API_BASE_URL}/api/hostels?college=true&limit=6&associated_college=${encodeURIComponent(selectedCollege)}`, { headers });
        const collegeJson = await collegeRes.json();
        setCollegeHostels(Array.isArray(collegeJson) ? collegeJson : []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userToken, selectedCollege]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '2rem' }}>
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
          <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>Loading accommodations...</span>
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
    );
  }
  const handleToggleLike = (id, type) => {
    triggerLike(id, type, (liked, likesCount) => {
      const updateListItem = (list) => 
        list.map(item => item.id === id ? { ...item, is_liked: liked, likes_count: likesCount } : item);

      if (type === 'hostel') {
        setSponsoredHostels(prev => updateListItem(prev));
        setAllHostels(prev => updateListItem(prev));
        setCollegeHostels(prev => updateListItem(prev));
      } else {
        setNearbyRooms(prev => updateListItem(prev));
        setAllRooms(prev => updateListItem(prev));
      }
    });
  };

  const mainBanners = banners.filter(b => b.main_display === 1 || b.main_display === true);

  return (
    <div className="animate-fade">
      {/* 1. Hero Banner Section */}
      <HeroBanner banners={mainBanners} />

      {/* 2. Sponsored Hostels Section */}
      <SponsoredHostels 
        hostels={sponsoredHostels.slice(0, 6)} 
        onSelectHostel={(id) => openDetail(id, 'hostel')} 
        onViewAll={() => setPage('hostels')}
        triggerLike={handleToggleLike}
        triggerShare={triggerShare}
      />

      {/* College Selector Section */}
      <div style={{ 
        padding: '1.5rem 5% 0.5rem 5%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
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
            <Info size={18} />
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            to find hostel near ur college
          </span>
        </div>

        {showTeluguInfo && (
          <div style={{ 
            background: 'var(--primary-glow)', 
            borderLeft: '4px solid var(--primary)', 
            padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
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
            maxWidth: '400px',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text)',
            fontSize: '0.95rem',
            fontWeight: 600,
            outline: 'none',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            marginTop: '0.25rem'
          }}
        >
          <option value="SRKR Engineering">SRKR Engineering</option>
          <option value="Vishnu engineering college">Vishnu engineering college</option>
        </select>
      </div>

      {/* Quick Navigation Quick Links */}
      <div style={{ padding: '0 5% 2rem 5%', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          className="action-btn action-btn-secondary" 
          onClick={() => setPage('hostels')}
          style={{ flex: 1, minWidth: '150px', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--border)' }}
        >
          <Hotel size={24} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>View Hostels</span>
        </button>
        <button 
          className="action-btn action-btn-secondary" 
          onClick={() => setPage('rooms')}
          style={{ flex: 1, minWidth: '150px', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--border)' }}
        >
          <Key size={24} style={{ color: 'var(--unisex-color)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>View Rooms</span>
        </button>
      </div>

      {/* 3. Nearby Rooms Section */}
      {nearbyRooms.length > 0 && (
        <section style={{ margin: '2rem 0' }}>
          <div className="section-header">
            <h2 className="section-title">
              <span>Rooms Near {selectedCollege === 'Vishnu engineering college' ? 'Vishnu College' : 'SRKR College'}</span>
            </h2>
            <div className="section-action" onClick={() => setPage('rooms')}>
              <span>View All</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="scroll-container">
            {nearbyRooms.slice(0, 6).map((room) => (
              <ListingCard 
                key={room.id}
                item={room}
                type="room"
                onClick={() => openDetail(room.id, 'room')}
                triggerLike={handleToggleLike}
                triggerShare={triggerShare}
              />
            ))}
            <div className="view-more-card" onClick={() => setPage('rooms')}>
              <div className="view-more-icon">
                <ArrowRight size={24} />
              </div>
              <span style={{ fontWeight: 700 }}>View All Rooms</span>
            </div>
          </div>
        </section>
      )}

      {/* Hostels Section */}
      {allHostels.length > 0 && (
        <section style={{ margin: '2rem 0' }}>
          <div className="section-header">
            <h2 className="section-title">
              <span>Hostels</span>
            </h2>
            <div className="section-action" onClick={() => setPage('hostels')}>
              <span>View All</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="scroll-container">
            {allHostels.slice(0, 6).map((hostel) => (
              <ListingCard 
                key={hostel.id}
                item={hostel}
                type="hostel"
                onClick={() => openDetail(hostel.id, 'hostel')}
                triggerLike={handleToggleLike}
                triggerShare={triggerShare}
              />
            ))}
            <div className="view-more-card" onClick={() => setPage('hostels')}>
              <div className="view-more-icon">
                <ArrowRight size={24} />
              </div>
              <span style={{ fontWeight: 700 }}>View All Hostels</span>
            </div>
          </div>
        </section>
      )}

      {/* 5. PG / Room Listings Section */}
      {allRooms.length > 0 && (
        <section style={{ margin: '2rem 0' }}>
          <div className="section-header">
            <h2 className="section-title">
              <span>Rental PG & Rooms</span>
            </h2>
            <div className="section-action" onClick={() => setPage('rooms')}>
              <span>View All</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="scroll-container">
            {allRooms.slice(0, 6).map((room) => (
              <ListingCard 
                key={room.id}
                item={room}
                type="room"
                onClick={() => openDetail(room.id, 'room')}
                triggerLike={handleToggleLike}
                triggerShare={triggerShare}
              />
            ))}
            <div className="view-more-card" onClick={() => setPage('rooms')}>
              <div className="view-more-icon">
                <ArrowRight size={24} />
              </div>
              <span style={{ fontWeight: 700 }}>View All Rooms</span>
            </div>
          </div>
        </section>
      )}

      {/* 4b. College Affiliated Hostels Section */}
      {collegeHostels.length > 0 && (
        <section style={{ margin: '2rem 0', paddingBottom: '3rem' }}>
          <div className="section-header">
            <h2 className="section-title">
              <span>College Hostels</span>
            </h2>
            <div className="section-action" onClick={() => {
              if (setHostelFilters && initialHostelFilters) {
                setHostelFilters({ ...initialHostelFilters, college: 'true' });
              }
              setPage('hostels');
            }}>
              <span>View All</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="scroll-container">
            {collegeHostels.slice(0, 6).map((hostel) => (
              <ListingCard 
                key={hostel.id}
                item={hostel}
                type="hostel"
                onClick={() => openDetail(hostel.id, 'hostel')}
                triggerLike={handleToggleLike}
                triggerShare={triggerShare}
              />
            ))}
            <div className="view-more-card" onClick={() => {
              if (setHostelFilters && initialHostelFilters) {
                setHostelFilters({ ...initialHostelFilters, college: 'true' });
              }
              setPage('hostels');
            }}>
              <div className="view-more-icon">
                <ArrowRight size={24} />
              </div>
              <span style={{ fontWeight: 700 }}>View All College Hostels</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Hotel, Key, MapPin, Navigation, X } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import SponsoredHostels from '../components/SponsoredHostels';
import ListingCard from '../components/ListingCard';

export default function Home({ setPage, setDetailId, setDetailType, setHostelFilters, initialHostelFilters }) {
  const [banners, setBanners] = useState([]);
  const [sponsoredHostels, setSponsoredHostels] = useState([]);
  const [nearbyRooms, setNearbyRooms] = useState([]);
  const [allHostels, setAllHostels] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1. Fetch Banners
        const bannersRes = await fetch('/api/banners');
        const bannersData = await bannersRes.json();
        const mainBanners = bannersData.filter(b => b.main_display === 1 || b.main_display === true);
        setBanners(mainBanners.length > 0 ? mainBanners : bannersData);

        // 2. Fetch Sponsored Hostels
        const sponsoredRes = await fetch('/api/hostels?sponsored=true');
        const sponsoredData = await sponsoredRes.json();
        setSponsoredHostels(sponsoredData);

        // 3. Fetch Hostels (Client List)
        const hostelsRes = await fetch('/api/hostels');
        const hostelsData = await hostelsRes.json();
        setAllHostels(hostelsData);

        // 4. Fetch PG Rooms (Client List)
        const roomsRes = await fetch('/api/rooms');
        const roomsData = await roomsRes.json();
        setAllRooms(roomsData);

        // 5. Filter Nearby Rooms (< 1.2 km from SRKR)
        const nearby = roomsData.filter(room => room.distance_from_srkr <= 1.2);
        setNearbyRooms(nearby);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSelectListing = (id, type) => {
    setDetailId(id);
    setDetailType(type);
    setPage('detail');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading accommodations...</span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const mainBanners = banners.filter(b => b.main_display === 1 || b.main_display === true);
  const inBetweenBanners = banners.filter(b => b.in_between === 1 || b.in_between === true);

  return (
    <div className="animate-fade">
      {/* 1. Hero Banner Section */}
      <HeroBanner banners={mainBanners} />

      {/* 2. Sponsored Hostels Section (Double Row on Mobile) */}
      <SponsoredHostels 
        hostels={sponsoredHostels} 
        onSelectHostel={(id) => handleSelectListing(id, 'hostel')} 
      />

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

      {/* 3. Nearby Rooms Section (< 1.2km to SRKR College) */}
      {nearbyRooms.length > 0 && (
        <section style={{ margin: '2rem 0' }}>
          <div className="section-header">
            <h2 className="section-title">
              <span>Rooms Near SRKR College</span>
            </h2>
            <div className="section-action" onClick={() => setPage('rooms')}>
              <span>View All</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="scroll-container">
            {nearbyRooms.slice(0, 4).map((room) => (
              <ListingCard 
                key={room.id}
                item={room}
                type="room"
                onClick={() => handleSelectListing(room.id, 'room')}
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
              <span>View All Hostels</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="scroll-container">
            {allHostels.slice(0, 4).map((hostel) => (
              <ListingCard 
                key={hostel.id}
                item={hostel}
                type="hostel"
                onClick={() => handleSelectListing(hostel.id, 'hostel')}
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
              <span>View All Rooms</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="scroll-container">
            {allRooms.slice(0, 4).map((room) => (
              <ListingCard 
                key={room.id}
                item={room}
                type="room"
                onClick={() => handleSelectListing(room.id, 'room')}
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

      {/* 4b. College Affiliated Hostels Section (Now at the bottom of the home page) */}
      {(() => {
        const collegeHostels = allHostels.filter(h => h.is_college_hostel === 1 || h.is_college_hostel === true);
        if (collegeHostels.length === 0) return null;

        return (
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
              {collegeHostels.slice(0, 4).map((hostel) => (
                <ListingCard 
                  key={hostel.id}
                  item={hostel}
                  type="hostel"
                  onClick={() => handleSelectListing(hostel.id, 'hostel')}
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
        );
      })()}
    </div>
  );
}



import React, { useEffect, useState } from 'react';
import { Search, Inbox, Filter } from 'lucide-react';
import FiltersBar from '../components/FiltersBar';
import ListingCard from '../components/ListingCard';
import InlineBanner from '../components/InlineBanner';

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
        const res = await fetch('/api/banners');
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

        const res = await fetch(`/api/rooms?${params.toString()}`);
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
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>Explore PG & Rental Rooms</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Budget-friendly stays and luxury PG accommodations near SRKR</p>
          </div>

          {/* Listings Count */}
          <div className="grid-listings-count">
            Found <span className="grid-listings-count-num">{filteredRoomsList.length}</span> rooms
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Loading rooms...</span>
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
            {(() => {
              const renderList = [];
              const activeBanners = banners;
              
              filteredRoomsList.forEach((room, index) => {
                renderList.push(
                  <ListingCard 
                    key={`room-${room.id}`}
                    item={room}
                    type="room"
                    onClick={() => handleSelectRoom(room.id)}
                  />
                );
                
                // Show banner after every 3rd card
                const position = index + 1;
                if (position % 3 === 0 && activeBanners.length > 0) {
                  renderList.push(
                    <InlineBanner 
                      key={`inline-banner-slot-${position}`}
                      banners={activeBanners}
                    />
                  );
                }
              });

              // If there are less than 3 items but more than 0, and no banner has been added yet, add one at the end
              if (filteredRoomsList.length > 0 && filteredRoomsList.length < 3 && activeBanners.length > 0 && renderList.length === filteredRoomsList.length) {
                renderList.push(
                  <InlineBanner 
                    key="inline-banner-slot-end"
                    banners={activeBanners}
                  />
                );
              }
              
              return renderList;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

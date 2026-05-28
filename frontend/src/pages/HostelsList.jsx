import React, { useEffect, useState } from 'react';
import { Sparkles, Search, Inbox } from 'lucide-react';
import FiltersBar from '../components/FiltersBar';
import ListingCard from '../components/ListingCard';
import InlineBanner from '../components/InlineBanner';

export default function HostelsList({ 
  setPage, 
  setDetailId, 
  setDetailType,
  filters,
  setFilters,
  search,
  setSearch,
  initialFilters
}) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [closedSlots, setClosedSlots] = useState([]);

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
    async function fetchFilteredHostels() {
      try {
        setLoading(true);
        // Build query string
        const params = new URLSearchParams();
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.is_ac) params.append('is_ac', filters.is_ac);
        if (filters.price_min) params.append('price_min', filters.price_min);
        if (filters.price_max) params.append('price_max', filters.price_max);
        if (filters.beds_per_room) params.append('beds_per_room', filters.beds_per_room);
        if (filters.college) params.append('college', filters.college);

        const res = await fetch(`/api/hostels?${params.toString()}`);
        const data = await res.json();
        setHostels(data);
      } catch (error) {
        console.error('Error loading filtered hostels:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredHostels();
  }, [filters]);

  const handleSelectHostel = (id) => {
    setDetailId(id);
    setDetailType('hostel');
    setPage('detail');
  };

  // Local Search Filter
  const filteredHostelsList = hostels.filter(hostel => 
    hostel.hostel_name.toLowerCase().includes(search.toLowerCase()) ||
    (hostel.address && hostel.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="list-page-container animate-fade">
      {/* Filters Sidebar */}
      <FiltersBar 
        type="hostel"
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />

      {/* Main Listings Column */}
      <div className="grid-listings-wrapper">
        <div className="grid-listings-header">
          <div className="detail-title-col">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>Explore Student Hostels</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verified accommodations near SRKR college Bhimavaram</p>
          </div>

          {/* Listings Count */}
          <div className="grid-listings-count">
            Found <span className="grid-listings-count-num">{filteredHostelsList.length}</span> hostels
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <Search 
            size={18} 
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
          />
          <input 
            type="text" 
            placeholder="Search hostels by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.8rem', borderRadius: 'var(--radius-full)' }}
          />
        </div>

        {/* Grid List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Loading hostels...</span>
          </div>
        ) : filteredHostelsList.length === 0 ? (
          <div className="no-results">
            <Inbox size={48} className="no-results-icon" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Hostels Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 1.5rem auto' }}>
              We couldn't find any hostels matching your selected filters or search terms. Try adjusting your preferences.
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
              
              filteredHostelsList.forEach((hostel, index) => {
                renderList.push(
                  <ListingCard 
                    key={`hostel-${hostel.id}`}
                    item={hostel}
                    type="hostel"
                    onClick={() => handleSelectHostel(hostel.id)}
                  />
                );
                
                // Show banner after every 3rd card
                const position = index + 1;
                if (position % 3 === 0 && activeBanners.length > 0 && !closedSlots.includes(`slot-${position}`)) {
                  renderList.push(
                    <InlineBanner 
                      key={`inline-banner-slot-${position}`}
                      banners={activeBanners}
                      onClose={() => setClosedSlots(prev => [...prev, `slot-${position}`])}
                    />
                  );
                }
              });

              // If there are less than 3 items but more than 0, and no banner has been added yet, add one at the end
              if (filteredHostelsList.length > 0 && filteredHostelsList.length < 3 && activeBanners.length > 0 && renderList.length === filteredHostelsList.length && !closedSlots.includes('slot-end')) {
                renderList.push(
                  <InlineBanner 
                    key="inline-banner-slot-end"
                    banners={activeBanners}
                    onClose={() => setClosedSlots(prev => [...prev, 'slot-end'])}
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

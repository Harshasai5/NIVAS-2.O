import React, { useEffect, useState } from 'react';
import { Sparkles, Search, Inbox, Filter, ArrowUp } from 'lucide-react';
import FiltersBar from '../components/FiltersBar';
import ListingCard from '../components/ListingCard';
import InlineBanner from '../components/InlineBanner';
import { API_BASE_URL } from '../config';

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showGoTop, setShowGoTop] = useState(false);

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearch('');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowGoTop(true);
      } else {
        setShowGoTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        const res = await fetch(`${API_BASE_URL}/api/hostels?${params.toString()}`);
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
        isOpen={showMobileFilters}
        setIsOpen={setShowMobileFilters}
      />

      {/* Main Listings Column */}
      <div className="grid-listings-wrapper">
        <div className="grid-listings-header">
          <div className="detail-title-col">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>Hostels near SRKR Engg. college</h1>
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
              placeholder="Search hostels by name or address..."
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
            {filteredHostelsList.map((hostel) => (
              <ListingCard 
                key={`hostel-${hostel.id}`}
                item={hostel}
                type="hostel"
                onClick={() => handleSelectHostel(hostel.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Go to Top Arrow */}
      {showGoTop && (
        <button 
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '2.5rem',
            right: '2.5rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '3.2rem',
            height: '3.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
            zIndex: 1000,
            transition: 'all 0.25s ease-in-out',
            animation: 'fadeIn 0.2s'
          }}
          aria-label="Scroll to top"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)'; }}
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}

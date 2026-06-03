import React from 'react';
import { Filter, RotateCcw, X } from 'lucide-react';

export default function FiltersBar({ 
  type, // 'hostel' or 'room'
  filters, 
  setFilters, 
  resetFilters,
  isOpen,
  setIsOpen,
  priceBounds
}) {
  if (!isOpen) return null;

  const minPrice = priceBounds?.minPrice || 0;
  const maxPrice = priceBounds?.maxPrice || 10000;
  const currentPriceMax = filters.price_max !== '' ? parseFloat(filters.price_max) : maxPrice;

  const handleGenderChange = (genderVal) => {
    setFilters(prev => ({
      ...prev,
      gender: prev.gender === genderVal ? '' : genderVal
    }));
  };

  const handleAcChange = (acVal) => {
    setFilters(prev => ({
      ...prev,
      is_ac: prev.is_ac === acVal ? '' : acVal
    }));
  };

  const handlePriceSliderChange = (e) => {
    setFilters(prev => ({
      ...prev,
      price_min: minPrice.toString(),
      price_max: e.target.value
    }));
  };

  const handleDistanceChange = (e) => {
    setFilters(prev => ({
      ...prev,
      distance_max: e.target.value
    }));
  };

  const handleBedsChange = (bedsVal) => {
    setFilters(prev => ({
      ...prev,
      beds_per_room: prev.beds_per_room === bedsVal ? '' : bedsVal
    }));
  };

  const handleCollegeChange = (collegeVal) => {
    setFilters(prev => ({
      ...prev,
      college: prev.college === collegeVal ? '' : collegeVal
    }));
  };

  return (
    <div className="filter-modal-overlay" onClick={() => setIsOpen(false)}>
      <aside className="filter-modal-content glass" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filter-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <Filter size={18} style={{ color: 'var(--primary)' }} />
            <span>Filter Stays</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem', borderRadius: '50%' }}
            aria-label="Close Filters"
          >
            <X size={20} />
          </button>
        </div>

        <div className="filter-modal-body">
          {/* Gender Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Gender Accommodation</h4>
            <div className="filter-chips">
              <button 
                className={`filter-chip ${filters.gender === 'boys' ? 'active' : ''}`}
                onClick={() => handleGenderChange('boys')}
              >
                Boys
              </button>
              <button 
                className={`filter-chip ${filters.gender === 'girls' ? 'active' : ''}`}
                onClick={() => handleGenderChange('girls')}
              >
                Girls
              </button>
              {type === 'room' && (
                <button 
                  className={`filter-chip ${filters.gender === 'unisex' ? 'active' : ''}`}
                  onClick={() => handleGenderChange('unisex')}
                >
                  Unisex PG
                </button>
              )}
            </div>
          </div>

          {/* AC / Non-AC Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Room Condition</h4>
            <div className="filter-chips">
              <button 
                className={`filter-chip ${filters.is_ac === '1' ? 'active' : ''}`}
                onClick={() => handleAcChange('1')}
              >
                AC Rooms
              </button>
              <button 
                className={`filter-chip ${filters.is_ac === '0' ? 'active' : ''}`}
                onClick={() => handleAcChange('0')}
              >
                Non-AC Rooms
              </button>
            </div>
          </div>

          {/* Price Range Filter (Dynamic Range Bar) */}
          <div className="filter-section">
            <h4 className="filter-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Max Price Range</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                ₹{minPrice} - ₹{currentPriceMax}
              </span>
            </h4>
            <input 
              type="range" 
              min={minPrice} 
              max={maxPrice} 
              step="100"
              value={currentPriceMax}
              onChange={handlePriceSliderChange}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', margin: '0.5rem 0' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>₹{minPrice}</span>
              <span>₹{maxPrice}</span>
            </div>
          </div>

          {/* Beds per room Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Sharing Option</h4>
            <div className="filter-chips">
              {[1, 2, 3, 4, 5, 6].map((bedNum) => (
                <button 
                  key={bedNum}
                  className={`filter-chip ${filters.beds_per_room === bedNum.toString() ? 'active' : ''}`}
                  onClick={() => handleBedsChange(bedNum.toString())}
                >
                  {bedNum} Sharing
                </button>
              ))}
            </div>
          </div>

          {/* Hostel specific filters */}
          {type === 'hostel' && (
            <div className="filter-section">
              <h4 className="filter-title">Hostel Ownership</h4>
              <div className="filter-chips">
                <button 
                  className={`filter-chip ${filters.college === 'true' ? 'active' : ''}`}
                  onClick={() => handleCollegeChange('true')}
                >
                  College Affiliated
                </button>
                <button 
                  className={`filter-chip ${filters.college === 'false' ? 'active' : ''}`}
                  onClick={() => handleCollegeChange('false')}
                >
                  Private Hostels
                </button>
              </div>
            </div>
          )}

          {/* Room specific filters */}
          {type === 'room' && (
            <div className="filter-section">
              <h4 className="filter-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Max Distance</span>
                <span style={{ color: 'var(--primary)' }}>{filters.distance_max ? `${filters.distance_max} km` : 'Any'}</span>
              </h4>
              <input 
                type="range" 
                min="0.2" 
                max="5" 
                step="0.1"
                value={filters.distance_max || '5'}
                onChange={handleDistanceChange}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>0.2 km</span>
                <span>5.0 km</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Apply / Reset buttons */}
        <div className="filter-modal-footer" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <button 
            onClick={resetFilters}
            className="filter-reset-btn"
            style={{ 
              flex: 1, 
              padding: '0.65rem 1.25rem', 
              borderRadius: 'var(--radius-full)', 
              fontWeight: 600, 
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="filter-apply-btn"
            style={{ 
              flex: 1, 
              padding: '0.65rem 1.25rem', 
              borderRadius: 'var(--radius-full)', 
              fontWeight: 700, 
              cursor: 'pointer',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 12px var(--primary-glow)'
            }}
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </div>
  );
}

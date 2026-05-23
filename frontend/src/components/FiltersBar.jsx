import React from 'react';
import { Filter, RotateCcw, ShieldAlert } from 'lucide-react';

export default function FiltersBar({ 
  type, // 'hostel' or 'room'
  filters, 
  setFilters, 
  resetFilters 
}) {
  
  const handleGenderChange = (genderVal) => {
    setFilters(prev => ({
      ...prev,
      gender: prev.gender === genderVal ? '' : genderVal // Toggle filter
    }));
  };

  const handleAcChange = (acVal) => {
    setFilters(prev => ({
      ...prev,
      is_ac: prev.is_ac === acVal ? '' : acVal // Toggle: '' (all), '1' (AC), '0' (Non-AC)
    }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
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

  return (
    <aside className="filter-sidebar glass">
      <div className="filter-section" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <Filter size={18} style={{ color: 'var(--primary)' }} />
          <span>Filters</span>
        </div>
        <button 
          onClick={resetFilters}
          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

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

      {/* Price Range Filter */}
      <div className="filter-section">
        <h4 className="filter-title">Price Range (₹)</h4>
        <div className="price-range-inputs">
          <input 
            type="number" 
            name="price_min"
            value={filters.price_min}
            onChange={handlePriceChange}
            placeholder="Min" 
            className="price-input"
            min="0"
          />
          <span style={{ color: 'var(--text-secondary)' }}>to</span>
          <input 
            type="number" 
            name="price_max"
            value={filters.price_max}
            onChange={handlePriceChange}
            placeholder="Max" 
            className="price-input"
            min="0"
          />
        </div>
      </div>

      {/* Beds per room Filter (Common for both Hostels & Rooms) */}
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

      {/* Room specific filters */}
      {type === 'room' && (
        <>
          {/* Distance Filter */}
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
        </>
      )}
    </aside>
  );
}

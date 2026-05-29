import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Phone, Wind, UserCheck, CheckCircle2, AlertTriangle, MessageSquare, ChevronLeft, ChevronRight, X, Map } from 'lucide-react';

const GoogleMapsIcon = ({ size = 20 }) => (
  <svg 
    viewBox="0 0 32 32" 
    width={size} 
    height={size} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <path 
      d="M16 2C10.5 2 6 6.5 6 12c0 8.5 10 18 10 18s10-9.5 10-18c0-5.5-4.5-12-10-12z" 
      fill="#EA4335" 
    />
    <path 
      d="M16 30s10-9.5 10-18c0-2.3-0.8-4.4-2.1-6L16 16.5V30z" 
      fill="#4285F4" 
    />
    <path 
      d="M16 30V16.5L8.1 6C6.8 7.6 6 9.7 6 12c0 8.5 10 18 10 18z" 
      fill="#34A853" 
    />
    <path 
      d="M16 16.5l7.9-10.5C21.7 3.5 19 2 16 2s-5.7 1.5-7.9 4l7.9 10.5z" 
      fill="#FBBC05" 
    />
    <circle cx="16" cy="12" r="4.5" fill="#FFFFFF" />
    <circle cx="16" cy="12" r="2.5" fill="#4285F4" />
  </svg>
);

export default function DetailView({ id, type, setPage }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const endpoint = type === 'hostel' ? `/api/hostels/${id}` : `/api/rooms/${id}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Listing not found');
        const data = await res.json();
        setItem(data);
      } catch (error) {
        console.error('Error fetching detail:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchDetail();
      // Track specific hostel or room click counter
      fetch(`/api/${type}s/${id}/click`, { method: 'POST' })
        .catch(err => console.warn('Failed to track click:', err));
    }
  }, [id, type]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading details...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="detail-container animate-fade" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <AlertTriangle size={48} style={{ color: 'var(--girls-color)', marginBottom: '1rem' }} />
        <h2>Accommodation Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>The listing you are looking for has been removed or is temporarily unavailable.</p>
        <button className="nav-button" onClick={() => setPage('home')} style={{ margin: '0 auto' }}>
          Back to Home
        </button>
      </div>
    );
  }

  const name = type === 'hostel' ? item.hostel_name : item.room_name;
  const price = type === 'hostel' ? item.price_starting : item.price_per_person;
  const priceLabel = type === 'hostel' ? '/ month' : '/ person monthly';
  const isAc = item.is_ac === 1 || item.is_ac === true;
  const gender = item.gender;
  const beds = item.beds_per_room;
  const availableBeds = item.available_beds;
  const totalBeds = item.total_beds;
  const distance = type === 'room' ? item.distance_from_srkr : null;

  // Resolve Photos list
  const photos = item.photos && item.photos.length > 0 
    ? item.photos.map(p => `/${p.photo}`) 
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200&auto=format&fit=cover'];

  // Bed Fill calculation
  const filledBeds = type === 'room' 
    ? (item.filled_count || 0) 
    : (totalBeds - availableBeds > 0 ? totalBeds - availableBeds : 0);
  const totalCap = type === 'room' ? (item.total_beds || (filledBeds + availableBeds)) : totalBeds;
  const fillPercentage = totalCap > 0 ? (filledBeds / totalCap) * 100 : 0;

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  return (
    <div className="detail-container animate-fade">
      {/* Back navigation */}
      <div className="detail-nav-back" onClick={() => setPage(type === 'hostel' ? 'hostels' : 'rooms')}>
        <ArrowLeft size={16} />
        <span>Back to {type === 'hostel' ? 'Hostels' : 'Rooms & PGs'}</span>
      </div>

      {/* Header Info */}
      <div className="detail-header">
        <div className="detail-title-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="detail-name">{name}</h1>
            <span className={`card-gender-badge gender-${gender}`} style={{ position: 'static' }}>
              <UserCheck size={12} />
              <span>{gender === 'boys' ? 'Boys Only' : gender === 'girls' ? 'Girls Only' : 'Unisex PG'}</span>
            </span>
            {isAc && (
              <span className="card-ac-badge" style={{ position: 'static', background: 'var(--primary-glow)' }}>
                <Wind size={12} />
                <span>AC Accommodation</span>
              </span>
            )}
            {type === 'hostel' && (item.is_college_hostel === 1 || item.is_college_hostel === true) && (
              <span className="card-college-badge" style={{ position: 'static', background: 'rgba(99, 102, 241, 0.95)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                College Hostels
              </span>
            )}
          </div>
          
          <div className="detail-address-row">
            <GoogleMapsIcon size={18} />
            <span>{item.address || 'Near SRKR College, Bhimavaram'}</span>
            {distance !== null && (
              <span style={{ color: 'var(--unisex-color)', fontWeight: 700 }}>• {distance} km to SRKR Engineering College</span>
            )}
          </div>
        </div>

        <div className="detail-pricing-col">
          <div className="detail-price-box">
            <div className="beds-label" style={{ marginBottom: '0.2rem' }}>Starting Price</div>
            <div className="detail-price-amt">₹{Math.round(price)}</div>
            <div className="beds-label" style={{ marginTop: '0.2rem' }}>{priceLabel}</div>
          </div>
        </div>
      </div>

      {/* Interactive Gallery Layout */}
      {/* Asymmetric grid: large photo left, two stacked thumbnails right */}
      <div className="gallery-layout">
        <div className="gallery-main" onClick={() => openLightbox(0)}>
          <img src={photos[0]} alt="Primary View" className="gallery-img" />
        </div>
        
        <div className="gallery-thumb-grid">
          <div className="gallery-img-box" onClick={() => openLightbox(1 % photos.length)}>
            <img 
              src={photos[1 % photos.length]} 
              alt="Thumbnail 1" 
              className="gallery-img" 
              onError={(e) => { e.target.src = photos[0]; }}
            />
          </div>
          
          <div className="gallery-img-box" onClick={() => openLightbox(2 % photos.length)}>
            <img 
              src={photos[2 % photos.length]} 
              alt="Thumbnail 2" 
              className="gallery-img"
              onError={(e) => { e.target.src = photos[0]; }}
            />
            {photos.length > 3 && (
              <div className="gallery-more-overlay">
                <span>+{photos.length - 3}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', marginTop: '0.2rem' }}>More Photos</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Layout split into Main info and Sidebar Actions */}
      <div className="detail-content-layout">
        {/* Main Details */}
        <div className="detail-main-info">
          
          {/* Facilities */}
          <div className="detail-info-block">
            <h3 className="info-block-title">
              <CheckCircle2 size={20} style={{ color: 'var(--unisex-color)' }} />
              <span>Available Facilities</span>
            </h3>
            {item.facilities && item.facilities.length > 0 ? (
              <div className="detail-facilities-grid">
                {item.facilities.map((fac, idx) => (
                  <div key={idx} className="detail-facility-item">
                    <span style={{ width: '8px', height: '8px', background: 'var(--unisex-color)', borderRadius: '50%' }} />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Standard facilities included. Contact owner for details.</p>
            )}
          </div>

          {/* Rules */}
          <div className="detail-info-block">
            <h3 className="info-block-title">
              <AlertTriangle size={20} style={{ color: 'var(--girls-color)' }} />
              <span>Accommodation Rules</span>
            </h3>
            {item.rules && item.rules.length > 0 ? (
              <div className="detail-rules-list">
                {item.rules.map((rule, idx) => (
                  <div key={idx} className="detail-rule-item">
                    <div className="detail-rule-dot" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Standard student housing rules apply.</p>
            )}
          </div>

          {/* Location Block */}
          {item.google_maps_link && (
            <div className="detail-info-block">
              <h3 className="info-block-title">
                <GoogleMapsIcon size={24} />
                <span>Map Coordinates & Directions</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Located at **{item.address || 'SRKR college Bhimavaram Area' }**. Easily navigate using the link below.
              </p>
              <a 
                href={item.google_maps_link}
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn action-btn-secondary"
                style={{ width: 'fit-content', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderColor: '#4285F4', color: '#4285F4' }}
              >
                <GoogleMapsIcon size={18} />
                <span style={{ fontWeight: 700 }}>Open in Google Maps</span>
              </a>
            </div>
          )}
        </div>

        {/* Sidebar Actions Card */}
        <div className="detail-sidebar-actions">
          <div className="actions-card glass">
            
            {/* Beds capacity widget */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <span>Occupancy Status</span>
                <span>{availableBeds} / {totalCap} Available</span>
              </div>
              <div className="beds-bar-container">
                <div 
                  className="beds-bar-fill"
                  style={{ 
                    width: `${fillPercentage}%`,
                    background: fillPercentage > 85 ? 'var(--girls-color)' : 'var(--unisex-color)' 
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                <span>{filledBeds} Beds Filled</span>
                <span>{totalCap} Total Capacity</span>
              </div>
            </div>

            <div className="beds-status-widget">
              <div className="beds-label">Room Sharing</div>
              <div className="beds-value-row">
                <span className="beds-val-large">{beds}</span>
                <span className="beds-label" style={{ color: 'var(--text-secondary)' }}>bed sharing</span>
              </div>
            </div>

            <div className="action-buttons-group">
              <a 
                href={`tel:${item.phone}`}
                className="action-btn action-btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <Phone size={18} />
                <span>Call Owner ({item.phone})</span>
              </a>
              
              <a 
                href={`https://wa.me/91${item.phone}?text=Hello, I saw your accommodation listing "${name}" on Nivas Platform and I am interested in it.`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-btn-secondary"
                style={{ textDecoration: 'none', color: '#25D366', borderColor: '#25D366' }}
              >
                <MessageSquare size={18} />
                <span>WhatsApp Owner</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* --- SWIPEABLE LIGHTBOX CAROUSEL OVERLAY --- */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
            <X size={36} />
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={photos[lightboxIndex]} 
              alt={`Gallery Index ${lightboxIndex + 1}`} 
              className="lightbox-image" 
            />

            {photos.length > 1 && (
              <>
                <button className="lightbox-btn-prev" onClick={prevPhoto}>
                  <ChevronLeft size={24} />
                </button>
                <button className="lightbox-btn-next" onClick={nextPhoto}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <div style={{ position: 'absolute', bottom: '-2.5rem', color: 'white', fontWeight: 600 }}>
              Photo {lightboxIndex + 1} of {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

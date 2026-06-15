import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, MapPin, Wind, UserCheck, PhoneCall, Bookmark, Share2 } from 'lucide-react';

export default function ListingCard({ item, type, onClick, triggerLike, triggerShare }) {
  // Extract fields based on type
  const id = item.id;
  const name = type === 'hostel' ? item.hostel_name : item.room_name;
  const price = type === 'hostel' ? item.price_starting : item.price_per_person;
  const priceLabel = type === 'hostel' ? '/ yearly' : '/ person monthly';
  
  const isAc = item.is_ac === 1 || item.is_ac === true;
  const gender = item.gender; // boys, girls, unisex
  const beds = item.beds_per_room;
  const availableBeds = item.available_beds;
  const distance = type === 'room' ? item.distance_from_srkr : null;
  const isSponsored = type === 'hostel' && item.sponsor_order > 0;
  
  // Resolve primary photo
  const photoUrl = item.primary_photo 
    ? (item.primary_photo.startsWith('http') ? item.primary_photo : `/${item.primary_photo}`) 
    : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=600&auto=format&fit=cover';

  // Like stats state
  const [liked, setLiked] = useState(item.is_liked === 1 || item.is_liked === true);
  const [likesCount, setLikesCount] = useState(item.likes_count || 0);

  useEffect(() => {
    setLiked(item.is_liked === 1 || item.is_liked === true);
    setLikesCount(item.likes_count || 0);
  }, [item.is_liked, item.likes_count]);

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (triggerLike) {
      triggerLike(id, type, (newLiked, newCount) => {
        setLiked(newLiked);
        setLikesCount(newCount);
      });
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (triggerShare) {
      triggerShare(item, type);
    }
  };

  return (
    <article 
      className={`card-item glass animate-slide ${isSponsored ? 'sponsored' : ''}`}
      style={{ border: '1px solid var(--border)', cursor: 'pointer' }}
      onClick={onClick}
    >
      <div className="card-image-wrapper">
        <img 
          src={photoUrl} 
          alt={name} 
          className="card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=600&auto=format&fit=cover';
          }}
        />

        {/* Gender Badge */}
        <div className={`card-gender-badge gender-${gender}`}>
          <UserCheck size={12} />
          <span>{gender === 'boys' ? 'Boys' : gender === 'girls' ? 'Girls' : 'Unisex'}</span>
        </div>

        {/* AC Badge */}
        {isAc && (
          <div className="card-ac-badge">
            <Wind size={12} />
            <span>AC</span>
          </div>
        )}

        {/* Distance Badge */}
        {distance !== null && distance !== undefined && (
          <div className="card-distance-badge">
            <MapPin size={12} />
            <span>{distance} km to SRKR</span>
          </div>
        )}

        {/* College Affiliated Badge */}
        {type === 'hostel' && (item.is_college_hostel === 1 || item.is_college_hostel === true) && (
          <div className="card-college-badge" style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(99, 102, 241, 0.95)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', backdropFilter: 'blur(4px)', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span>College Hostels</span>
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="card-info-top">
          <h3 className="card-title" title={name}>{name}</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0.15rem 0 0.4rem 0' }}>
            <MapPin size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.address || 'Near College Campus'}
            </span>
          </div>
          
          {type === 'hostel' ? (
            <div className="card-hostel-info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              {/* Beds Left */}
              {availableBeds !== undefined && availableBeds !== null ? (
                <div 
                  className="card-avail-badge" 
                  style={{ 
                    background: availableBeds > 0 ? 'var(--unisex-color)' : 'var(--girls-color)', 
                    color: 'white', 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    boxShadow: 'var(--shadow-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    flexShrink: 0
                  }}
                >
                  <span className="avail-pulse-dot" style={{ 
                    display: 'inline-block', 
                    width: '5px', 
                    height: '5px', 
                    borderRadius: '50%', 
                    background: 'white', 
                    opacity: 0.9 
                  }} />
                  <span>{availableBeds > 0 ? `${availableBeds} Seats Left` : 'Filled'}</span>
                </div>
              ) : (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Status N/A</div>
              )}

              {/* Installments */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                {item.installments && item.installments > 0 
                  ? `${item.installments} Installments` 
                  : '1 Installment'}
              </div>
            </div>
          ) : (
            /* Normal pricing for Rooms */
            <div className="card-price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span className="card-price">₹{Math.round(price)}</span>
                <span className="card-price-label">{priceLabel}</span>
              </div>
              
              {availableBeds !== undefined && availableBeds !== null && (
                <div 
                  className="card-avail-badge" 
                  style={{ 
                    background: availableBeds > 0 ? 'var(--unisex-color)' : 'var(--girls-color)', 
                    color: 'white', 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    boxShadow: 'var(--shadow-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    flexShrink: 0
                  }}
                >
                  <span className="avail-pulse-dot" style={{ 
                    display: 'inline-block', 
                    width: '5px', 
                    height: '5px', 
                    borderRadius: '50%', 
                    background: 'white', 
                    opacity: 0.9 
                  }} />
                  <span>{availableBeds > 0 ? `${availableBeds} Seats Left` : 'Filled'}</span>
                </div>
              )}
            </div>
          )}

          <div className="card-facilities">
            {item.facilities && item.facilities.slice(0, 3).map((fac, idx) => (
              <span key={idx} className="facility-tag">{fac}</span>
            ))}
            {item.facilities && item.facilities.length > 3 && (
              <span className="facility-tag">+{item.facilities.length - 3} More</span>
            )}
          </div>
        </div>

        {/* Updated metadata row with Save & Share actions */}
        <div className="card-meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <div className="card-beds" style={{ fontSize: '0.78rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <span>{beds} sharing</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button 
              onClick={handleLikeClick}
              style={{
                background: 'transparent',
                border: 'none',
                color: liked ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.2rem',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={type === 'hostel' ? "Save Hostel" : "Save Room"}
            >
              <Bookmark size={16} fill={liked ? 'var(--primary)' : 'transparent'} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: liked ? 'var(--primary)' : 'var(--text-muted)' }}>{liked ? 'Saved' : 'Save'}</span>
            </button>

            <button 
              onClick={handleShareClick}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={type === 'hostel' ? "Share Hostel" : "Share Room"}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

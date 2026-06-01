import React from 'react';
import { Shield, Sparkles, MapPin, Wind, UserCheck, PhoneCall } from 'lucide-react';

export default function ListingCard({ item, type, onClick }) {
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
  // Serve via static uploads directory route proxied by vite
  const photoUrl = item.primary_photo 
    ? (item.primary_photo.startsWith('http') ? item.primary_photo : `/${item.primary_photo}`) 
    : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=600&auto=format&fit=cover';

  return (
    <article 
      className={`card-item glass animate-slide ${isSponsored ? 'sponsored' : ''}`}
      style={{ border: '1px solid var(--border)', cursor: 'pointer' }}
      onClick={onClick}
    >
      {isSponsored && (
        <div className="card-sponsor-badge">
          <Sparkles size={12} />
          <span>Featured</span>
        </div>
      )}

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
          
          <div className="card-price-row">
            <span className="card-price">₹{Math.round(price)}</span>
            <span className="card-price-label">{priceLabel}</span>
          </div>

          <div className="card-facilities">
            {item.facilities && item.facilities.slice(0, 3).map((fac, idx) => (
              <span key={idx} className="facility-tag">{fac}</span>
            ))}
            {item.facilities && item.facilities.length > 3 && (
              <span className="facility-tag">+{item.facilities.length - 3} More</span>
            )}
          </div>
        </div>

        <div className="card-meta-row" style={{ justifyContent: 'center', paddingTop: '0.75rem' }}>
          <div className="card-beds" style={{ fontSize: '0.8rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span>Beds: {beds} sharing | </span>
            <span className="card-beds-count" style={{ color: 'var(--unisex-color)', fontWeight: 700 }}>
              {availableBeds} Beds Available
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

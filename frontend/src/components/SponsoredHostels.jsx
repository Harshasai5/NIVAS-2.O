import React from 'react';
import { Sparkles } from 'lucide-react';
import ListingCard from './ListingCard';

export default function SponsoredHostels({ hostels, onSelectHostel }) {
  if (!hostels || hostels.length === 0) return null;

  // Split sponsored hostels into two rows for the mobile 2-row layout
  const row1 = hostels.filter((_, idx) => idx % 2 === 0);
  const row2 = hostels.filter((_, idx) => idx % 2 !== 0);

  return (
    <section style={{ margin: '2.5rem 0' }}>
      <div className="section-header">
        <h2 className="section-title">
          <span>Premium Sponsored Hostels</span>
        </h2>
        <div className="section-action" style={{ color: '#fbbf24' }}>
          <Sparkles size={16} style={{ fill: '#fbbf24' }} />
          <span>Verified Accommodations</span>
        </div>
      </div>

      {/* Mobile view: two rows of horizontal scrolling lists */}
      {/* Desktop view: a uniform responsive grid of sponsored items */}
      <div className="sponsored-rows-wrapper">
        {/* Row 1 */}
        <div className="scroll-container">
          {row1.map((hostel) => (
            <ListingCard 
              key={hostel.id} 
              item={hostel} 
              type="hostel" 
              onClick={() => onSelectHostel(hostel.id)} 
            />
          ))}
        </div>

        {/* Row 2 (renders only if we have enough sponsored hostels to distribute) */}
        {row2.length > 0 && (
          <div className="scroll-container" style={{ marginTop: '-0.5rem' }}>
            {row2.map((hostel) => (
              <ListingCard 
                key={hostel.id} 
                item={hostel} 
                type="hostel" 
                onClick={() => onSelectHostel(hostel.id)} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

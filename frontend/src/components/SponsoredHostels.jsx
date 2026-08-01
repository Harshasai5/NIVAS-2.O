import React, { useRef } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import ListingCard from './ListingCard';

export default function SponsoredHostels({ hostels, onSelectHostel, onViewAll, triggerLike, triggerShare }) {
  if (!hostels || hostels.length === 0) return null;

  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const isSyncingRow1 = useRef(false);
  const isSyncingRow2 = useRef(false);

  // Deterministically sync scroll positions between the two rows
  const handleScrollRow1 = () => {
    if (isSyncingRow1.current) {
      isSyncingRow1.current = false;
      return;
    }
    if (row1Ref.current && row2Ref.current) {
      isSyncingRow2.current = true;
      row2Ref.current.scrollLeft = row1Ref.current.scrollLeft;
    }
  };

  const handleScrollRow2 = () => {
    if (isSyncingRow2.current) {
      isSyncingRow2.current = false;
      return;
    }
    if (row1Ref.current && row2Ref.current) {
      isSyncingRow1.current = true;
      row1Ref.current.scrollLeft = row2Ref.current.scrollLeft;
    }
  };

  // Map sponsored hostels to fixed slots 1-8 based on sponsor_order
  const slots = Array(8).fill(null);
  hostels.forEach((hostel) => {
    const order = parseInt(hostel.sponsor_order);
    if (order >= 1 && order <= 8) {
      slots[order - 1] = hostel;
    }
  });

  const row1 = slots.slice(0, 4);
  const row2 = slots.slice(4, 8);

  return (
    <section style={{ margin: '2.5rem 0' }}>
      <div className="section-header">
        <h2 className="section-title">
          <span>Featured Hostels</span>
        </h2>
        {onViewAll && (
          <div className="section-action" onClick={onViewAll}>
            <span>View All</span>
            <ArrowRight size={16} />
          </div>
        )}
      </div>

      {/* Mobile & Desktop: two rows of horizontal scrolling lists moving in parallel */}
      <div className="sponsored-rows-wrapper">
        {/* Row 1 */}
        <div 
          className="scroll-container"
          ref={row1Ref}
          onScroll={handleScrollRow1}
        >
          {row1.map((hostel, index) => {
            if (hostel === null) {
              return (
                <div 
                  key={`placeholder-row1-${index}`}
                  className="card-item" 
                  style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    boxShadow: 'none', 
                    pointerEvents: 'none' 
                  }} 
                />
              );
            }
            return (
              <ListingCard 
                key={hostel.id} 
                item={hostel} 
                type="hostel" 
                onClick={() => onSelectHostel(hostel.id)} 
                triggerLike={triggerLike}
                triggerShare={triggerShare}
              />
            );
          })}
        </div>

        {/* Row 2 (renders only if we have at least one sponsored hostel in slots 5-8) */}
        {row2.some((h) => h !== null) && (
          <div 
            className="scroll-container" 
            ref={row2Ref}
            onScroll={handleScrollRow2}
            style={{ marginTop: '-0.5rem' }}
          >
            {row2.map((hostel, index) => {
              if (hostel === null) {
                return (
                  <div 
                    key={`placeholder-row2-${index}`}
                    className="card-item" 
                    style={{ 
                      border: 'none', 
                      background: 'transparent', 
                      boxShadow: 'none', 
                      pointerEvents: 'none' 
                    }} 
                  />
                );
              }
              return (
                <ListingCard 
                  key={hostel.id} 
                  item={hostel} 
                  type="hostel" 
                  onClick={() => onSelectHostel(hostel.id)} 
                  triggerLike={triggerLike}
                  triggerShare={triggerShare}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

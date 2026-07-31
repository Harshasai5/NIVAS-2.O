import React, { useRef } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import ListingCard from './ListingCard';

export default function SponsoredHostels({ hostels, onSelectHostel, onViewAll, triggerLike, triggerShare }) {
  if (!hostels || hostels.length === 0) return null;

  const row1Ref = useRef(null);
  const row2Ref = useRef(null);

  // Sync scroll positions between the two rows
  const handleScroll = (sourceRef, targetRef) => {
    if (sourceRef.current && targetRef.current) {
      const diff = Math.abs(targetRef.current.scrollLeft - sourceRef.current.scrollLeft);
      if (diff > 1) {
        targetRef.current.scrollLeft = sourceRef.current.scrollLeft;
      }
    }
  };

  // Split sponsored hostels sequentially:
  // Row 1 gets hostels 1, 2, 3, 4 (indices 0 to 3)
  // Row 2 gets hostels 5, 6, 7, 8 (indices 4 to 7)
  const row1 = hostels.slice(0, 4);
  const row2 = hostels.slice(4, 8);

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
          onScroll={() => handleScroll(row1Ref, row2Ref)}
        >
          {row1.map((hostel) => (
            <ListingCard 
              key={hostel.id} 
              item={hostel} 
              type="hostel" 
              onClick={() => onSelectHostel(hostel.id)} 
              triggerLike={triggerLike}
              triggerShare={triggerShare}
            />
          ))}
        </div>

        {/* Row 2 (renders only if we have enough sponsored hostels to distribute) */}
        {row2.length > 0 && (
          <div 
            className="scroll-container" 
            ref={row2Ref}
            onScroll={() => handleScroll(row2Ref, row1Ref)}
            style={{ marginTop: '-0.5rem' }}
          >
            {row2.map((hostel) => (
              <ListingCard 
                key={hostel.id} 
                item={hostel} 
                type="hostel" 
                onClick={() => onSelectHostel(hostel.id)} 
                triggerLike={triggerLike}
                triggerShare={triggerShare}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

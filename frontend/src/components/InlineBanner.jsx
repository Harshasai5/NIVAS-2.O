import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export default function InlineBanner({ banners }) {
  const [activeBanner, setActiveBanner] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  // Helper to pick a random banner
  const selectRandomBanner = React.useCallback(() => {
    if (!banners || banners.length === 0) return;
    const randomIndex = Math.floor(Math.random() * banners.length);
    setActiveBanner(banners[randomIndex]);
  }, [banners]);

  // Pick a random banner on mount
  useEffect(() => {
    selectRandomBanner();
  }, [banners, selectRandomBanner]);

  // Precise 180-second timer logic:
  // - When visible: rotates the ad to a new random one every 180s.
  // - When hidden (user clicked X): waits exactly 180s, then picks a new random ad and displays it again.
  useEffect(() => {
    if (!banners || banners.length === 0) return;

    let timerId;

    if (isVisible) {
      // If visible, rotate to a new random banner every 180 seconds
      const runTimer = () => {
        timerId = setTimeout(() => {
          selectRandomBanner();
          runTimer(); // schedule next rotation
        }, 180000); // 180 seconds
      };
      runTimer();
    } else {
      // If hidden (user clicked X), wait exactly 180 seconds, then pick a new random ad and show it
      timerId = setTimeout(() => {
        selectRandomBanner();
        setIsVisible(true);
      }, 180000); // 180 seconds
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [banners, isVisible, selectRandomBanner]);

  if (!banners || banners.length === 0 || !activeBanner || !isVisible) return null;

  const imageUrl = activeBanner.banner_image.startsWith('http') ? activeBanner.banner_image : `/${activeBanner.banner_image}`;

  return (
    <div className="inline-banner-wrapper animate-fade">
      <div className="inline-banner-card" style={{ position: 'relative', width: '100%', height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        
        {activeBanner.redirect_link && activeBanner.redirect_link !== '#' ? (
          <a 
            href={activeBanner.redirect_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-banner-slide-link"
            style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none' }}
          >
            <div 
              className="inline-banner-slide"
              style={{ 
                width: '100%',
                height: '100%',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="inline-banner-content-overlay">
                {activeBanner.title && <h3 className="inline-banner-title">{activeBanner.title}</h3>}
                <button className="inline-banner-action-btn">
                  <span>Learn More</span>
                  <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} />
                </button>
              </div>
            </div>
          </a>
        ) : (
          <div 
            className="inline-banner-slide"
            style={{ 
              width: '100%',
              height: '100%',
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="inline-banner-content-overlay">
              {activeBanner.title && <h3 className="inline-banner-title">{activeBanner.title}</h3>}
              <button className="inline-banner-action-btn" style={{ pointerEvents: 'none' }}>
                <span>Advertisement</span>
              </button>
            </div>
          </div>
        )}

        {/* Close button X */}
        <button 
          className="inline-banner-close-btn" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsVisible(false);
          }}
          title="Remove advertisement"
          aria-label="Close Ad"
        >
          <X size={16} />
        </button>

      </div>
    </div>
  );
}

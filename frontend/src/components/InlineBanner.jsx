import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function InlineBanner({ banners, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play banners
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="inline-banner-wrapper">
      <div className="inline-banner-card">
        {/* Banner Track */}
        <div 
          className="inline-banner-track"
          style={{ 
            display: 'flex',
            width: `${banners.length * 100}%`,
            height: '100%',
            transition: 'transform 0.5s ease-in-out',
            transform: `translateX(-${(activeIndex * 100) / banners.length}%)`
          }}
        >
          {banners.map((banner) => {
            const imageUrl = `/${banner.banner_image}`;
            return (
              <div 
                key={banner.id} 
                className="inline-banner-slide"
                style={{ 
                  width: `${100 / banners.length}%`,
                  height: '100%',
                  position: 'relative',
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {banner.redirect_link && banner.redirect_link !== '#' ? (
                  <a 
                    href={banner.redirect_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-banner-slide-link"
                    style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none' }}
                  >
                    <div className="inline-banner-content-overlay">
                      {banner.title && <h3 className="inline-banner-title">{banner.title}</h3>}
                      <span className="inline-banner-action-btn">Learn More</span>
                    </div>
                  </a>
                ) : (
                  <div className="inline-banner-content-overlay">
                    {banner.title && <h3 className="inline-banner-title">{banner.title}</h3>}
                    <span className="inline-banner-action-btn" style={{ pointerEvents: 'none' }}>Sponsored</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button className="inline-banner-nav-btn inline-banner-nav-prev" onClick={prevSlide} aria-label="Previous Ad">
              <ChevronLeft size={16} />
            </button>
            <button className="inline-banner-nav-btn inline-banner-nav-next" onClick={nextSlide} aria-label="Next Ad">
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Indicators Dots */}
        {banners.length > 1 && (
          <div className="inline-banner-dots">
            {banners.map((_, index) => (
              <button 
                key={index} 
                className={`inline-banner-dot ${activeIndex === index ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveIndex(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Close button */}
        <button 
          className="inline-banner-close-btn" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close Ad"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

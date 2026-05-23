import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function HeroBanner({ banners }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play banners
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return (
      <div className="hero-container">
        <div className="banner-slider glass" style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Sparkles size={36} className="animate-fade" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
            <h3>Discover Premium Stays Near SRKR</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Explore hostels and PGs with verified photos & amenities</p>
          </div>
        </div>
      </div>
    );
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="hero-container">
      <div className="banner-slider">
        {/* Banner Track */}
        <div 
          className="banner-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {banners.map((banner, index) => {
            const imageUrl = `/${banner.banner_image}`;
            return (
              <div 
                key={banner.id} 
                className="banner-slide"
                style={{ backgroundImage: `url(${imageUrl})` }}
              >
                <div className="banner-content">
                  <span className="banner-tag">
                    {index % 2 === 0 ? 'Featured Listing' : 'Premium Offer'}
                  </span>
                  <h1 className="banner-title">{banner.title || 'Nivas Accommodations'}</h1>
                  {banner.redirect_link && (
                    <a href={banner.redirect_link} className="banner-link">
                      <span>Explore Now</span>
                      <ChevronRight size={16} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons (Desktop only, hidden or simple on touch) */}
        {banners.length > 1 && (
          <>
            <button className="banner-btn-prev" onClick={prevSlide} aria-label="Previous Banner">
              <ChevronLeft size={20} />
            </button>
            <button className="banner-btn-next" onClick={nextSlide} aria-label="Next Banner">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Indicators Dots */}
        {banners.length > 1 && (
          <div className="banner-dots">
            {banners.map((_, index) => (
              <button 
                key={index} 
                className={`banner-dot ${activeIndex === index ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

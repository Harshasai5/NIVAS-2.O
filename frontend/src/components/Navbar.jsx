import React, { useState } from 'react';
import { Home, Hotel, Key, ShieldAlert, Sparkles, Menu, X } from 'lucide-react';

export default function Navbar({ activePage, setPage, adminToken, logoutAdmin }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigateTo = (pageName) => {
    setPage(pageName);
    setIsMobileOpen(false); // Auto close mobile dropdown on select
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsMobileOpen(false);
  };

  return (
    <>
      <header className="navbar glass">
        <div className="nav-logo" onClick={() => navigateTo('home')} style={{ cursor: 'pointer' }}>
          <Sparkles size={24} style={{ fill: 'currentColor' }} />
          <span>Nivas</span>
        </div>

        {/* Desktop Links */}
        <nav className="nav-links">
          <div 
            className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => navigateTo('home')}
          >
            <Home size={18} />
            <span>Home</span>
          </div>

          <div 
            className={`nav-item ${activePage === 'hostels' ? 'active' : ''}`}
            onClick={() => navigateTo('hostels')}
          >
            <Hotel size={18} />
            <span>Hostels</span>
          </div>

          <div 
            className={`nav-item ${activePage === 'rooms' ? 'active' : ''}`}
            onClick={() => navigateTo('rooms')}
          >
            <Key size={18} />
            <span>PG & Rooms</span>
          </div>

          {adminToken ? (
            <>
              <div 
                className={`nav-item ${activePage === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => navigateTo('admin-dashboard')}
              >
                <ShieldAlert size={18} />
                <span>Admin Panel</span>
              </div>
              <button className="nav-button" onClick={handleLogout} style={{ background: 'var(--girls-color)', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.25)' }}>
                Logout
              </button>
            </>
          ) : null}
        </nav>

        {/* Mobile Toggle Button */}
        <button 
          className="nav-mobile-toggle" 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </header>

      {/* Mobile Slide-Down Dropdown Menu */}
      <nav className={`mobile-nav-menu glass ${isMobileOpen ? 'open' : ''}`}>
        <div 
          className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
          onClick={() => navigateTo('home')}
        >
          <Home size={18} />
          <span>Home</span>
        </div>

        <div 
          className={`nav-item ${activePage === 'hostels' ? 'active' : ''}`}
          onClick={() => navigateTo('hostels')}
        >
          <Hotel size={18} />
          <span>Hostels</span>
        </div>

        <div 
          className={`nav-item ${activePage === 'rooms' ? 'active' : ''}`}
          onClick={() => navigateTo('rooms')}
        >
          <Key size={18} />
          <span>PG & Rooms</span>
        </div>

        {adminToken ? (
          <>
            <div 
              className={`nav-item ${activePage === 'admin-dashboard' ? 'active' : ''}`}
              onClick={() => navigateTo('admin-dashboard')}
            >
              <ShieldAlert size={18} />
              <span>Admin Panel</span>
            </div>
            <button 
              className="nav-button" 
              onClick={handleLogout} 
              style={{ width: '100%', justifyContent: 'center', background: 'var(--girls-color)', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.25)' }}
            >
              Logout
            </button>
          </>
        ) : null}
      </nav>
    </>
  );
}

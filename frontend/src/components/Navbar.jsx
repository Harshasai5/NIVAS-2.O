import React, { useState, useEffect } from 'react';
import { Home, Hotel, Key, ShieldAlert, Sparkles, Menu, X, User, LogOut, LogIn, Heart } from 'lucide-react';
import logoImg from '../assets/logo.jpeg';

export default function Navbar({ activePage, setPage, adminToken, logoutAdmin, userEmail, userUsername, logoutUser, openLoginModal }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleOutsideClick = () => setIsProfileOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isProfileOpen]);

  const navigateTo = (pageName) => {
    setPage(pageName);
    setIsMobileOpen(false); // Auto close mobile dropdown on select
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsMobileOpen(false);
  };

  const handleUserLogout = () => {
    logoutUser();
    setIsMobileOpen(false);
  };

  return (
    <>
      <header className="navbar glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        {/* Left Section: Logo */}
        <div className="nav-logo" onClick={() => navigateTo('home')} style={{ cursor: 'pointer', zIndex: 10 }}>
          <img src={logoImg} alt="NIVAS" className="nav-logo-img" />
        </div>

        {/* Center Section: Navigation Links (centered on desktop, hidden on mobile) */}
        <nav className="nav-center-links">
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

          {userEmail && (
            <div 
              className={`nav-item ${activePage === 'likes' ? 'active' : ''}`}
              onClick={() => navigateTo('likes')}
            >
              <Heart size={18} fill={activePage === 'likes' ? 'var(--primary)' : 'transparent'} />
              <span>Liked</span>
            </div>
          )}
        </nav>

        {/* Right Section: Auth & Admin Indicator */}
        <div className="nav-desktop-only" style={{ gap: '1rem', zIndex: 10 }}>
          {/* Admin Indicator */}
          {adminToken && (
            <div 
              className={`nav-item ${activePage === 'admin-dashboard' ? 'active' : ''}`}
              onClick={() => navigateTo('admin-dashboard')}
              style={{ color: '#f59e0b' }}
            >
              <ShieldAlert size={18} />
              <span>Admin</span>
            </div>
          )}

          {/* User Auth Section */}
          {userEmail ? (
            <div style={{ position: 'relative' }}>
              {/* Profile Circle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileOpen(!isProfileOpen);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="User Profile"
              >
                {(userUsername || userEmail)[0].toUpperCase()}
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '45px',
                    right: 0,
                    width: '200px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid var(--border)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    zIndex: 9999,
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged in as</div>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.15rem' }} title={userUsername || userEmail}>
                      {userUsername || userEmail.split('@')[0]}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      handleUserLogout();
                      setIsProfileOpen(false);
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => openLoginModal('login')}
              className="nav-button"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '0.45rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <LogIn size={14} />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Toggle & Direct Actions Container */}
        <div className="nav-mobile-only" style={{ display: 'none', alignItems: 'center', gap: '0.75rem', zIndex: 10 }}>
          {/* Mobile direct user button if logged out */}
          {!userEmail && (
            <button 
              onClick={() => openLoginModal('login')}
              className="nav-button nav-mobile-only"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.35rem 0.75rem',
                display: 'none'
              }}
            >
              Login
            </button>
          )}

          {/* Mobile direct user profile if logged in */}
          {userEmail && (
            <div className="nav-mobile-only" style={{ display: 'none', position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileOpen(!isProfileOpen);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                {(userUsername || userEmail)[0].toUpperCase()}
              </button>

              {/* Mobile Profile Dropdown */}
              {isProfileOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '180px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid var(--border)',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    zIndex: 9999,
                  }}
                >
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Logged in as</div>
                    <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {userUsername || userEmail.split('@')[0]}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setPage('likes');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Heart size={12} fill={activePage === 'likes' ? 'var(--primary)' : 'transparent'} />
                    <span>Liked</span>
                  </button>
                  <button 
                    onClick={() => {
                      handleUserLogout();
                      setIsProfileOpen(false);
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <LogOut size={12} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button 
            className="nav-mobile-toggle" 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
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

        {/* Mobile User Auth Section */}
        {userEmail ? (
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'white', fontSize: '0.88rem', fontWeight: 600 }}>
                <User size={16} style={{ color: 'var(--primary)' }} />
                <span>{userUsername || userEmail.split('@')[0]}</span>
              </div>
              <button 
                onClick={handleUserLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: 'none',
                  color: '#f87171',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
            <button 
              onClick={() => { openLoginModal(); setIsMobileOpen(false); }}
              className="nav-button"
              style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}
            >
              <LogIn size={16} style={{ marginRight: '0.35rem' }} />
              <span>Sign In / Login</span>
            </button>
          </div>
        )}
      </nav>
      <style>{`
        .nav-center-links {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 2rem;
          z-index: 5;
        }
        .nav-desktop-only {
          display: flex;
          align-items: center;
        }
        .nav-mobile-only {
          display: none !important;
        }
        @media (max-width: 768px) {
          .nav-center-links {
            display: none !important;
          }
          .nav-desktop-only {
            display: none !important;
          }
          .nav-mobile-only {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}

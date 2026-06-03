import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import HostelsList from './pages/HostelsList';
import RoomsList from './pages/RoomsList';
import DetailView from './pages/DetailView';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import { API_BASE_URL } from './config';

export default function App() {
  const [page, setPage] = useState('home');
  const [detailId, setDetailId] = useState(null);
  const [detailType, setDetailType] = useState('hostel'); // 'hostel' or 'room'
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);

  // Global filters/search states so they stay alive across detail routing navigations
  const initialHostelFilters = {
    gender: '',
    is_ac: '',
    price_min: '',
    price_max: '',
    beds_per_room: '',
    college: '',
  };
  const [hostelFilters, setHostelFilters] = useState(initialHostelFilters);
  const [hostelSearch, setHostelSearch] = useState('');

  const initialRoomFilters = {
    gender: '',
    is_ac: '',
    price_min: '',
    price_max: '',
    distance_max: '',
    beds_per_room: '',
  };
  const [roomFilters, setRoomFilters] = useState(initialRoomFilters);
  const [roomSearch, setRoomSearch] = useState('');
  const [inBetweenBanners, setInBetweenBanners] = useState([]);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/banners`);
        const data = await res.json();
        const bannersList = Array.isArray(data) ? data : [];
        setInBetweenBanners(bannersList.filter(b => b.in_between === 1 || b.in_between === true));
      } catch (err) {
        console.error('Failed to fetch pop-up banners:', err);
      }
    }
    fetchBanners();
  }, []);

  // Pathname routing helper
  const navigateTo = (path, pageName) => {
    const formattedPath = path.startsWith('/NIVAS-2.O') ? path : `/NIVAS-2.O${path}`;
    window.history.pushState(null, '', formattedPath);
    setPage(pageName);
  };

  // Monitor location changes (including backward/forward arrows)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/NIVAS-2.O/kalix-nivas-login' || path === '/kalix-nivas-login') {
        setPage('kalix-nivas-login');
      } else if (path === '/NIVAS-2.O/admin-register' || path === '/admin-register') {
        setPage('admin-register');
      } else if (path === '/NIVAS-2.O/admin-dashboard' || path === '/admin-dashboard') {
        setPage('admin-dashboard');
      } else if (path === '/NIVAS-2.O/hostels' || path === '/hostels') {
        setPage('hostels');
      } else if (path === '/NIVAS-2.O/rooms' || path === '/rooms') {
        setPage('rooms');
      } else if (path === '/NIVAS-2.O/detail' || path === '/detail') {
        setPage('detail');
      } else {
        setPage('home');
        // If they visit direct domain root, keep path showing /NIVAS-2.O/home cleanly
        if (
          window.location.pathname === '/' || 
          window.location.pathname === '' || 
          window.location.pathname === '/NIVAS-2.O' || 
          window.location.pathname === '/NIVAS-2.O/' ||
          window.location.pathname === '/home' ||
          window.location.pathname === '/NIVAS-2.O/home'
        ) {
          window.history.replaceState(null, '', '/NIVAS-2.O/home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Trigger on startup to parse URL directly
    handlePopState();

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Validate admin token on startup
  useEffect(() => {
    async function verifySession() {
      if (!adminToken) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/verify`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (!res.ok) {
          throw new Error('Session expired');
        }
      } catch (error) {
        console.warn('🛡️ Admin session verification failed. Logging out.');
        logoutAdmin();
      }
    }

    verifySession();
  }, [adminToken]);

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setAdminToken(null);
    navigateTo('/home', 'home');
  };

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Dynamic Header Navbar */}
      <Navbar 
        activePage={page} 
        setPage={(pageName) => {
          let path = '/home';
          if (pageName === 'hostels') path = '/hostels';
          else if (pageName === 'rooms') path = '/rooms';
          else if (pageName === 'admin-dashboard') path = '/admin-dashboard';
          navigateTo(path, pageName);
        }} 
        adminToken={adminToken}
        logoutAdmin={logoutAdmin}
      />

      {/* Pages switcher wrapper */}
      <main style={{ flexGrow: 1 }}>
        {page === 'home' && (
          <Home 
            setPage={(pageName) => {
              let path = '/home';
              if (pageName === 'hostels') path = '/hostels';
              else if (pageName === 'rooms') path = '/rooms';
              navigateTo(path, pageName);
            }} 
            setDetailId={setDetailId} 
            setDetailType={setDetailType} 
            setHostelFilters={setHostelFilters}
            initialHostelFilters={initialHostelFilters}
          />
        )}
        
        {page === 'hostels' && (
          <HostelsList 
            setPage={(pageName) => navigateTo(`/${pageName}`, pageName)} 
            setDetailId={setDetailId} 
            setDetailType={setDetailType} 
            filters={hostelFilters}
            setFilters={setHostelFilters}
            search={hostelSearch}
            setSearch={setHostelSearch}
            initialFilters={initialHostelFilters}
          />
        )}
        
        {page === 'rooms' && (
          <RoomsList 
            setPage={(pageName) => navigateTo(`/${pageName}`, pageName)} 
            setDetailId={setDetailId} 
            setDetailType={setDetailType} 
            filters={roomFilters}
            setFilters={setRoomFilters}
            search={roomSearch}
            setSearch={setRoomSearch}
            initialFilters={initialRoomFilters}
          />
        )}

        {page === 'detail' && (
          <DetailView 
            id={detailId} 
            type={detailType} 
            setPage={(pageName) => navigateTo(`/${pageName}`, pageName)} 
          />
        )}

        {page === 'kalix-nivas-login' && (
          <AdminLogin 
            setAdminToken={setAdminToken}
            setPage={(pageName) => navigateTo(`/${pageName}`, pageName)}
          />
        )}

        {page === 'admin-register' && (
          <AdminRegister 
            navigateTo={(path, pageName) => navigateTo(path, pageName)}
          />
        )}

        {page === 'admin-dashboard' && (
          adminToken ? (
            <AdminDashboard 
              token={adminToken}
              logoutAdmin={logoutAdmin}
              setPage={(pageName) => navigateTo(`/${pageName}`, pageName)}
              navigateTo={(path, pageName) => navigateTo(path, pageName)}
            />
          ) : (
            <AdminLogin 
              setAdminToken={setAdminToken}
              setPage={(pageName) => navigateTo(`/${pageName}`, pageName)}
            />
          )
        )}
      </main>

      {/* Clean elegant footer */}
      <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '2rem 5%', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 'auto' }}>
        <p>© 2026 Nivas Accommodations. developed by KaliX technologies</p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>- SRKR Students.</p>
      </footer>

      {/* Global ad pop-up overlay (no ads on admin pages) */}
      {page !== 'kalix-nivas-login' && page !== 'admin-register' && page !== 'admin-dashboard' && (
        <AdPopup banners={inBetweenBanners} />
      )}
    </div>
  );
}

// Global, beautiful, premium, closeable 3-minute ad pop-up modal component
function AdPopup({ banners }) {
  const [activeBanner, setActiveBanner] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectRandomBanner = React.useCallback(() => {
    if (!banners || banners.length === 0) return;
    const randomIndex = Math.floor(Math.random() * banners.length);
    setActiveBanner(banners[randomIndex]);
  }, [banners]);

  useEffect(() => {
    if (!banners || banners.length === 0) return;

    selectRandomBanner();

    // 180 seconds interval = 3 minutes
    const intervalId = setInterval(() => {
      selectRandomBanner();
      setIsOpen(true);
    }, 180000);

    // Initial load pop-up: show after 4 seconds for elegant entry transition
    const initialTimeoutId = setTimeout(() => {
      setIsOpen(true);
    }, 4000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(initialTimeoutId);
    };
  }, [banners, selectRandomBanner]);

  if (!activeBanner || !isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.75)', // sleek slate/dark-mode backdrop
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999, // cover everything
      animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      padding: '1.5rem'
    }}>
      <div className="glass" style={{
        position: 'relative',
        width: '100%',
        maxWidth: isMobile ? '100%' : '800px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        background: 'rgba(30, 41, 59, 0.85)', // beautiful dark aesthetic
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Close Button X */}
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            borderRadius: '50%',
            width: '2.2rem',
            height: '2.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 100,
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.95)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)'; e.currentTarget.style.transform = 'scale(1)'; }}
          title="Close Offer"
          aria-label="Close Advertisement"
        >
          <X size={16} />
        </button>

        <a 
          href={activeBanner.redirect_link || '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ display: 'block', width: '100%', textDecoration: 'none' }}
          onClick={() => setIsOpen(false)}
        >
          <div style={{ position: 'relative', width: '100%', aspectRatio: isMobile ? '4 / 3' : '1600 / 750', minHeight: isMobile ? '260px' : 'auto', maxHeight: '350px', overflow: 'hidden' }}>
            <img 
              src={activeBanner.banner_image.startsWith('http') ? activeBanner.banner_image : `/${activeBanner.banner_image}`} 
              alt={activeBanner.title || 'Advertisement'} 
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease-out' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=600&auto=format&fit=cover'; }}
            />
            {/* Deep elegant gradient overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: '2.5rem 1.5rem 1.5rem 1.5rem',
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0) 100%)',
              color: 'white'
            }}>
              <span className="card-sponsor-badge" style={{ position: 'static', marginBottom: '0.6rem', display: 'inline-flex', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)', border: 'none' }}>
                <Sparkles size={11} />
                <span style={{ marginLeft: '0.3rem', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Featured Offer</span>
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0 0.8rem 0', fontFamily: 'var(--font-display)', lineHeight: '1.3', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{activeBanner.title || 'Nivas Accommodations'}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 700, transition: 'all 0.2s' }}>
                <span>Learn More & Explore</span>
                <ArrowRight size={15} />
              </div>
            </div>
          </div>
        </a>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

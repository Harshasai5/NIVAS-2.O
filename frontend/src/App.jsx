import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Check, Info } from 'lucide-react';
import Navbar from './components/Navbar';

const LinkedinIcon = ({ size = 16, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import deepakImg from './assets/deepak.png';
import revanthImg from './assets/revanth.png';
import harshaImg from './assets/harsha.jpg';
import sudarsanImg from './assets/sudarsan.png';
import Home from './pages/Home';
import RoomsList from './pages/RoomsList';
import HostelsList from './pages/HostelsList';
import DetailView from './pages/DetailView';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import AuthModal from './components/AuthModal';
import ShareModal from './components/ShareModal';
import LikedPage from './pages/LikedPage';
import { API_BASE_URL } from './config';

export default function App() {
  const [page, setPage] = useState('home');
  const [detailId, setDetailId] = useState(null);
  const [detailType, setDetailType] = useState('hostel'); // 'hostel' or 'room'
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);
  
  // User Authentication states
  const [userToken, setUserToken] = useState(localStorage.getItem('userToken') || null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || null);
  const [userUsername, setUserUsername] = useState(localStorage.getItem('userUsername') || null);

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' or 'register'
  const [authSuccessCallback, setAuthSuccessCallback] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareHostel, setShareHostel] = useState(null);

  // Global filters/search states
  const [selectedCollege, setSelectedCollege] = useState('SRKR Engineering');

  const initialHostelFilters = {
    gender: '',
    is_ac: '',
    price_min: '',
    price_max: '',
    beds_per_room: '',
    college: '',
    associated_college: 'SRKR Engineering',
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
    associated_college: 'SRKR Engineering',
  };
  const [roomFilters, setRoomFilters] = useState(initialRoomFilters);
  const [roomSearch, setRoomSearch] = useState('');
  const [inBetweenBanners, setInBetweenBanners] = useState([]);

  useEffect(() => {
    setHostelFilters(prev => ({ ...prev, associated_college: selectedCollege }));
    setRoomFilters(prev => ({ ...prev, associated_college: selectedCollege }));
  }, [selectedCollege]);

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
  const navigateTo = (path, pageName, queryParams = '') => {
    const formattedPath = path.startsWith('/NIVAS-2.O') ? path : `/NIVAS-2.O${path}`;
    const fullPath = formattedPath + queryParams;
    window.history.pushState(null, '', fullPath);
    setPage(pageName);
  };

  // Monitor location changes
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const urlId = searchParams.get('id');
      const urlType = searchParams.get('type');

      if (urlId) {
        setDetailId(parseInt(urlId));
      }
      if (urlType) {
        setDetailType(urlType);
      }

      if (path === '/NIVAS-2.O/kalix-nivas-login' || path === '/kalix-nivas-login') {
        setPage('kalix-nivas-login');
      } else if (path === '/NIVAS-2.O/admin-register' || path === '/admin-register') {
        setPage('admin-register');
      } else if (path === '/NIVAS-2.O/admin-dashboard' || path === '/admin-dashboard') {
        setPage('admin-dashboard');
      } else if (path === '/NIVAS-2.O/login' || path === '/login') {
        setPage('home');
        setAuthModalOpen(true);
        setAuthModalTab('login');
        window.history.replaceState(null, '', '/NIVAS-2.O/home');
      } else if (path === '/NIVAS-2.O/register' || path === '/register') {
        setPage('home');
        setAuthModalOpen(true);
        setAuthModalTab('register');
        window.history.replaceState(null, '', '/NIVAS-2.O/home');
      } else if (path === '/NIVAS-2.O/hostels' || path === '/hostels') {
        setPage('hostels');
      } else if (path === '/NIVAS-2.O/rooms' || path === '/rooms') {
        setPage('rooms');
      } else if (path === '/NIVAS-2.O/likes' || path === '/likes') {
        setPage('likes');
      } else if (path === '/NIVAS-2.O/detail' || path === '/detail') {
        setPage('detail');
      } else {
        setPage('home');
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
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Validate admin session
  useEffect(() => {
    async function verifySession() {
      if (!adminToken) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/verify`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!res.ok) throw new Error('Session expired');
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

  const logoutUser = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userUsername');
    setUserToken(null);
    setUserEmail(null);
    setUserUsername(null);
    // Reload current page components to refresh likes counts
    const currentPage = page;
    setPage('');
    setTimeout(() => setPage(currentPage), 10);
  };

  const openDetail = (id, type) => {
    setDetailId(id);
    setDetailType(type);
    navigateTo('/detail', 'detail', `?id=${id}&type=${type}`);
  };

  // Auth Trigger Actions
  const triggerLike = (itemId, type = 'hostel', callback) => {
    if (!userToken) {
      setAuthSuccessCallback(() => () => {
        // Retry execution with fresh token
        const freshToken = localStorage.getItem('userToken');
        executeLike(itemId, type, freshToken, callback);
      });
      setAuthModalOpen(true);
    } else {
      executeLike(itemId, type, userToken, callback);
    }
  };

  const executeLike = async (itemId, type, token, callback) => {
    try {
      const pathType = type === 'room' ? 'rooms' : 'hostels';
      const res = await fetch(`${API_BASE_URL}/api/${pathType}/${itemId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && callback) {
        callback(data.liked, data.likes_count);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const logShareToBackend = async (itemId, type) => {
    try {
      const pathType = type === 'room' ? 'rooms' : 'hostels';
      const token = localStorage.getItem('userToken');
      if (!token) return;
      await fetch(`${API_BASE_URL}/api/${pathType}/${itemId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Error logging share:', err);
    }
  };

  const triggerShare = (item, type = 'hostel') => {
    const itemWithType = { ...item, type };
    if (!userToken) {
      setAuthSuccessCallback(() => () => {
        setShareHostel(itemWithType);
        setShareModalOpen(true);
        logShareToBackend(item.id, type);
      });
      setAuthModalOpen(true);
    } else {
      setShareHostel(itemWithType);
      setShareModalOpen(true);
      logShareToBackend(item.id, type);
    }
  };

  const handleLoginSuccess = (token, email, username) => {
    setUserToken(token);
    setUserEmail(email);
    setUserUsername(username);
    if (authSuccessCallback) {
      authSuccessCallback();
      setAuthSuccessCallback(null);
    }
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
          else if (pageName === 'likes') path = '/likes';
          else if (pageName === 'admin-dashboard') path = '/admin-dashboard';
          navigateTo(path, pageName);
        }} 
        adminToken={adminToken}
        logoutAdmin={logoutAdmin}
        userEmail={userEmail}
        userUsername={userUsername}
        logoutUser={logoutUser}
        openLoginModal={(tab = 'login') => {
          setAuthModalOpen(true);
          setAuthModalTab(tab);
        }}
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
            openDetail={openDetail}
            setHostelFilters={setHostelFilters}
            initialHostelFilters={initialHostelFilters}
            userToken={userToken}
            triggerLike={triggerLike}
            triggerShare={triggerShare}
            selectedCollege={selectedCollege}
            setSelectedCollege={setSelectedCollege}
          />
        )}
        
        {page === 'hostels' && (
          <HostelsList 
            setPage={(pageName) => navigateTo(`/${pageName}`, pageName)} 
            openDetail={openDetail}
            filters={hostelFilters}
            setFilters={setHostelFilters}
            search={hostelSearch}
            setSearch={setHostelSearch}
            initialFilters={initialHostelFilters}
            userToken={userToken}
            triggerLike={triggerLike}
            triggerShare={triggerShare}
            selectedCollege={selectedCollege}
            setSelectedCollege={setSelectedCollege}
          />
        )}
        
        {page === 'rooms' && (
          <RoomsList 
            setPage={(pageName) => navigateTo(`/${pageName}`, pageName)} 
            openDetail={openDetail}
            filters={roomFilters}
            setFilters={setRoomFilters}
            search={roomSearch}
            setSearch={setRoomSearch}
            initialFilters={initialRoomFilters}
            userToken={userToken}
            triggerLike={triggerLike}
            triggerShare={triggerShare}
            selectedCollege={selectedCollege}
            setSelectedCollege={setSelectedCollege}
          />
        )}

        {page === 'detail' && (
          <DetailView 
            id={detailId} 
            type={detailType} 
            setPage={(pageName) => navigateTo(`/${pageName}`, pageName)} 
            userToken={userToken}
            triggerLike={triggerLike}
            triggerShare={triggerShare}
          />
        )}

        {page === 'likes' && (
          <LikedPage 
            setPage={(pageName) => {
              let path = '/home';
              if (pageName === 'hostels') path = '/hostels';
              else if (pageName === 'rooms') path = '/rooms';
              navigateTo(path, pageName);
            }}
            openDetail={openDetail}
            userToken={userToken}
            triggerLike={triggerLike}
            triggerShare={triggerShare}
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

        {/* Auth routes handled via popup modal */}
      </main>

      {/* Clean elegant footer */}
      <footer style={{ 
        background: 'var(--bg-card)', 
        borderTop: '1px solid var(--border)', 
        padding: '3rem 5%', 
        color: 'var(--text-secondary)', 
        fontSize: '0.85rem', 
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>
        {/* Footer Top Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Meet the Team</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The developers and designers behind Nivas Accommodations</p>
        </div>

        {/* Team Scroll Container */}
        <div 
          className="scroll-container" 
          style={{ 
            width: '100%', 
            maxWidth: '1200px', 
            margin: '0 auto',
            padding: '1rem 0.5rem',
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto'
          }}
        >
          {[
            {
              name: "Pabolu Sai Harsha",
              initials: "PH",
              image: harshaImg,
              role: "Ideate, Research & Development",
              linkedin: "https://www.linkedin.com/in/sai-harsha-pabolu-84b361310"
            },
            {
              name: "Madabhushi Sri Ranga Sudarsan",
              initials: "MS",
              image: sudarsanImg,
              role: "Software Development & Data Collection",
              linkedin: "https://www.linkedin.com/in/sudarsan-madabhushi-448994351?utm_source=share_via&utm_content=profile&utm_medium=member_android"
            },
            {
              name: "Boddeti Devi Naga Venkata Sai Deepak",
              initials: "BD",
              image: deepakImg,
              role: "UI/UX Designer & Software Developer",
              linkedin: "https://www.linkedin.com/in/deepakboddeti/"
            },
            {
              name: "Karri Revanth Ratan Reddy",
              initials: "KR",
              image: revanthImg,
              role: "Technical Support & Data Structuring",
              linkedin: "https://www.linkedin.com/in/revanth-ratan-reddy-karri-139aab2a4"
            }
          ].map((member, idx) => (
            <div 
              key={idx} 
              className="glass" 
              style={{ 
                minWidth: '260px', 
                maxWidth: '280px', 
                padding: '1.75rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border)',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease-in-out',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Circular Profile Avatar Image or Initials */}
              {member.image ? (
                <img 
                  src={member.image} 
                  alt={member.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.25)',
                    marginBottom: '0.25rem'
                  }}
                />
              ) : (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--unisex-color))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  marginBottom: '0.25rem'
                }}>
                  {member.initials}
                </div>
              )}

              <h4 style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '1rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                margin: 0 
              }}>
                {member.name}
              </h4>
              <p style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                fontWeight: 700, 
                letterSpacing: '0.04em',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {member.role}
              </p>
              <a 
                href={member.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: '#0077b5', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '0.45rem',
                  borderRadius: '50%',
                  background: 'rgba(0, 119, 181, 0.08)',
                  border: '1px solid rgba(0, 119, 181, 0.25)',
                  transition: 'all 0.2s ease-in-out',
                  marginTop: '0.25rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#0077b5';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.background = '#0077b5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#0077b5';
                  e.currentTarget.style.borderColor = 'rgba(0, 119, 181, 0.25)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(0, 119, 181, 0.08)';
                }}
                title={`Connect with ${member.name} on LinkedIn`}
                aria-label={`LinkedIn Profile for ${member.name}`}
              >
                <LinkedinIcon size={16} />
              </a>
            </div>
          ))}
        </div>

        {/* Footer Bottom copyright */}
        <div style={{ 
          borderTop: '1px solid var(--border)', 
          paddingTop: '1.5rem', 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          fontSize: '0.78rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <p>© 2026 Nivas Accommodations. developed by KaliX technologies</p>
          <p style={{ fontSize: '0.72rem' }}>- Proudly created by SRKR Students.</p>
        </div>
      </footer>

      {/* Global ad pop-up overlay (no ads on admin pages) */}
      {page !== 'kalix-nivas-login' && page !== 'admin-register' && page !== 'admin-dashboard' && (
        <AdPopup 
          banners={inBetweenBanners} 
          selectedCollege={selectedCollege}
          setSelectedCollege={setSelectedCollege}
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => {
          setAuthModalOpen(false);
          setAuthSuccessCallback(null);
        }} 
        onLoginSuccess={handleLoginSuccess}
        initialTab={authModalTab}
      />

      {/* Share Modal */}
      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => {
          setShareModalOpen(false);
          setShareHostel(null);
        }}
        hostel={shareHostel}
      />
    </div>
  );
}

// Global ad pop-up modal component
function AdPopup({ banners, selectedCollege, setSelectedCollege }) {
  const [activeBanner, setActiveBanner] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [closeButtonVisible, setCloseButtonVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lang, setLang] = useState('en'); // 'en' or 'te'
  const [showCollegeTooltip, setShowCollegeTooltip] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Show note popup immediately (1s delay after page load)
    const initialTimeoutId = setTimeout(() => {
      setShowNote(true);
      setIsOpen(true);
      
      // Close button appears after 4 seconds
      const closeButtonTimeoutId = setTimeout(() => {
        setCloseButtonVisible(true);
      }, 4000);
    }, 1000);

    // Standard banner ad interval every 3 minutes (only if banners exist)
    let intervalId;
    if (banners && banners.length > 0) {
      const randomIndex = Math.floor(Math.random() * banners.length);
      setActiveBanner(banners[randomIndex]);

      intervalId = setInterval(() => {
        const nextIndex = Math.floor(Math.random() * banners.length);
        setActiveBanner(banners[nextIndex]);
        setShowNote(false);
        setIsOpen(true);
      }, 180000);
    }

    return () => {
      clearTimeout(initialTimeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [banners]);

  if (!isOpen) return null;

  // Render Note Popup
  if (showNote) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '1.5rem'
      }}>
        <div className="glass" style={{
          position: 'relative',
          width: '100%',
          maxWidth: '550px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.15)',
          background: '#ffffff',
          padding: '2.5rem 2rem',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          textAlign: 'left'
        }}>
          {closeButtonVisible && (
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '0.85rem',
                right: '0.85rem',
                background: 'rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                color: '#000000',
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
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'; e.currentTarget.style.transform = 'scale(1)'; }}
              title="Close Note"
              aria-label="Close Note"
            >
              <X size={16} />
            </button>
          )}

          {/* Header & Warning Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', width: '100%' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                fontFamily: 'var(--font-display)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.03em', 
                margin: 0,
                color: 'var(--primary)',
                lineHeight: 1.3
              }}>
                {lang === 'en' ? 'Remember these points before use:' : 'ఉపయోగించే ముందు ఈ పాయింట్లను గుర్తుంచుకోండి:'}
              </h3>
              <button
                onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
                style={{
                  background: 'var(--primary-glow)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  color: 'var(--primary)',
                  borderRadius: '50%',
                  width: '2.2rem',
                  height: '2.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary-glow)'; e.currentTarget.style.transform = 'scale(1)'; }}
                title={lang === 'en' ? 'Switch to Telugu / తెలుగు' : 'Switch to English'}
                aria-label="Toggle Language"
              >
                <Info size={16} />
              </button>
            </div>
            <ul style={{ 
              margin: 0, 
              padding: 0, 
              fontSize: '0.95rem', 
              fontWeight: 600, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem',
              lineHeight: '1.4',
              color: '#1e293b',
              listStyleType: 'none',
              textAlign: 'left'
            }}>
              {lang === 'en' ? (
                <>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Check size={16} style={{ flexShrink: 0, marginTop: '0.15rem', color: 'var(--primary)' }} />
                    <span>Contact owner before visiting the hostel.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Check size={16} style={{ flexShrink: 0, marginTop: '0.15rem', color: 'var(--primary)' }} />
                    <span>The prices may differ from the website to original.</span>
                  </li>
                </>
              ) : (
                <>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Check size={16} style={{ flexShrink: 0, marginTop: '0.15rem', color: 'var(--primary)' }} />
                    <span>హాస్టల్ సందర్శించే ముందు యజమానిని సంప్రదించండి.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Check size={16} style={{ flexShrink: 0, marginTop: '0.15rem', color: 'var(--primary)' }} />
                    <span>వెబ్సైట్ లో ధరలకు మరియు అసలు ధరలకు తేడా ఉండవచ్చు.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div style={{ borderTop: '1px solid var(--border)' }}></div>

          {/* College Selection Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Select your college
              </span>
              <button
                onClick={() => setShowCollegeTooltip(!showCollegeTooltip)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Telugu Translation / తెలుగు అనువాదం"
                aria-label="College Filter Info"
              >
                <Info size={16} />
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                to find hostel near ur college
              </span>
            </div>

            {showCollegeTooltip && (
              <div 
                className="animate-fade"
                style={{ 
                  padding: '0.6rem 0.85rem', 
                  background: 'var(--primary-glow)', 
                  borderLeft: '4px solid var(--primary)', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.85rem', 
                  color: 'var(--primary)', 
                  fontWeight: 600,
                  lineHeight: '1.4'
                }}
              >
                మీ కాలేజీకి దగ్గరగా ఉన్న హాస్టల్స్ ని కనుగొనండి
              </div>
            )}

            {/* College Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              {[
                { name: 'SRKR Engineering', label: 'SRKR Engineering' },
                { name: 'Vishnu engineering college', label: 'Vishnu Engineering' }
              ].map((college) => {
                const isSelected = selectedCollege === college.name;
                return (
                  <button
                    key={college.name}
                    onClick={() => {
                      setSelectedCollege(college.name);
                      setIsOpen(false);
                    }}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      background: isSelected ? 'var(--primary-glow)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.color = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {college.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Advertisement Popup
  if (!activeBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      padding: '1.5rem'
    }}>
      <div className="glass" style={{
        position: 'relative',
        width: '100%',
        maxWidth: isMobile ? '100%' : '1600px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        background: 'rgba(30, 41, 59, 0.85)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
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
          <div style={{ position: 'relative', width: '100%', aspectRatio: '2 / 1', overflow: 'hidden' }}>
            <img 
              src={activeBanner.banner_image.startsWith('http') ? activeBanner.banner_image : `/${activeBanner.banner_image}`} 
              alt={activeBanner.title || 'Advertisement'} 
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease-out' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=600&auto=format&fit=cover'; }}
            />
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

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import HostelsList from './pages/HostelsList';
import RoomsList from './pages/RoomsList';
import DetailView from './pages/DetailView';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';

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
      if (path === '/NIVAS-2.O/admin-login' || path === '/admin-login') {
        setPage('admin-login');
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
        const res = await fetch('/api/admin/verify', {
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

        {page === 'admin-login' && (
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
        <p>© {new Date().getFullYear()} Nivas Accommodations. Simplifying student stays near SRKR College.</p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>Designed with Premium HSL Colorways.</p>
      </footer>
    </div>
  );
}

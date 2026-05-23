import React, { useEffect, useState } from 'react';
import { 
  Folder, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Image as ImageIcon, 
  Star, 
  Upload, 
  Save, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  LogOut,
  MapPin,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Hotel,
  Key
} from 'lucide-react';

export default function AdminDashboard({ token, setPage, navigateTo }) {
  // Navigation State inside Drive
  // 'root' -> Root Drive showing Hostels, Rooms, Banners folder
  // 'hostels-dir' -> Grid of all Hostels folders
  // 'rooms-dir' -> Grid of all Rooms folders
  // 'banners-dir' -> Banners management list
  // 'hostel-edit' -> Specific hostel document editor
  // 'room-edit' -> Specific room document editor
  const [drivePath, setDrivePath] = useState('root');
  const [selectedItemId, setSelectedItemId] = useState(null); // Active edit listing ID

  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [banners, setBanners] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({ hostels: 0, rooms: 0, beds: 0 });
  const [loading, setLoading] = useState(true);

  // Active form data
  const [formData, setFormData] = useState({});
  const [facilities, setFacilities] = useState([]);
  const [facilityInput, setFacilityInput] = useState('');
  const [rules, setRules] = useState([]);
  const [ruleInput, setRuleInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activePhotos, setActivePhotos] = useState([]);

  // Create Mode state (when true, opens the creation form instead of Drive grid)
  const [createMode, setCreateMode] = useState(false);
  const [createType, setCreateType] = useState('hostel'); // 'hostel', 'room', 'banner'

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const bannersRes = await fetch('/api/banners?admin=true');
      const bannersData = await bannersRes.json();
      setBanners(bannersData);

      const hostelsRes = await fetch('/api/hostels?admin=true');
      const hostelsData = await hostelsRes.json();
      setHostels(hostelsData);

      const roomsRes = await fetch('/api/rooms?admin=true');
      const roomsData = await roomsRes.json();
      setRooms(roomsData);

      const totalHostels = hostelsData.length;
      const totalRooms = roomsData.length;
      const totalBeds = 
        hostelsData.reduce((acc, curr) => acc + (curr.available_beds || 0), 0) +
        roomsData.reduce((acc, curr) => acc + (curr.available_beds || 0), 0);
      
      setStats({ hostels: totalHostels, rooms: totalRooms, beds: totalBeds });
    } catch (error) {
      console.error('Error fetching admin drive:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllData();
  }, [token]);

  // Load detailed record for the editor view
  const openItemWorkspace = async (id, type) => {
    try {
      setLoading(true);
      const endpoint = type === 'hostel' ? `/api/hostels/${id}` : `/api/rooms/${id}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      
      setFormData(data);
      setFacilities(data.facilities || []);
      setRules(data.rules || []);
      setActivePhotos(data.photos || []);
      setSelectedItemId(id);
      setSelectedFiles([]);
      
      setDrivePath(`${type}-edit`);
    } catch (e) {
      alert('Failed to load item document.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle creation form
  const openCreateWorkspace = (type) => {
    setSelectedItemId(null);
    setCreateType(type);
    setSelectedFiles([]);
    setFacilities([]);
    setRules([]);
    
    if (type === 'hostel') {
      setFormData({
        hostel_name: '',
        gender: 'boys',
        price_starting: '',
        is_ac: 0,
        beds_per_room: 4,
        phone: '',
        google_maps_link: '',
        address: '',
        sponsor_order: 0,
        available_beds: 10,
        total_beds: 30,
        status: 'active'
      });
    } else if (type === 'room') {
      setFormData({
        room_name: '',
        gender: 'boys',
        price_per_person: '',
        is_ac: 0,
        beds_per_room: 2,
        filled_count: 0,
        available_beds: 2,
        total_beds: 4,
        distance_from_srkr: 0.5,
        phone: '',
        google_maps_link: '',
        address: '',
        status: 'active'
      });
    } else if (type === 'banner') {
      setFormData({
        title: '',
        redirect_link: '#',
        display_order: 1,
        status: 'active'
      });
    }
    setCreateMode(true);
  };

  const openEditBannerWorkspace = (banner) => {
    setCreateType('banner');
    setFormData({
      title: banner.title,
      redirect_link: banner.redirect_link,
      display_order: banner.display_order,
      status: banner.status
    });
    setSelectedFiles([]);
    setSelectedItemId(banner.id);
    setCreateMode(true);
  };

  // Delete Listing completely
  const handleDeleteListing = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}? This cascades and permanently removes all photos from disk.`)) {
      return;
    }

    try {
      const endpoint = `/api/${type}s/${id}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Deletion failed.');
      
      alert('Listing deleted successfully.');
      setDrivePath(type === 'hostel' ? 'hostels-dir' : 'rooms-dir');
      fetchAllData();
    } catch (error) {
      alert(error.message);
    }
  };

  // Save changes to current text details
  const handleSaveTextChanges = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = '';
      let method = 'POST';
      let headers = { 'Authorization': `Bearer ${token}` };
      let body;

      if (createMode) {
        if (createType === 'banner') {
          const isEdit = selectedItemId !== null;
          endpoint = isEdit ? `/api/banners/${selectedItemId}` : '/api/banners';
          method = isEdit ? 'PUT' : 'POST';

          const uploadData = new FormData();
          uploadData.append('title', formData.title || '');
          uploadData.append('redirect_link', formData.redirect_link || '#');
          uploadData.append('display_order', formData.display_order !== undefined ? formData.display_order : 1);
          uploadData.append('status', formData.status || 'active');
          
          if (selectedFiles.length > 0) {
            uploadData.append('banner_image', selectedFiles[0]);
          } else if (!isEdit) {
            throw new Error('Banner image file is required.');
          }

          body = uploadData;
        } else {
          // Creating hostel or room
          endpoint = `/api/${createType}s`;
          method = 'POST';

          const uploadData = new FormData();
          Object.keys(formData).forEach(key => {
            uploadData.append(key, formData[key]);
          });
          uploadData.append('facilities', JSON.stringify(facilities));
          uploadData.append('rules', JSON.stringify(rules));
          selectedFiles.forEach(file => {
            uploadData.append('photos', file);
          });
          body = uploadData;
        }
      } else {
        // Editing hostel or room
        const type = drivePath === 'hostel-edit' ? 'hostel' : 'room';
        endpoint = `/api/${type}s/${selectedItemId}`;
        method = 'PUT';

        headers['Content-Type'] = 'application/json';
        const jsonBody = {
          ...formData,
          facilities,
          rules
        };
        body = JSON.stringify(jsonBody);
      }

      const res = await fetch(endpoint, { method, headers, body });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Operation failed.');
      }

      alert('Workspace changes saved successfully.');
      setCreateMode(false);
      setSelectedItemId(null);
      
      // If we saved an edit, reload that folder workspace
      if (!createMode) {
        openItemWorkspace(selectedItemId, drivePath === 'hostel-edit' ? 'hostel' : 'room');
      } else {
        setDrivePath(createType === 'hostel' ? 'hostels-dir' : (createType === 'room' ? 'rooms-dir' : 'banners-dir'));
      }
      
      fetchAllData();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Photo handlers in-place in editor
  const handleUploadAdditionalPhotos = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadData = new FormData();
      files.forEach(f => uploadData.append('photos', f));

      const type = drivePath === 'hostel-edit' ? 'hostel' : 'room';
      const endpoint = `/api/${type}s/${selectedItemId}/photos`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadData
      });
      if (!res.ok) throw new Error('Upload failed.');

      alert('Photos added to folder.');
      openItemWorkspace(selectedItemId, type);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPhotoPrimary = async (photoId) => {
    try {
      const type = drivePath === 'hostel-edit' ? 'hostel' : 'room';
      const endpoint = `/api/${type}s/${selectedItemId}/photos/${photoId}/primary`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to set cover.');
      openItemWorkspace(selectedItemId, type);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete photo file from folder?')) return;
    try {
      const type = drivePath === 'hostel-edit' ? 'hostel' : 'room';
      const endpoint = `/api/${type}s/photos/${photoId}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Deletion failed.');
      openItemWorkspace(selectedItemId, type);
    } catch (err) {
      alert(err.message);
    }
  };

  // Banners specific CRUD
  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm('Delete this promotional banner?')) return;
    try {
      const res = await fetch(`/api/banners/${bannerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete banner.');
      fetchAllData();
    } catch (error) {
      alert(error.message);
    }
  };

  // Tag helper controls
  const handleAddFacility = () => {
    if (facilityInput.trim() && !facilities.includes(facilityInput.trim())) {
      setFacilities([...facilities, facilityInput.trim()]);
      setFacilityInput('');
    }
  };

  const handleRemoveFacility = (idx) => {
    setFacilities(facilities.filter((_, i) => i !== idx));
  };

  const handleAddRule = () => {
    if (ruleInput.trim() && !rules.includes(ruleInput.trim())) {
      setRules([...rules, ruleInput.trim()]);
      setRuleInput('');
    }
  };

  const handleRemoveRule = (idx) => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 1. DRIVE BREADCRUMB HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
            <span onClick={() => { setDrivePath('root'); setCreateMode(false); }} style={{ cursor: 'pointer', hover: 'color: white' }}>Nivas Drive</span>
            {drivePath !== 'root' && (
              <>
                <ChevronRight size={14} />
                <span 
                  onClick={() => {
                    if (drivePath.includes('edit')) {
                      setDrivePath(drivePath.startsWith('hostel') ? 'hostels-dir' : 'rooms-dir');
                    } else {
                      setDrivePath('root');
                    }
                    setCreateMode(false);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {drivePath.startsWith('hostel') ? 'Hostels Collection' : drivePath.startsWith('room') ? 'PG Rooms Collection' : 'Banners Asset'}
                </span>
              </>
            )}
            {drivePath.includes('edit') && (
              <>
                <ChevronRight size={14} />
                <span style={{ color: 'var(--primary)' }}>
                  {drivePath === 'hostel-edit' ? formData.hostel_name : formData.room_name} Workspace
                </span>
              </>
            )}
            {createMode && (
              <>
                <ChevronRight size={14} />
                <span style={{ color: 'var(--unisex-color)' }}>New {createType} Document</span>
              </>
            )}
          </div>
          
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Folder size={28} style={{ color: 'var(--primary)', fill: 'var(--primary-glow)' }} />
            <span>
              {drivePath === 'root' && 'Storage Directories'}
              {drivePath === 'hostels-dir' && 'Hostels Collection Folder'}
              {drivePath === 'rooms-dir' && 'PG Rooms Collection Folder'}
              {drivePath === 'banners-dir' && 'Promotional Ads Collection'}
              {drivePath.includes('edit') && `${drivePath === 'hostel-edit' ? 'Hostel' : 'PG Room'} Editor Document`}
              {createMode && `Register New ${createType}`}
            </span>
          </h2>
        </div>

        <button 
          className="nav-button" 
          onClick={() => navigateTo('/home', 'home')}
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', display: 'flex', gap: '0.4rem' }}
        >
          <Eye size={16} />
          <span>Exit Admin View</span>
        </button>
      </div>

      {/* 2. ROOT DRIVE VIEW */}
      {drivePath === 'root' && !createMode && (
        <div className="animate-fade">
          {/* Stats overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="admin-stat-card glass" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="admin-stat-icon"><Hotel size={20} /></div>
              <div>
                <div className="admin-stat-num">{stats.hostels}</div>
                <div className="admin-stat-label">Hostels Registered</div>
              </div>
            </div>
            <div className="admin-stat-card glass" style={{ borderLeft: '4px solid var(--unisex-color)' }}>
              <div className="admin-stat-icon" style={{ color: 'var(--unisex-color)' }}><Key size={20} /></div>
              <div>
                <div className="admin-stat-num">{stats.rooms}</div>
                <div className="admin-stat-label">PGs / Rooms Registered</div>
              </div>
            </div>
            <div className="admin-stat-card glass" style={{ borderLeft: '4px solid #fbbf24' }}>
              <div className="admin-stat-icon" style={{ color: '#fbbf24' }}><Sparkles size={20} /></div>
              <div>
                <div className="admin-stat-num">{stats.beds}</div>
                <div className="admin-stat-label">Available Vacancies</div>
              </div>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Folder Directories</h3>
          
          {/* Drive Folders Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Hostels Folder */}
            <div 
              className="glass" 
              onClick={() => setDrivePath('hostels-dir')}
              style={{ padding: '2rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)', transition: 'var(--transition)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Folder size={44} style={{ color: 'var(--primary)', fill: 'var(--primary-glow)' }} />
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>Hostels Directory</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>{hostels.length} listing folders saved</p>
              </div>
            </div>

            {/* Rooms Folder */}
            <div 
              className="glass" 
              onClick={() => setDrivePath('rooms-dir')}
              style={{ padding: '2rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)', transition: 'var(--transition)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--unisex-color)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Folder size={44} style={{ color: 'var(--unisex-color)', fill: 'hsla(150, 75%, 45%, 0.1)' }} />
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>PG & Rooms Directory</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>{rooms.length} listing folders saved</p>
              </div>
            </div>

            {/* Banners Folder */}
            <div 
              className="glass" 
              onClick={() => setDrivePath('banners-dir')}
              style={{ padding: '2rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)', transition: 'var(--transition)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fbbf24'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <ImageIcon size={44} style={{ color: '#fbbf24', fill: 'rgba(251, 191, 36, 0.1)' }} />
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>Hero Banner Ads</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>{banners.length} advertisement banners</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-DIRECTORY GRID VIEW (HOSTELS OR ROOMS) */}
      {(drivePath === 'hostels-dir' || drivePath === 'rooms-dir') && !createMode && (
        <div className="animate-fade">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button 
              className="action-btn action-btn-secondary" 
              onClick={() => setDrivePath('root')}
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border)' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Drive Root</span>
            </button>

            <button 
              className="nav-button"
              onClick={() => openCreateWorkspace(drivePath === 'hostels-dir' ? 'hostel' : 'room')}
            >
              <Plus size={16} />
              <span>Add New {drivePath === 'hostels-dir' ? 'Hostel' : 'PG Room'}</span>
            </button>
          </div>

          {/* Folder Listings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {/* Loop hostels or rooms folders */}
            {(drivePath === 'hostels-dir' ? hostels : rooms).map((item) => {
              const id = item.id;
              const name = drivePath === 'hostels-dir' ? item.hostel_name : item.room_name;
              const coverPhoto = item.primary_photo ? `/${item.primary_photo}` : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=300&auto=format&fit=cover';
              const price = drivePath === 'hostels-dir' ? item.price_starting : item.price_per_person;
              
              return (
                <div 
                  key={id}
                  className="glass"
                  onClick={() => openItemWorkspace(id, drivePath === 'hostels-dir' ? 'hostel' : 'room')}
                  style={{ borderRadius: 'var(--radius-md)', cursor: 'pointer', overflow: 'hidden', border: '1px solid var(--border)', transition: 'var(--transition)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                    <img src={coverPhoto} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize', color: 'white', background: 'rgba(0,0,0,0.65)' }}>
                      {item.gender}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Folder size={32} style={{ color: 'var(--primary)', fill: 'var(--primary-glow)', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={name}>{name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{Math.round(price)}/mo • {item.available_beds} beds left</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* If no listing exists */}
            {(drivePath === 'hostels-dir' ? hostels : rooms).length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                <Folder size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <h4>Directory is Empty</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No listings saved under this folder. Click add to register a document.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SPECIFIC LISTING DOCUMENT WORKSPACE (EDIT MODE - FORM + IMAGES SPLIT) */}
      {(drivePath === 'hostel-edit' || drivePath === 'room-edit') && !createMode && (
        <div className="animate-fade">
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <button 
              className="action-btn action-btn-secondary" 
              onClick={() => setDrivePath(drivePath === 'hostel-edit' ? 'hostels-dir' : 'rooms-dir')}
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border)' }}
            >
              <ArrowLeft size={16} />
              <span>Close Document / Back</span>
            </button>

            <button 
              className="action-btn"
              onClick={() => handleDeleteListing(selectedItemId, drivePath === 'hostel-edit' ? 'hostel' : 'room')}
              style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--girls-color)', border: '1px solid var(--girls-color)', display: 'flex', gap: '0.4rem' }}
            >
              <Trash2 size={16} />
              <span>Delete Entire Listing Folder</span>
            </button>
          </div>

          {/* TWO COLUMN MASTER WORKSPACE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '2.5rem', alignItems: 'start' }}>
            
            {/* COLUMN 1: TEXT DETAILS FORM */}
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>Textual Parameters</h3>
              </div>

              <form onSubmit={handleSaveTextChanges}>
                {drivePath === 'hostel-edit' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Hostel Name</label>
                      <input 
                        type="text" 
                        value={formData.hostel_name || ''} 
                        onChange={(e) => setFormData({ ...formData, hostel_name: e.target.value })} 
                        className="form-input" 
                        required 
                      />
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Gender Restriction</label>
                        <select 
                          value={formData.gender || 'boys'} 
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                          className="form-input"
                        >
                          <option value="boys">Boys</option>
                          <option value="girls">Girls</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Price Starting (₹ / mo)</label>
                        <input 
                          type="number" 
                          value={formData.price_starting !== undefined ? Math.round(formData.price_starting) : ''} 
                          onChange={(e) => setFormData({ ...formData, price_starting: e.target.value })} 
                          className="form-input" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Beds sharing per room</label>
                        <input 
                          type="number" 
                          value={formData.beds_per_room || ''} 
                          onChange={(e) => setFormData({ ...formData, beds_per_room: e.target.value })} 
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Contact Mobile Number</label>
                        <input 
                          type="text" 
                          value={formData.phone || ''} 
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                          className="form-input" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Available Beds Vacancy</label>
                        <input 
                          type="number" 
                          value={formData.available_beds !== undefined ? formData.available_beds : 0} 
                          onChange={(e) => setFormData({ ...formData, available_beds: parseInt(e.target.value) })} 
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Total Capacity Beds</label>
                        <input 
                          type="number" 
                          value={formData.total_beds !== undefined ? formData.total_beds : 0} 
                          onChange={(e) => setFormData({ ...formData, total_beds: parseInt(e.target.value) })} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div className="form-grid-2" style={{ alignItems: 'center', margin: '0.5rem 0 1rem 0' }}>
                      <label className="form-checkbox-row">
                        <input 
                          type="checkbox" 
                          checked={formData.is_ac === 1 || formData.is_ac === true} 
                          onChange={(e) => setFormData({ ...formData, is_ac: e.target.checked ? 1 : 0 })} 
                        />
                        <span>Air Conditioned (AC)</span>
                      </label>

                      <div className="form-group">
                        <label className="form-label">Sponsor Placements Display Order (0 for None, 1-4 for Sponsored)</label>
                        <input 
                          type="number" 
                          value={formData.sponsor_order !== undefined ? formData.sponsor_order : 0} 
                          onChange={(e) => setFormData({ ...formData, sponsor_order: parseInt(e.target.value) })} 
                          className="form-input" 
                          min="0"
                          max="4"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Room / PG Name</label>
                      <input 
                        type="text" 
                        value={formData.room_name || ''} 
                        onChange={(e) => setFormData({ ...formData, room_name: e.target.value })} 
                        className="form-input" 
                        required 
                      />
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Gender Suitability</label>
                        <select 
                          value={formData.gender || 'boys'} 
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                          className="form-input"
                        >
                          <option value="boys">Boys</option>
                          <option value="girls">Girls</option>
                          <option value="unisex">Unisex PG</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Price per person (₹ / mo)</label>
                        <input 
                          type="number" 
                          value={formData.price_per_person !== undefined ? Math.round(formData.price_per_person) : ''} 
                          onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })} 
                          className="form-input" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Beds per room</label>
                        <input 
                          type="number" 
                          value={formData.beds_per_room || ''} 
                          onChange={(e) => setFormData({ ...formData, beds_per_room: e.target.value })} 
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Distance from SRKR College (km)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={formData.distance_from_srkr || ''} 
                          onChange={(e) => setFormData({ ...formData, distance_from_srkr: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Beds Available Vacancy</label>
                        <input 
                          type="number" 
                          value={formData.available_beds !== undefined ? formData.available_beds : 0} 
                          onChange={(e) => setFormData({ ...formData, available_beds: parseInt(e.target.value) })} 
                          className="form-input" 
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Beds Filled Currently</label>
                        <input 
                          type="number" 
                          value={formData.filled_count !== undefined ? formData.filled_count : 0} 
                          onChange={(e) => setFormData({ ...formData, filled_count: parseInt(e.target.value) })} 
                          className="form-input" 
                        />
                      </div>
                    </div>

                    <div className="form-grid-2" style={{ alignItems: 'center', margin: '0.5rem 0 1rem 0' }}>
                      <label className="form-checkbox-row">
                        <input 
                          type="checkbox" 
                          checked={formData.is_ac === 1 || formData.is_ac === true} 
                          onChange={(e) => setFormData({ ...formData, is_ac: e.target.checked ? 1 : 0 })} 
                        />
                        <span>Air Conditioned (AC)</span>
                      </label>

                      <div className="form-group">
                        <label className="form-label">Contact Owner Mobile</label>
                        <input 
                          type="text" 
                          value={formData.phone || ''} 
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                          className="form-input" 
                          required 
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Google Maps Link</label>
                  <input 
                    type="text" 
                    value={formData.google_maps_link || ''} 
                    onChange={(e) => setFormData({ ...formData, google_maps_link: e.target.value })} 
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Address</label>
                  <textarea 
                    value={formData.address || ''} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                    className="form-input" 
                    rows="2"
                  />
                </div>

                {/* Amenities */}
                <div className="form-group">
                  <label className="form-label">Facilities (Type & press Enter)</label>
                  <div className="tags-input-container">
                    {facilities.map((fac, idx) => (
                      <span key={idx} className="tag-badge">
                        <span>{fac}</span>
                        <button type="button" className="tag-badge-remove" onClick={() => handleRemoveFacility(idx)}>&times;</button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      placeholder="e.g. WiFi" 
                      value={facilityInput} 
                      onChange={(e) => setFacilityInput(e.target.value)} 
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFacility(); } }}
                      className="tags-text-input" 
                    />
                  </div>
                </div>

                {/* Rules */}
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">House Rules (Type & press Enter)</label>
                  <div className="tags-input-container">
                    {rules.map((rule, idx) => (
                      <span key={idx} className="tag-badge">
                        <span>{rule}</span>
                        <button type="button" className="tag-badge-remove" onClick={() => handleRemoveRule(idx)}>&times;</button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      placeholder="e.g. Visitors Allowed" 
                      value={ruleInput} 
                      onChange={(e) => setRuleInput(e.target.value)} 
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRule(); } }}
                      className="tags-text-input" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="action-btn action-btn-primary"
                  style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Save size={18} />
                  <span>Save Parameter Updates</span>
                </button>
              </form>
            </div>

            {/* COLUMN 2: ASSOCIATED PHOTOS & DROP FILE AREA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Photo grid card */}
              <div className="glass" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <ImageIcon size={20} style={{ color: 'var(--unisex-color)' }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>Associated Folder Images</h3>
                </div>

                {activePhotos && activePhotos.length > 0 ? (
                  <div className="admin-photos-grid">
                    {activePhotos.map((p) => {
                      const isPrimary = p.is_primary === 1;
                      return (
                        <div key={p.id} className="admin-photo-box">
                          <img src={`/${p.photo}`} alt="Thumb view" className="admin-photo-img" />
                          <div className="admin-photo-actions">
                            <button 
                              className={`admin-photo-btn admin-photo-btn-primary ${isPrimary ? 'active' : ''}`}
                              onClick={() => handleMarkPhotoPrimary(p.id)}
                              title={isPrimary ? 'Primary Thumbnail cover' : 'Set as primary cover'}
                            >
                              <Star size={14} style={{ fill: isPrimary ? 'currentColor' : 'none' }} />
                            </button>
                            <button 
                              className="admin-photo-btn admin-photo-btn-delete"
                              onClick={() => handleDeletePhoto(p.id)}
                              title="Delete photo file"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    No photos found inside folder directory.
                  </p>
                )}
              </div>

              {/* Upload Drop uploader card */}
              <div className="glass" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Upload size={20} style={{ color: '#fbbf24' }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>Drop New Photo Files</h3>
                </div>

                <div 
                  style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.01)', transition: 'var(--transition-fast)' }}
                  onClick={() => document.getElementById('workspace-photo-input').click()}
                >
                  <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }} />
                  <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Click or drop files to upload directly</p>
                  <input 
                    id="workspace-photo-input"
                    type="file" 
                    multiple 
                    onChange={handleUploadAdditionalPhotos}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 5. BANNERS DIRECTORY BREADCRUMB LIST */}
      {drivePath === 'banners-dir' && !createMode && (
        <div className="animate-fade">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button 
              className="action-btn action-btn-secondary" 
              onClick={() => setDrivePath('root')}
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border)' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Drive Root</span>
            </button>

            <button 
              className="nav-button"
              onClick={() => openCreateWorkspace('banner')}
            >
              <Plus size={16} />
              <span>Add New Banner Ad</span>
            </button>
          </div>

          {/* Banners grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {banners.map((b) => (
              <div 
                key={b.id} 
                className="glass" 
                style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ height: '140px', overflow: 'hidden' }}>
                  <img 
                    src={`/${b.banner_image}`} 
                    alt={b.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=300&auto=format&fit=cover'; }}
                  />
                </div>

                <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 700 }}>{b.title || 'Untitled Banner'}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'monospace' }}>Link: {b.redirect_link}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Sequence: **Order {b.display_order}** | Status: **{b.status}**
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <button 
                      className="table-btn table-btn-edit" 
                      onClick={() => openEditBannerWorkspace(b)} 
                      title="Edit banner details"
                      style={{ width: '38px', height: '38px', borderRadius: '50%' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="table-btn table-btn-delete" 
                      onClick={() => handleDeleteBanner(b.id)} 
                      title="Delete banner asset"
                      style={{ width: '38px', height: '38px', borderRadius: '50%' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CREATE MODE (BLANK DOCUMENT REGISTER FORM) */}
      {createMode && (
        <div className="animate-fade" style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <button 
              className="action-btn action-btn-secondary" 
              onClick={() => setCreateMode(false)}
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border)' }}
            >
              <ArrowLeft size={16} />
              <span>Cancel / Back</span>
            </button>
          </div>

          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              Create New {createType.charAt(0).toUpperCase() + createType.slice(1)} Listing
            </h3>

            <form onSubmit={handleSaveTextChanges}>
              {/* Hostel Create */}
              {createType === 'hostel' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Hostel Name</label>
                    <input 
                      type="text" 
                      value={formData.hostel_name || ''} 
                      onChange={(e) => setFormData({ ...formData, hostel_name: e.target.value })} 
                      className="form-input" 
                      required 
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Gender Restriction</label>
                      <select 
                        value={formData.gender || 'boys'} 
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                        className="form-input"
                      >
                        <option value="boys">Boys</option>
                        <option value="girls">Girls</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price Starting (₹ / mo)</label>
                      <input 
                        type="number" 
                        value={formData.price_starting || ''} 
                        onChange={(e) => setFormData({ ...formData, price_starting: e.target.value })} 
                        className="form-input" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Beds sharing per room</label>
                      <input 
                        type="number" 
                        value={formData.beds_per_room || ''} 
                        onChange={(e) => setFormData({ ...formData, beds_per_room: e.target.value })} 
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Mobile Number</label>
                      <input 
                        type="text" 
                        value={formData.phone || ''} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                        className="form-input" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Available Beds Vacancy</label>
                      <input 
                        type="number" 
                        value={formData.available_beds !== undefined ? formData.available_beds : 10} 
                        onChange={(e) => setFormData({ ...formData, available_beds: parseInt(e.target.value) })} 
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Capacity Beds</label>
                      <input 
                        type="number" 
                        value={formData.total_beds !== undefined ? formData.total_beds : 30} 
                        onChange={(e) => setFormData({ ...formData, total_beds: parseInt(e.target.value) })} 
                        className="form-input" 
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ alignItems: 'center', margin: '0.5rem 0 1rem 0' }}>
                    <label className="form-checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={formData.is_ac === 1 || formData.is_ac === true} 
                        onChange={(e) => setFormData({ ...formData, is_ac: e.target.checked ? 1 : 0 })} 
                      />
                      <span>Air Conditioned (AC)</span>
                    </label>

                    <div className="form-group">
                      <label className="form-label">Sponsor Placements Display Order (0 for None, 1-4 for Sponsored)</label>
                      <input 
                        type="number" 
                        value={formData.sponsor_order !== undefined ? formData.sponsor_order : 0} 
                        onChange={(e) => setFormData({ ...formData, sponsor_order: parseInt(e.target.value) })} 
                        className="form-input" 
                        min="0"
                        max="4"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Room Create */}
              {createType === 'room' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Room / PG Name</label>
                    <input 
                      type="text" 
                      value={formData.room_name || ''} 
                      onChange={(e) => setFormData({ ...formData, room_name: e.target.value })} 
                      className="form-input" 
                      required 
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Gender Suitability</label>
                      <select 
                        value={formData.gender || 'boys'} 
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                        className="form-input"
                      >
                        <option value="boys">Boys</option>
                        <option value="girls">Girls</option>
                        <option value="unisex">Unisex PG</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price per person (₹ / mo)</label>
                      <input 
                        type="number" 
                        value={formData.price_per_person || ''} 
                        onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })} 
                        className="form-input" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Beds per room</label>
                      <input 
                        type="number" 
                        value={formData.beds_per_room || ''} 
                        onChange={(e) => setFormData({ ...formData, beds_per_room: e.target.value })} 
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Distance from SRKR College (km)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formData.distance_from_srkr || ''} 
                        onChange={(e) => setFormData({ ...formData, distance_from_srkr: e.target.value })} 
                        className="form-input" 
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Beds Available Vacancy</label>
                      <input 
                        type="number" 
                        value={formData.available_beds !== undefined ? formData.available_beds : 2} 
                        onChange={(e) => setFormData({ ...formData, available_beds: parseInt(e.target.value) })} 
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Beds Filled Currently</label>
                      <input 
                        type="number" 
                        value={formData.filled_count !== undefined ? formData.filled_count : 0} 
                        onChange={(e) => setFormData({ ...formData, filled_count: parseInt(e.target.value) })} 
                        className="form-input" 
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ alignItems: 'center', margin: '0.5rem 0 1rem 0' }}>
                    <label className="form-checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={formData.is_ac === 1 || formData.is_ac === true} 
                        onChange={(e) => setFormData({ ...formData, is_ac: e.target.checked ? 1 : 0 })} 
                      />
                      <span>Air Conditioned (AC)</span>
                    </label>

                    <div className="form-group">
                      <label className="form-label">Contact Owner Mobile</label>
                      <input 
                        type="text" 
                        value={formData.phone || ''} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                        className="form-input" 
                        required 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Banner Create */}
              {createType === 'banner' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Banner Slogan Title</label>
                    <input 
                      type="text" 
                      value={formData.title || ''} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Redirect link</label>
                    <input 
                      type="text" 
                      value={formData.redirect_link || '#'} 
                      onChange={(e) => setFormData({ ...formData, redirect_link: e.target.value })} 
                      className="form-input" 
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Display order</label>
                      <input 
                        type="number" 
                        value={formData.display_order !== undefined ? formData.display_order : 1} 
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })} 
                        className="form-input" 
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select 
                        value={formData.status || 'active'} 
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                        className="form-input"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {createType !== 'banner' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Google Maps link</label>
                    <input 
                      type="text" 
                      value={formData.google_maps_link || ''} 
                      onChange={(e) => setFormData({ ...formData, google_maps_link: e.target.value })} 
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea 
                      value={formData.address || ''} 
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                      className="form-input" 
                      rows="2"
                    />
                  </div>

                  {/* Amenities */}
                  <div className="form-group">
                    <label className="form-label">Facilities (Type & press Enter)</label>
                    <div className="tags-input-container">
                      {facilities.map((fac, idx) => (
                        <span key={idx} className="tag-badge">
                          <span>{fac}</span>
                          <button type="button" className="tag-badge-remove" onClick={() => handleRemoveFacility(idx)}>&times;</button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        placeholder="e.g. WiFi" 
                        value={facilityInput} 
                        onChange={(e) => setFacilityInput(e.target.value)} 
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFacility(); } }}
                        className="tags-text-input" 
                      />
                    </div>
                  </div>

                  {/* Rules */}
                  <div className="form-group">
                    <label className="form-label">House Rules (Type & press Enter)</label>
                    <div className="tags-input-container">
                      {rules.map((rule, idx) => (
                        <span key={idx} className="tag-badge">
                          <span>{rule}</span>
                          <button type="button" className="tag-badge-remove" onClick={() => handleRemoveRule(idx)}>&times;</button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        placeholder="e.g. Visitors Allowed" 
                        value={ruleInput} 
                        onChange={(e) => setRuleInput(e.target.value)} 
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRule(); } }}
                        className="tags-text-input" 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Upload files select uploader */}
              <div className="form-group" style={{ margin: '1.5rem 0' }}>
                <label className="form-label">Upload Cover/Gallery Pictures</label>
                <div 
                  style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.01)' }}
                  onClick={() => document.getElementById('create-files-input').click()}
                >
                  <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to browse picture files</p>
                  <input 
                    id="create-files-input"
                    type="file" 
                    multiple={createType !== 'banner'}
                    onChange={(e) => setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)])}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="tag-badge" style={{ fontSize: '0.75rem' }}>
                        <span style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                        <button type="button" className="tag-badge-remove" onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="action-btn action-btn-primary"
                style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}
              >
                <Plus size={18} />
                <span>Register New listing</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline edit icon helper (for edit tags since we overwrite table grids)
const Edit2 = ({ size = 16 }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

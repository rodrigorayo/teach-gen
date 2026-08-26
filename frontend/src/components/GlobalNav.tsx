import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface GlobalNavProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  classId?: number | string;
  className?: string;
  termId?: number | string;
  termName?: string;
  unitId?: number | string;
  unitName?: string;
}

export default function GlobalNav({
  breadcrumbs = [],
  title = '',
  classId,
  className,
  termId,
  termName
}: GlobalNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // Removed unused mobileMenuOpen state

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- Styles ---
  const sidebarWidth = '250px';
  const topbarHeight = '64px';

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, bottom: 0, width: sidebarWidth,
    backgroundColor: 'var(--color-surface)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex', flexDirection: 'column',
    zIndex: 1000,
    transform: 'translateX(0)',
  };

  const topbarStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: sidebarWidth, right: 0, height: topbarHeight,
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 1.5rem', zIndex: 999,
  };

  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.8rem',
    padding: '0.8rem 1.5rem',
    cursor: 'pointer',
    color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
    backgroundColor: isActive ? 'rgba(26,115,232,0.1)' : 'transparent',
    borderRight: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
    fontWeight: isActive ? 600 : 400,
    transition: 'background-color 0.2s',
  });

  return (
    <>
      {/* 1. LEFT SIDEBAR */}
      <nav style={sidebarStyle} className="sidebar">
        <div style={{ height: topbarHeight, display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>
            Teach-Gen
          </h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div 
            style={navItemStyle(location.pathname.includes('/clases'))} 
            onClick={() => navigate('/profesor/clases')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Mis Clases
          </div>

          <div 
            style={navItemStyle(location.pathname.includes('/perfil'))} 
            onClick={() => navigate('/profesor/perfil')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Mi Perfil
          </div>

          {role === 'ADMIN' && (
            <div 
              style={navItemStyle(location.pathname.includes('/admin'))} 
              onClick={() => navigate('/admin')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
              Panel Admin
            </div>
          )}

          {/* Contextual Links */}
          {(classId || termId) && (
            <>
              <div style={{ margin: '1rem 1.5rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contexto Actual
              </div>
              {classId && (
                <div style={navItemStyle(location.pathname.includes(`/clase/${classId}`))} onClick={() => navigate(`/profesor/clase/${classId}`)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 6 8-4 8 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"/><path d="M12 22v-10"/></svg>
                  {className || "Clase"}
                </div>
              )}
              {termId && (
                <div style={navItemStyle(location.pathname.includes(`/gestion/${termId}`))} onClick={() => navigate(`/profesor/gestion/${termId}`)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  {termName || "Gestión"}
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* 2. TOP NAVBAR */}
      <nav style={topbarStyle} className="topbar">
        {/* Left side of Topbar (Breadcrumbs/Title) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 500, color: 'var(--color-text)' }}>
            {title || "Inicio"}
          </h1>
          {breadcrumbs.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              {breadcrumbs.map((item, index) => (
                <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
                  {index > 0 && <span style={{ margin: '0 0.5rem' }}>/</span>}
                  {item.path ? (
                    <span style={{ cursor: 'pointer' }} onClick={() => navigate(item.path!)}>{item.label}</span>
                  ) : (
                    <span style={{ color: 'var(--color-text)' }}>{item.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right side of Topbar (Search & Profile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Search Bar Placeholder */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Buscar clases o alumnos..." 
              style={{ 
                padding: '0.5rem 1rem 0.5rem 2.2rem', 
                borderRadius: '8px', 
                border: 'none', 
                background: '#f1f3f4', 
                width: '250px',
                fontSize: '0.9rem'
              }} 
            />
          </div>

          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <div 
              style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                background: 'var(--color-primary)', color: '#fff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 'bold', cursor: 'pointer', userSelect: 'none'
              }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {role === 'ADMIN' ? 'A' : 'P'}
            </div>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div 
                style={{ 
                  position: 'absolute', top: '45px', right: 0, 
                  background: 'var(--color-surface)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  boxShadow: 'var(--shadow-card)',
                  width: '240px',
                  padding: '0.5rem 0',
                  display: 'flex', flexDirection: 'column',
                  animation: 'pageFadeIn 0.2s ease forwards'
                }}
              >
                <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>Mi Cuenta</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{role === 'ADMIN' ? 'Administrador' : 'Profesor'}</div>
                </div>
                
                <div 
                  style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', color: 'var(--color-text)' }}
                  onClick={() => alert("Tema claro activado por defecto")}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
                  Apariencia: Claro
                </div>

                <div 
                  style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', color: 'var(--color-text)' }}
                  onClick={() => navigate('/profesor/perfil')}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  Configuración
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>
                
                <div 
                  style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', color: 'var(--color-danger)', fontWeight: 500 }}
                  onClick={handleLogout}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(217, 48, 37, 0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Cerrar sesión
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Global overlay if menu is open on mobile (we can implement this later) */}
      {showProfileMenu && (
        <div 
          onClick={() => setShowProfileMenu(false)} 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
        />
      )}
    </>
  );
}

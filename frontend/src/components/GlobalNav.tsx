import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  termName,
  unitId,
  unitName
}: GlobalNavProps) {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [isMock, setIsMock] = useState(localStorage.getItem('use_mock') === 'true');

  const toggleMock = () => {
    const nextVal = !isMock;
    localStorage.setItem('use_mock', nextVal ? 'true' : 'false');
    setIsMock(nextVal);
    window.location.reload();
  };

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const hasLightTheme = document.body.classList.contains('light-theme');
    
    if (savedTheme === 'light' || (!savedTheme && hasLightTheme)) {
      document.body.classList.add('light-theme');
      setIsLight(true);
    } else {
      document.body.classList.remove('light-theme');
      setIsLight(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
      setIsLight(false);
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
      setIsLight(true);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ position: 'relative', zIndex: 900 }}>
      {/* Breadcrumbs Path */}
      {breadcrumbs.length > 0 && (
        <div className="breadcrumbs" style={{ marginBottom: '1rem' }}>
          {breadcrumbs.map((item, index) => (
            <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
              {index > 0 && <span className="separator" style={{ marginRight: '0.6rem' }}>/</span>}
              {item.path ? (
                <span onClick={() => navigate(item.path!)}>{item.label}</span>
              ) : (
                <span style={{ cursor: 'default', color: 'var(--color-primary)' }}>{item.label}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Main Header Row */}
      <header className="header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>{title}</h1>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Mock Design Mode Toggle Indicator */}
          <button 
            className="btn" 
            onClick={toggleMock}
            style={{ 
              background: isMock ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.04)', 
              color: isMock ? '#A78BFA' : 'var(--color-text-muted)',
              border: isMock ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem'
            }}
            title={isMock ? "Modo Diseño Activo (Datos Locales). Clica para conectar al Servidor Real." : "Conectado al Servidor Real. Clica para activar Modo Diseño."}
          >
            <span style={{ 
              display: 'inline-block', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: isMock ? '#8B5CF6' : 'var(--color-text-muted)',
              boxShadow: isMock ? '0 0 8px #8B5CF6' : 'none'
            }}></span>
            {isMock ? "Modo Diseño" : "Modo API Real"}
          </button>

          {/* Theme Quick Toggle */}
          <button 
            className="btn btn-secondary" 
            onClick={toggleTheme}
            style={{ width: '45px', height: '45px', padding: 0, borderRadius: '50%', minWidth: '45px' }}
            title={isLight ? "Modo Oscuro" : "Modo Claro"}
          >
            {isLight ? (
              // Sun Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              // Moon Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>

          {/* Menu Hamburger Button */}
          <button 
            className="btn btn-primary" 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            <span style={{ fontSize: '0.95rem' }}>Menú</span>
          </button>
        </div>
      </header>

      {/* Floating Side Drawer Navigation Menu */}
      {menuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 998
            }}
          />

          {/* Navigation Drawer Container */}
          <div 
            className="card"
            style={{
              position: 'fixed', top: '20px', right: '20px', bottom: '20px',
              width: '320px', maxWidth: 'calc(100vw - 40px)',
              zIndex: 999,
              display: 'flex', flexDirection: 'column', gap: '1.5rem',
              padding: '2rem',
              animation: 'modalZoom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              background: 'var(--color-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Navegación</h2>
              <button 
                className="btn btn-secondary" 
                onClick={() => setMenuOpen(false)}
                style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%', minWidth: '36px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Navigation Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflowY: 'auto' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.5rem 0 0.2rem 0' }}>Accesos Rápidos</h4>
              
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1.2rem', borderRadius: '16px' }}
                onClick={() => { setMenuOpen(false); navigate('/profesor/clases'); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Mis Clases
              </button>
              
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1.2rem', borderRadius: '16px' }}
                onClick={() => { setMenuOpen(false); navigate('/profesor/perfil'); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Mi Perfil
              </button>

              {role === 'ADMIN' && (
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1.2rem', borderRadius: '16px' }}
                  onClick={() => { setMenuOpen(false); navigate('/admin'); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                  Panel de Admin
                </button>
              )}

              {/* Contextual navigation based on active state */}
              {(classId || termId || unitId) && (
                <>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1rem 0 0.2rem 0' }}>Contexto Actual</h4>
                  
                  {classId && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1.2rem', borderRadius: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      onClick={() => { setMenuOpen(false); navigate(`/profesor/clase/${classId}`); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 8-4 8 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"/><path d="M12 22v-10"/></svg>
                      {className || "Clase"}
                    </button>
                  )}

                  {termId && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1.2rem', borderRadius: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      onClick={() => { setMenuOpen(false); navigate(`/profesor/gestion/${termId}`); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                      {termName || "Gestión"}
                    </button>
                  )}

                  {unitId && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1.2rem', borderRadius: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      onClick={() => { setMenuOpen(false); navigate(`/profesor/unidad/${unitId}`); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>
                      {unitName || "Unidad"}
                    </button>
                  )}
                </>
              )}

              {isMock && (
                <>
                  <h4 style={{ fontSize: '0.8rem', color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1rem 0 0.2rem 0' }}>Herramientas de Diseño</h4>
                  <button 
                    className="btn btn-secondary" 
                    style={{ 
                      width: '100%', 
                      justifyContent: 'flex-start', 
                      padding: '0.8rem 1.2rem', 
                      borderRadius: '16px',
                      color: '#A78BFA',
                      borderColor: 'rgba(139, 92, 246, 0.2)'
                    }}
                    onClick={() => {
                      if (window.confirm("¿Deseas reiniciar los datos de prueba del modo diseño? Esto restaurará la clase y alumnos iniciales.")) {
                        localStorage.removeItem("teach_gen_mock_db");
                        window.location.reload();
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Reiniciar Datos Demo
                  </button>
                </>
              )}
            </div>

            {/* Bottom Actions with Theme Toggle and Colorblind Accessible Logout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.8rem 1.2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={toggleTheme}
              >
                {isLight ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    Modo Oscuro
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
                    Modo Claro
                  </>
                )}
              </button>

              {/* Extremely accessible, high-contrast, distinct destructive button */}
              <button 
                className="btn btn-danger" 
                onClick={handleLogout}
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  padding: '0.8rem 1.2rem', 
                  borderRadius: '16px',
                  background: 'var(--color-danger)',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  border: '2px solid #FFFFFF' /* Highly distinct double border effect for colorblind users */
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                CERRAR SESIÓN
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

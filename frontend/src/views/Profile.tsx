import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import GlobalNav from '../components/GlobalNav';

export default function Profile() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setName(res.data.name);
        setEmail(res.data.email);
        setPhone(res.data.phone || '');
        setLoading(false);
      } catch (e) {
        setMessage({ type: 'error', text: 'Error al cargar los datos del perfil' });
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    try {
      const payload: any = { name, email, phone };
      if (password) {
        payload.password = password;
      }
      
      const res = await api.put('/auth/profile', payload);
      
      // Update name in localStorage for display if needed
      if (res.data.name) {
        localStorage.setItem('name', res.data.name);
      }
      
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al actualizar el perfil';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleBack = () => {
    if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/profesor/clases');
    }
  };

  if (loading) {
    return (
      <div className="app-container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p className="text-muted">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="app-container fade-in">
      <GlobalNav 
        title="Mi Perfil"
        breadcrumbs={[
          { label: role === 'ADMIN' ? 'Panel de Administración' : 'Mis Clases', path: role === 'ADMIN' ? '/admin' : '/profesor/clases' },
          { label: 'Mi Perfil' }
        ]}
      />

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2>Editar Información Personal</h2>
          
          {message && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              background: message.type === 'success' ? 'rgba(0, 158, 115, 0.15)' : 'rgba(213, 94, 0, 0.15)',
              color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
              border: `1px solid ${message.type === 'success' ? 'rgba(0, 158, 115, 0.3)' : 'rgba(213, 94, 0, 0.3)'}`,
              fontSize: '0.95rem'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Nombre Completo</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="Ingresa tu nombre completo"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Correo Electrónico</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Número de Celular</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="ej. +59176543210"
              />
            </div>

            <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />

            <div>
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Nueva Contraseña</label>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Deja este campo vacío si no deseas cambiar tu contraseña.</p>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="Repite la nueva contraseña"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleBack}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

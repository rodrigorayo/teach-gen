import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      
      if (response.data.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/profesor');
      }
    } catch (err) {
      setError("No se pudo encontrar tu cuenta de Teach-Gen o la contraseña es incorrecta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f4f9', 
      fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
      padding: '20px',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '36px 40px 36px 40px',
        width: '100%',
        maxWidth: '448px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Refined clean logo text */}
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 500, 
            letterSpacing: '-0.5px',
            color: '#202124'
          }}>
            Teach-Gen
          </h1>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 400, 
            color: '#202124', 
            marginTop: '12px', 
            marginBottom: '8px' 
          }}>
            Iniciar sesión
          </h2>
          <p style={{ fontSize: '16px', color: '#202124', margin: 0 }}>
            Utiliza tu cuenta de educador
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Input */}
          <div style={{ position: 'relative' }}>
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{
                width: '100%',
                padding: '13px 15px',
                fontSize: '16px',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#202124',
                transition: 'border-color 0.2s',
                backgroundColor: 'transparent'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #1a73e8'}
              onBlur={(e) => e.target.style.border = '1px solid #dadce0'}
            />
          </div>

          {/* Password Input with Eye Icon */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Introduce tu contraseña" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{
                width: '100%',
                padding: '13px 45px 13px 15px',
                fontSize: '16px',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#202124',
                transition: 'border-color 0.2s',
                backgroundColor: 'transparent'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #1a73e8'}
              onBlur={(e) => e.target.style.border = '1px solid #dadce0'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5f6368'
              }}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#d93025', fontSize: '14px', marginTop: '8px' }}>
              <svg aria-hidden="true" fill="currentColor" focusable="false" width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
              </svg>
              {error}
            </div>
          )}

          <div style={{ fontSize: '14px', color: '#1a73e8', fontWeight: 500, marginTop: '8px', cursor: 'pointer' }}>
            ¿Olvidaste el correo electrónico?
          </div>

          <div style={{ fontSize: '14px', color: '#5f6368', marginTop: '32px', lineHeight: '1.5' }}>
            Esta no es tu computadora. Usa el modo de invitado para iniciar sesión de forma privada. <span style={{ color: '#1a73e8', fontWeight: 500, cursor: 'pointer' }}>Más información</span>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '32px' 
          }}>
            <button 
              type="button" 
              style={{
                background: 'none',
                border: 'none',
                color: '#1a73e8',
                fontWeight: 500,
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px 8px',
                marginLeft: '-8px'
              }}
            >
              Crear cuenta
            </button>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{
                backgroundColor: '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1557b0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a73e8'}
            >
              {loading ? 'Cargando...' : 'Siguiente'}
            </button>
          </div>
        </form>
      </div>

      {/* Footer links similar to Google */}
      <div style={{ 
        position: 'absolute', 
        bottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '448px',
        fontSize: '12px',
        color: '#5f6368'
      }}>
        <div>Español (Latinoamérica)</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ cursor: 'pointer' }}>Ayuda</span>
          <span style={{ cursor: 'pointer' }}>Privacidad</span>
          <span style={{ cursor: 'pointer' }}>Condiciones</span>
        </div>
      </div>
    </div>
  );
}

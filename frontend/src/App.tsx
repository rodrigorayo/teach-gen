import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import AdminDashboard from './views/AdminDashboard';
import ProfessorDashboard from './views/ProfessorDashboard';
import ClassDashboard from './views/ClassDashboard';
import TermView from './views/TermView';
import UnitView from './views/UnitView';
import SessionAgileView from './views/SessionAgileView';
import Profile from './views/Profile';
import './index.css';

// Simple Guard
const PrivateRoute = ({ children, role }: { children: JSX.Element, role: string }) => {
  const currentRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  
  if (!token) return <Navigate to="/login" />;
  if (role === 'ADMIN' && currentRole !== 'ADMIN') return <Navigate to="/profesor/clases" />;
  if (role === 'PROFESSOR' && currentRole !== 'PROFESSOR' && currentRole !== 'ADMIN') return <Navigate to="/login" />;
  
  return children;
};

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={<PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>} />
        
        <Route path="/profesor" element={<Navigate to="/profesor/clases" />} />
        <Route path="/profesor/clases" element={<PrivateRoute role="PROFESSOR"><ProfessorDashboard /></PrivateRoute>} />
        <Route path="/profesor/perfil" element={<PrivateRoute role="PROFESSOR"><Profile /></PrivateRoute>} />
        <Route path="/profesor/clase/:id" element={<PrivateRoute role="PROFESSOR"><ClassDashboard /></PrivateRoute>} />
        <Route path="/profesor/gestion/:id" element={<PrivateRoute role="PROFESSOR"><TermView /></PrivateRoute>} />
        <Route path="/profesor/unidad/:id" element={<PrivateRoute role="PROFESSOR"><UnitView /></PrivateRoute>} />
        <Route path="/profesor/sesion/:id" element={<PrivateRoute role="PROFESSOR"><SessionAgileView /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;

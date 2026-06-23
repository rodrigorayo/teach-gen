import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import GlobalNav from '../components/GlobalNav';

export default function AdminDashboard() {
  const [professors, setProfessors] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProfId, setEditProfId] = useState<number | null>(null);
  const [editProfName, setEditProfName] = useState('');
  const [editProfEmail, setEditProfEmail] = useState('');
  const [editProfPhone, setEditProfPhone] = useState('');
  const [editProfPassword, setEditProfPassword] = useState('');

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProfId, setDeleteProfId] = useState<number | null>(null);
  const [deleteProfName, setDeleteProfName] = useState('');

  const fetchProfessors = async () => {
    try {
      const res = await api.get('/admin/professors');
      setProfessors(res.data);
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/professors', { email, name, password, phone, role: 'PROFESSOR' });
      alert("Profesor creado");
      setEmail(''); setName(''); setPassword(''); setPhone('');
      fetchProfessors();
    } catch (e) {
      alert("Error al crear profesor");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editProfId === null) return;
    try {
      const payload: any = { name: editProfName, email: editProfEmail, phone: editProfPhone };
      if (editProfPassword) {
        payload.password = editProfPassword;
      }
      await api.put(`/admin/professors/${editProfId}`, payload);
      setShowEditModal(false);
      fetchProfessors();
    } catch (e) {
      alert("Error al editar profesor");
    }
  };

  const handleDelete = async () => {
    if (deleteProfId === null) return;
    try {
      await api.delete(`/admin/professors/${deleteProfId}`);
      setShowDeleteModal(false);
      fetchProfessors();
    } catch (e) {
      alert("Error al desactivar profesor");
    }
  };

  return (
    <div className="app-container">
      <GlobalNav 
        title="Panel de Administración"
        breadcrumbs={[{ label: "Panel de Administración" }]}
      />

      <main style={{ display: 'flex', gap: '2rem' }}>
        <section className="card" style={{ flex: 1 }}>
          <h2>Crear Profesor</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '0.75rem' }} />
            <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.75rem' }} />
            <input type="tel" placeholder="Número de celular" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '0.75rem' }} />
            <input type="password" placeholder="Contraseña temporal" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '0.75rem' }} />
            <button type="submit" className="btn btn-primary">Registrar Profesor</button>
          </form>
        </section>

        <section className="card" style={{ flex: 2 }}>
          <h2>Lista de Profesores</h2>
          <div className="student-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {professors.filter(p => p.role === 'PROFESSOR').map(p => (
              <div key={p.id} className="student-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="student-info">
                  <h3>{p.name}</h3>
                  <p className="text-muted">{p.email} {p.phone && `| ${p.phone}`}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => {
                    setEditProfId(p.id);
                    setEditProfName(p.name);
                    setEditProfEmail(p.email);
                    setEditProfPhone(p.phone || '');
                    setEditProfPassword('');
                    setShowEditModal(true);
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    Editar
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', background: '#D55E00' }} onClick={() => {
                    setDeleteProfId(p.id);
                    setDeleteProfName(p.name);
                    setShowDeleteModal(true);
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Desactivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="card" style={{ width: '400px' }}>
            <h2>Editar Profesor</h2>
            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Nombre completo" value={editProfName} onChange={e => setEditProfName(e.target.value)} required />
              <input type="email" placeholder="Correo electrónico" value={editProfEmail} onChange={e => setEditProfEmail(e.target.value)} required />
              <input type="tel" placeholder="Número de celular" value={editProfPhone} onChange={e => setEditProfPhone(e.target.value)} />
              <input type="password" placeholder="Nueva contraseña (dejar en blanco para no cambiar)" value={editProfPassword} onChange={e => setEditProfPassword(e.target.value)} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="card" style={{ width: '450px', border: '1px solid rgba(213, 94, 0, 0.4)' }}>
            <h2 style={{ color: '#D55E00', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              ¿Desactivar Profesor?
            </h2>
            <p style={{ margin: '1rem 0', lineHeight: '1.5' }}>
              ¿Estás seguro de que deseas desactivar al profesor <strong>{deleteProfName}</strong>?
            </p>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Esta acción lo ocultará de la lista y no podrá iniciar sesión. No se eliminarán sus clases ni los datos vinculados de los estudiantes de la base de datos.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-danger" style={{ background: '#D55E00' }} onClick={handleDelete}>Desactivar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

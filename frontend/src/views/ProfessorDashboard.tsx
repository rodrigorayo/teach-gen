import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import GlobalNav from '../components/GlobalNav';

export default function ProfessorDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editClassId, setEditClassId] = useState<number | null>(null);
  const [editClassName, setEditClassName] = useState('');

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteClassId, setDeleteClassId] = useState<number | null>(null);
  const [deleteClassName, setDeleteClassName] = useState('');

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (e) {
      navigate('/login');
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const me = await api.get('/auth/me');
      await api.post('/classes', { name: newClassName, professor_id: me.data.id });
      setShowModal(false);
      setNewClassName('');
      fetchClasses();
    } catch (e) { alert("Error al crear la clase"); }
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editClassId === null) return;
    try {
      await api.put(`/classes/${editClassId}`, { name: editClassName });
      setShowEditModal(false);
      setEditClassId(null);
      setEditClassName('');
      fetchClasses();
    } catch (e) { alert("Error al actualizar la clase"); }
  };

  const handleDeleteClass = async () => {
    if (deleteClassId === null) return;
    try {
      await api.delete(`/classes/${deleteClassId}`);
      setShowDeleteModal(false);
      setDeleteClassId(null);
      setDeleteClassName('');
      fetchClasses();
    } catch (e) { alert("Error al ocultar la clase"); }
  };

  return (
    <div className="app-container">
      <GlobalNav title="Mis Clases" breadcrumbs={[{ label: 'Mis Clases' }]} />

      <main className="fade-in">
        <button className="btn btn-primary" style={{ marginBottom: '2rem' }} onClick={() => setShowModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Nueva Clase
        </button>

        <div className="grid">
          {classes.map(c => (
            <div key={c.id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }} onClick={() => navigate(`/profesor/clase/${c.id}`)}>
              <div>
                <h3>{c.name}</h3>
                <p className="text-muted">ID: {c.id}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.85rem' }} onClick={() => { setEditClassId(c.id); setEditClassName(c.name); setShowEditModal(true); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  Editar
                </button>
                <button className="btn btn-danger" style={{ padding: '0.2rem 0.6rem', fontSize: '0.85rem', background: '#D55E00' }} onClick={() => { setDeleteClassId(c.id); setDeleteClassName(c.name); setShowDeleteModal(true); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  Ocultar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Crear */}
        {showModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '400px' }}>
              <h2>Crear Clase</h2>
              <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Nombre (ej. Matemáticas 3ro A)" value={newClassName} onChange={e => setNewClassName(e.target.value)} required />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '400px' }}>
              <h2>Editar Clase</h2>
              <form onSubmit={handleEditClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Nombre de la clase" value={editClassName} onChange={e => setEditClassName(e.target.value)} required />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Actualizar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirmación de Borrado */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '450px', border: '1px solid rgba(213, 94, 0, 0.4)' }}>
              <h2 style={{ color: '#D55E00', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ¿Ocultar Clase?
              </h2>
              <p style={{ margin: '1rem 0', lineHeight: '1.5' }}>
                ¿Estás seguro de que deseas ocultar la clase <strong>{deleteClassName}</strong>?
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Esta acción no eliminará los datos de los estudiantes, evaluaciones o asistencia, pero la clase dejará de estar visible en tu panel.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" style={{ background: '#D55E00' }} onClick={handleDeleteClass}>Ocultar Clase</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

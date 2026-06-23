import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import GlobalNav from '../components/GlobalNav';

export default function UnitView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sessionDate, setSessionDate] = useState('');

  // Context for Breadcrumbs
  const [context, setContext] = useState<any>(null);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSessionId, setEditSessionId] = useState<number | null>(null);
  const [editSessionDate, setEditSessionDate] = useState('');

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<number | null>(null);
  const [deleteSessionDate, setDeleteSessionDate] = useState('');

  const fetchData = async () => {
    try {
      const [sessionsRes, contextRes] = await Promise.all([
        api.get(`/units/${id}/sessions`),
        api.get(`/units/${id}/context`)
      ]);
      setSessions(sessionsRes.data);
      setContext(contextRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/sessions', { session_date: sessionDate, unit_id: parseInt(id!) });
    setShowModal(false); setSessionDate(''); fetchData();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editSessionId === null) return;
    try {
      await api.put(`/sessions/${editSessionId}`, { session_date: editSessionDate });
      setShowEditModal(false);
      fetchData();
    } catch (e) { alert("Error al actualizar la sesión"); }
  };

  const handleDelete = async () => {
    if (deleteSessionId === null) return;
    try {
      await api.delete(`/sessions/${deleteSessionId}`);
      setShowDeleteModal(false);
      fetchData();
    } catch (e) { alert("Error al ocultar la sesión"); }
  };

  return (
    <div className="app-container fade-in">
      <GlobalNav 
        title="Sesiones de la Unidad"
        breadcrumbs={[
          { label: 'Mis Clases', path: '/profesor/clases' },
          { label: context?.class_group?.name || 'Clase', path: `/profesor/clase/${context?.class_group?.id}` },
          { label: context?.term?.name || 'Gestión', path: `/profesor/gestion/${context?.term?.id}` },
          { label: context?.unit?.name || 'Unidad' }
        ]}
        classId={context?.class_group?.id}
        className={context?.class_group?.name}
        termId={context?.term?.id}
        termName={context?.term?.name}
        unitId={id}
        unitName={context?.unit?.name}
      />

      <main>
        <button className="btn btn-primary" style={{ marginBottom: '2rem' }} onClick={() => setShowModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Nueva Sesión
        </button>

        <div className="grid">
          {sessions.map(s => (
            <div key={s.id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }} onClick={() => navigate(`/profesor/sesion/${s.id}`)}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                Fecha: {s.session_date}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => {
                  setEditSessionId(s.id);
                  setEditSessionDate(s.session_date);
                  setShowEditModal(true);
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  Editar
                </button>
                <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', background: '#D55E00' }} onClick={() => {
                  setDeleteSessionId(s.id);
                  setDeleteSessionDate(s.session_date);
                  setShowDeleteModal(true);
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  Ocultar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '400px' }}>
              <h2>Nueva Sesión</h2>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} required />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '400px' }}>
              <h2>Editar Sesión</h2>
              <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="date" value={editSessionDate} onChange={e => setEditSessionDate(e.target.value)} required />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Actualizar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '450px', border: '1px solid rgba(213, 94, 0, 0.4)' }}>
              <h2 style={{ color: '#D55E00', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ¿Ocultar Sesión?
              </h2>
              <p style={{ margin: '1rem 0', lineHeight: '1.5' }}>
                ¿Estás seguro de que deseas ocultar la sesión del día <strong>{deleteSessionDate}</strong>?
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Esto ocultará el registro de asistencia y las actividades evaluadas de este día. No se eliminará la información de la base de datos.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" style={{ background: '#D55E00' }} onClick={handleDelete}>Ocultar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

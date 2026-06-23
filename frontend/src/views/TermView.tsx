import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import GlobalNav from '../components/GlobalNav';

export default function TermView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [units, setUnits] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [unitName, setUnitName] = useState('');

  // Context for Breadcrumbs
  const [context, setContext] = useState<any>(null);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUnitId, setEditUnitId] = useState<number | null>(null);
  const [editUnitName, setEditUnitName] = useState('');

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUnitId, setDeleteUnitId] = useState<number | null>(null);
  const [deleteUnitName, setDeleteUnitName] = useState('');

  const fetchData = async () => {
    try {
      const [unitsRes, contextRes] = await Promise.all([
        api.get(`/terms/${id}/units`),
        api.get(`/terms/${id}/context`)
      ]);
      setUnits(unitsRes.data);
      setContext(contextRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/units', { name: unitName, term_id: parseInt(id!) });
    setShowModal(false); setUnitName(''); fetchData();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editUnitId === null) return;
    try {
      await api.put(`/units/${editUnitId}`, { name: editUnitName });
      setShowEditModal(false);
      fetchData();
    } catch (e) { alert("Error al editar unidad"); }
  };

  const handleDelete = async () => {
    if (deleteUnitId === null) return;
    try {
      await api.delete(`/units/${deleteUnitId}`);
      setShowDeleteModal(false);
      fetchData();
    } catch (e) { alert("Error al ocultar unidad"); }
  };

  return (
    <div className="app-container fade-in">
      <GlobalNav 
        title="Unidades de la Gestión"
        breadcrumbs={[
          { label: 'Mis Clases', path: '/profesor/clases' },
          { label: context?.class_group?.name || 'Clase', path: `/profesor/clase/${context?.class_group?.id}` },
          { label: context?.term?.name || 'Gestión' }
        ]}
        classId={context?.class_group?.id}
        className={context?.class_group?.name}
        termId={id}
        termName={context?.term?.name}
      />

      <main>
        <button className="btn btn-primary" style={{ marginBottom: '2rem' }} onClick={() => setShowModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Nueva Unidad
        </button>
 
        <div className="grid">
          {units.map(u => (
            <div key={u.id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }} onClick={() => navigate(`/profesor/unidad/${u.id}`)}>
              <h3>{u.name}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => {
                  setEditUnitId(u.id);
                  setEditUnitName(u.name);
                  setShowEditModal(true);
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  Editar
                </button>
                <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', background: '#D55E00' }} onClick={() => {
                  setDeleteUnitId(u.id);
                  setDeleteUnitName(u.name);
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
              <h2>Nueva Unidad</h2>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Ej: Unidad 1: Álgebra" value={unitName} onChange={e => setUnitName(e.target.value)} required />
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
              <h2>Editar Unidad</h2>
              <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Ej: Unidad 1: Álgebra" value={editUnitName} onChange={e => setEditUnitName(e.target.value)} required />
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
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ¿Ocultar Unidad?
              </h2>
              <p style={{ margin: '1rem 0', lineHeight: '1.5' }}>
                ¿Estás seguro de que deseas ocultar la unidad <strong>{deleteUnitName}</strong>?
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Esto ocultará todas las sesiones y actividades vinculadas. No se eliminarán físicamente de la base de datos.
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

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

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  const getMonthName = (date: Date) => {
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0 = Sun, 1 = Mon
  const startingBlanks = firstDay === 0 ? 6 : firstDay - 1;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getSessionForDate = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const targetDateStr = `${year}-${formattedMonth}-${formattedDay}`;
    return sessions.find(s => s.session_date === targetDateStr);
  };


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
        {/* Controles del Calendario */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'var(--color-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary" onClick={prevMonth} style={{ padding: '0.5rem 1rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Anterior
          </button>
          
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)', letterSpacing: '1px' }}>
            {getMonthName(currentDate)}
          </h2>
          
          <button className="btn btn-secondary" onClick={nextMonth} style={{ padding: '0.5rem 1rem' }}>
            Siguiente
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Cuadrícula del Calendario */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(day => (
            <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
          {/* Días en blanco al inicio */}
          {Array.from({ length: startingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} style={{ minHeight: '120px', borderRadius: '8px', background: 'rgba(0,0,0,0.02)' }}></div>
          ))}

          {/* Días reales del mes */}
          {daysArray.map(day => {
            const session = getSessionForDate(day);
            const formattedMonth = String(month + 1).padStart(2, '0');
            const formattedDay = String(day).padStart(2, '0');
            const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

            return (
              <div 
                key={day} 
                style={{ 
                  minHeight: '120px', 
                  borderRadius: '12px', 
                  border: session ? '2px solid var(--color-primary)' : '1px dashed var(--border-color)',
                  background: session ? 'var(--color-surface)' : 'transparent',
                  padding: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                className="calendar-cell hover-scale"
                onClick={() => {
                  if (session) {
                    navigate(`/profesor/sesion/${session.id}`);
                  } else {
                    setSessionDate(dateStr);
                    setShowModal(true);
                  }
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: session ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  {day}
                </div>
                
                {session ? (
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.5rem', borderRadius: '6px', textAlign: 'center',
                      background: session.is_finalized ? 'rgba(24, 128, 56, 0.1)' : 'rgba(251, 188, 4, 0.1)',
                      color: session.is_finalized ? 'var(--color-success)' : 'var(--color-accent)',
                    }}>
                      {session.is_finalized ? "Evaluada" : "En curso"}
                    </span>
                    
                    {/* Botón Tuerca para opciones (stopPropagation para evitar entrar a la sesión) */}
                    <div 
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: 'var(--color-text-muted)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Al hacer clic en la tuerca, pre-cargamos para editar
                        setEditSessionId(session.id);
                        setEditSessionDate(session.session_date);
                        setShowEditModal(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    </div>
                    <div
                      style={{ position: 'absolute', top: '0.5rem', right: '2rem', color: '#D55E00' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteSessionId(session.id);
                        setDeleteSessionDate(session.session_date);
                        setShowDeleteModal(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 'auto', textAlign: 'center', opacity: 0.5 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                )}
              </div>
            );
          })}
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

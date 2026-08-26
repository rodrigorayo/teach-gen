import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { generatePedagogicalReport, generateClassCentralizerReport } from '../utils/pdfGenerator';
import GlobalNav from '../components/GlobalNav';

export default function ClassDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ESTUDIANTES' | 'GESTIONES' | 'REPORTES' | 'BITACORA'>('BITACORA');
  
  const [students, setStudents] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [classGroup, setClassGroup] = useState<any>(null);
  const [selectedStudentReport, setSelectedStudentReport] = useState<any>(null);
  
  // Creation Modals
  const [showTermModal, setShowTermModal] = useState(false);
  const [termName, setTermName] = useState('');
  
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [stName, setStName] = useState('');
  const [stLast, setStLast] = useState('');
  const [tutor, setTutor] = useState('');
  const [phone, setPhone] = useState('');

  // Bulk Student Registration Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Edit Student Modals
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);
  const [editStudentFirst, setEditStudentFirst] = useState('');
  const [editStudentLast, setEditStudentLast] = useState('');
  const [editStudentTutor, setEditStudentTutor] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');

  // Delete Student Modals
  const [showDeleteStudentModal, setShowDeleteStudentModal] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null);
  const [deleteStudentName, setDeleteStudentName] = useState('');

  // Edit Term Modals
  const [showEditTermModal, setShowEditTermModal] = useState(false);
  const [editTermId, setEditTermId] = useState<number | null>(null);
  const [editTermName, setEditTermName] = useState('');

  // Delete Term Modals
  const [showDeleteTermModal, setShowDeleteTermModal] = useState(false);
  const [deleteTermId, setDeleteTermId] = useState<number | null>(null);
  const [deleteTermName, setDeleteTermName] = useState('');

  const fetchData = async () => {
    try {
      const [stRes, tmRes, cgRes, diaryRes] = await Promise.all([
        api.get(`/classes/${id}/students`),
        api.get(`/classes/${id}/terms`),
        api.get(`/classes/${id}`),
        api.get(`/classes/${id}/diary`)
      ]);
      setStudents(stRes.data);
      setTerms(tmRes.data);
      setClassGroup(cgRes.data);
      setDiaryEntries(diaryRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/terms', { name: termName, start_date: '2024-01-01', end_date: '2024-12-31', class_group_id: parseInt(id!) });
    setShowTermModal(false); setTermName(''); fetchData();
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/students', { first_name: stName, last_name: stLast, course: "N/A", tutor_name: tutor, tutor_phone: phone, class_group_id: parseInt(id!) });
    setShowStudentModal(false); setStName(''); setStLast(''); setTutor(''); setPhone(''); fetchData();
  };

  // Bulk Student Creation
  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const namesList = bulkText
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    if (namesList.length === 0) return;
    try {
      await api.post(`/classes/${id}/students/bulk`, namesList);
      setShowBulkModal(false);
      setBulkText('');
      fetchData();
    } catch (e) { alert("Error en el registro masivo"); }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudentId) return;
    try {
      await api.put(`/students/${editStudentId}`, {
        first_name: editStudentFirst, last_name: editStudentLast, tutor_name: editStudentTutor, tutor_phone: editStudentPhone
      });
      setShowEditStudentModal(false); setEditStudentId(null); fetchData();
    } catch (e) { alert("Error al editar"); }
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudentId) return;
    try {
      await api.delete(`/students/${deleteStudentId}`);
      setShowDeleteStudentModal(false); setDeleteStudentId(null); fetchData();
    } catch (e) { alert("Error al eliminar"); }
  };

  const handleEditTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTermId) return;
    try {
      await api.put(`/terms/${editTermId}`, { name: editTermName });
      setShowEditTermModal(false); setEditTermId(null); fetchData();
    } catch (e) { alert("Error al editar"); }
  };

  const handleDeleteTerm = async () => {
    if (!deleteTermId) return;
    try {
      await api.delete(`/terms/${deleteTermId}`);
      setShowDeleteTermModal(false); setDeleteTermId(null); fetchData();
    } catch (e) { alert("Error al eliminar"); }
  };

  const fetchStudentReport = async (studentId: number) => {
    try {
      const res = await api.get(`/students/${studentId}/report`);
      setSelectedStudentReport(res.data);
    } catch (e) { alert("Error al obtener reporte del estudiante"); }
  };

  // Centralizer PDF Generator Trigger
  const handleDownloadCentralizer = async () => {
    try {
      const res = await api.get(`/classes/${id}/centralizer`);
      generateClassCentralizerReport(classGroup?.name || "Clase", res.data);
    } catch (e) { alert("Error al generar centralizador"); }
  };

  return (
    <div className="app-container">
      <GlobalNav title={classGroup?.name || "Clase"} breadcrumbs={[{ label: 'Mis Clases', path: '/profesor/clases' }, { label: classGroup?.name || 'Clase' }]} />
      
      <main className="fade-in">
        {/* Banner de Clase (Google Classroom Style) */}
        {classGroup && (
          <div style={{
            height: '160px',
            backgroundColor: 'var(--color-primary)',
            backgroundImage: 'linear-gradient(45deg, var(--color-primary) 0%, #005A9E 100%)',
            borderRadius: '12px',
            padding: '2rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 600 }}>{classGroup.name}</h1>
            <p style={{ fontSize: '1rem', margin: '0.5rem 0 0 0', opacity: 0.9 }}>ID de Clase: {classGroup.id}</p>
          </div>
        )}

        <div className="tabs" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '2rem' }}>
          <div className={`tab ${activeTab === 'BITACORA' ? 'active' : ''}`} onClick={() => setActiveTab('BITACORA')} style={{ padding: '1rem 0', fontWeight: 500, borderBottom: activeTab === 'BITACORA' ? '3px solid var(--color-primary)' : '3px solid transparent', cursor: 'pointer', color: activeTab === 'BITACORA' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            Novedades / Sesiones
          </div>
          <div className={`tab ${activeTab === 'ESTUDIANTES' ? 'active' : ''}`} onClick={() => setActiveTab('ESTUDIANTES')} style={{ padding: '1rem 0', fontWeight: 500, borderBottom: activeTab === 'ESTUDIANTES' ? '3px solid var(--color-primary)' : '3px solid transparent', cursor: 'pointer', color: activeTab === 'ESTUDIANTES' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            Personas
          </div>
          <div className={`tab ${activeTab === 'GESTIONES' ? 'active' : ''}`} onClick={() => setActiveTab('GESTIONES')} style={{ padding: '1rem 0', fontWeight: 500, borderBottom: activeTab === 'GESTIONES' ? '3px solid var(--color-primary)' : '3px solid transparent', cursor: 'pointer', color: activeTab === 'GESTIONES' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            Gestiones (Trimestres)
          </div>
          <div className={`tab ${activeTab === 'REPORTES' ? 'active' : ''}`} onClick={() => setActiveTab('REPORTES')} style={{ padding: '1rem 0', fontWeight: 500, borderBottom: activeTab === 'REPORTES' ? '3px solid var(--color-primary)' : '3px solid transparent', cursor: 'pointer', color: activeTab === 'REPORTES' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            Calificaciones / Reportes
          </div>
        </div>

        {activeTab === 'ESTUDIANTES' && (
          <div className="fade-in">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button className="btn btn-primary" onClick={() => setShowStudentModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                Registrar Estudiante
              </button>
              <button className="btn btn-secondary" onClick={() => setShowBulkModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Carga Rápida (Lista)
              </button>
            </div>
            <div className="grid">
              {students.map(s => (
                <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
                  <div>
                    <h3>{s.first_name} {s.last_name}</h3>
                    <p className="text-muted">Tutor: {s.tutor_name} ({s.tutor_phone})</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => {
                      setEditStudentId(s.id);
                      setEditStudentFirst(s.first_name);
                      setEditStudentLast(s.last_name);
                      setEditStudentTutor(s.tutor_name);
                      setEditStudentPhone(s.tutor_phone);
                      setShowEditStudentModal(true);
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      Editar
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', background: '#D55E00' }} onClick={() => {
                      setDeleteStudentId(s.id);
                      setDeleteStudentName(`${s.first_name} ${s.last_name}`);
                      setShowDeleteStudentModal(true);
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      Ocultar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'GESTIONES' && (
          <div className="fade-in">
            <button className="btn btn-primary" style={{ marginBottom: '2rem' }} onClick={() => setShowTermModal(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Crear Gestión
            </button>
            <div className="grid">
              {terms.map(t => (
                <div key={t.id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }} onClick={() => navigate(`/profesor/gestion/${t.id}`)}>
                  <h3>{t.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => {
                      setEditTermId(t.id);
                      setEditTermName(t.name);
                      setShowEditTermModal(true);
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      Editar
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', background: '#D55E00' }} onClick={() => {
                      setDeleteTermId(t.id);
                      setDeleteTermName(t.name);
                      setShowDeleteTermModal(true);
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      Ocultar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'BITACORA' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Tareas / Próximas Entregas (Google Classroom style) */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', backgroundColor: 'var(--color-surface)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 500, margin: '0 0 1rem 0' }}>Próximas tareas</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                ¡Wuuu! No tienes tareas para entregar pronto.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>Ver todo</a>
              </div>
            </div>

            {/* Stream / Sesiones */}
            <div>
              {diaryEntries.length === 0 ? (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-surface)' }}>
                  <p className="text-muted">Esta es la página de novedades. Aún no hay sesiones creadas en esta clase.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {diaryEntries.map((entry: any) => (
                    <div key={entry.session_id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: 'var(--color-text)' }}>
                              Nueva Sesión: {entry.session_date}
                            </h3>
                            <p className="text-muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                              {entry.term_name} — {entry.unit_name}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: '0.8rem', fontWeight: 500, padding: '0.2rem 0.6rem', borderRadius: '4px',
                            background: entry.is_finalized ? 'rgba(24, 128, 56, 0.1)' : 'rgba(251, 188, 4, 0.1)',
                            color: entry.is_finalized ? 'var(--color-success)' : 'var(--color-accent)',
                          }}>
                            {entry.is_finalized ? "Evaluada" : "En curso"}
                          </span>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }} onClick={() => navigate(`/profesor/sesion/${entry.session_id}`)}>
                            Entrar
                          </button>
                        </div>
                      </div>
                      {entry.summary_notes && (
                        <div style={{ marginLeft: '56px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                          {entry.summary_notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'REPORTES' && (
          <div className="fade-in" style={{ display: 'flex', gap: '2rem' }}>
            {/* Lista de Estudiantes */}
            <div style={{ flex: 1 }}>
              <button className="btn btn-primary" style={{ marginBottom: '1.5rem', width: '100%', padding: '1rem', justifyContent: 'center' }} onClick={handleDownloadCentralizer}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Cuadro Centralizador Completo (PDF)
              </button>
              
              <h2 style={{ marginBottom: '1rem' }}>Selecciona un Estudiante</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {students.map(s => (
                  <div key={s.id} className="card" style={{ cursor: 'pointer', padding: '1rem' }} onClick={() => fetchStudentReport(s.id)}>
                    {s.first_name} {s.last_name}
                  </div>
                ))}
              </div>
            </div>

            {/* Vista Previa del Reporte */}
            <div style={{ flex: 2 }}>
              {selectedStudentReport ? (
                <div className="card" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Resumen de {selectedStudentReport.student.first_name}</h2>
                    <button className="btn btn-primary" onClick={() => generatePedagogicalReport(selectedStudentReport)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Descargar PDF
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                      <p className="text-muted">Total Actividades Evaluadas</p>
                      <h1 style={{ color: 'white' }}>{selectedStudentReport.summary.total_activities}</h1>
                    </div>
                    <div>
                      <p className="text-muted">Rendimiento</p>
                      <h1 style={{ 
                        color: selectedStudentReport.summary.performance_percentage === 100 ? '#009E73' : 
                               selectedStudentReport.summary.performance_percentage >= 70 ? '#56B4E9' : 
                               selectedStudentReport.summary.performance_percentage >= 40 ? '#E69F00' : '#D55E00' 
                      }}>
                        {selectedStudentReport.summary.performance_percentage}%
                      </h1>
                    </div>
                  </div>

                  {selectedStudentReport.details.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                            <th style={{ padding: '0.5rem' }}>Actividad</th>
                            <th style={{ padding: '0.5rem' }}>Fecha</th>
                            <th style={{ padding: '0.5rem' }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudentReport.details.map((d: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.5rem' }}>{d.activity}</td>
                              <td style={{ padding: '0.5rem' }}>{d.session_date}</td>
                              <td style={{ padding: '0.5rem' }}>
                                {d.is_completed ? (
                                  <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    Sí
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    No
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>El estudiante aún no tiene actividades evaluadas.</p>
                  )}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', color: '#9E9E9E' }}>
                  Selecciona un estudiante a la izquierda para ver su reporte.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Creation Modals */}
        {showTermModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '400px' }}>
              <h2>Nueva Gestión</h2>
              <form onSubmit={handleCreateTerm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Ej: 1er Trimestre" value={termName} onChange={e => setTermName(e.target.value)} required />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTermModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showStudentModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '400px' }}>
              <h2>Registrar Estudiante</h2>
              <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Nombre" value={stName} onChange={e => setStName(e.target.value)} required />
                <input type="text" placeholder="Apellidos" value={stLast} onChange={e => setStLast(e.target.value)} required />
                <input type="text" placeholder="Nombre del Tutor" value={tutor} onChange={e => setTutor(e.target.value)} required />
                <input type="text" placeholder="Celular del Tutor" value={phone} onChange={e => setPhone(e.target.value)} required />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Registrar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Student Creation Modal */}
        {showBulkModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '500px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Carga Rápida de Estudiantes
              </h2>
              <p className="text-muted" style={{ margin: '0.5rem 0 1.2rem 0', lineHeight: '1.4' }}>
                Pega tu lista de estudiantes directamente de un archivo Excel o Word. Introduce <strong>un estudiante por línea</strong> (Nombre y Apellido).
              </p>
              <form onSubmit={handleBulkCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <textarea 
                  rows={8} 
                  placeholder="Ej:&#10;Juan Perez&#10;Maria Gomez&#10;Carlos Diaz"
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Registrar Lista</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditStudentModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '400px' }}>
              <h2>Editar Estudiante</h2>
              <form onSubmit={handleEditStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Nombre" value={editStudentFirst} onChange={e => setEditStudentFirst(e.target.value)} required />
                <input type="text" placeholder="Apellidos" value={editStudentLast} onChange={e => setEditStudentLast(e.target.value)} required />
                <input type="text" placeholder="Nombre del Tutor" value={editStudentTutor} onChange={e => setEditStudentTutor(e.target.value)} required />
                <input type="text" placeholder="Celular del Tutor" value={editStudentPhone} onChange={e => setEditStudentPhone(e.target.value)} required />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditStudentModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Actualizar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Student Modal */}
        {showDeleteStudentModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '450px', border: '1px solid rgba(213, 94, 0, 0.4)' }}>
              <h2 style={{ color: '#D55E00', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ¿Ocultar Estudiante?
              </h2>
              <p style={{ margin: '1rem 0', lineHeight: '1.5' }}>
                ¿Estás seguro de que deseas ocultar a <strong>{deleteStudentName}</strong>?
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Esta acción no eliminará su historial, pero ya no aparecerá en las listas de evaluación ni en los reportes de esta clase.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteStudentModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" style={{ background: '#D55E00' }} onClick={handleDeleteStudent}>Ocultar</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Term Modal */}
        {showEditTermModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '400px' }}>
              <h2>Editar Gestión</h2>
              <form onSubmit={handleEditTerm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Ej: 1er Trimestre" value={editTermName} onChange={e => setEditTermName(e.target.value)} required />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditTermModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Actualizar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Term Modal */}
        {showDeleteTermModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '450px', border: '1px solid rgba(213, 94, 0, 0.4)' }}>
              <h2 style={{ color: '#D55E00', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ¿Ocultar Gestión?
              </h2>
              <p style={{ margin: '1rem 0', lineHeight: '1.5' }}>
                ¿Estás seguro de que deseas ocultar la gestión <strong>{deleteTermName}</strong>?
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Esta acción ocultará todas las unidades, sesiones y actividades dentro de esta gestión. No se eliminarán sus registros de la base de datos.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteTermModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" style={{ background: '#D55E00' }} onClick={handleDeleteTerm}>Ocultar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

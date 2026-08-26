import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import GlobalNav from '../components/GlobalNav';

const formatStudentName = (firstName: string, lastName: string) => {
  const fullName = `${firstName || ''} ${lastName || ''}`.trim().replace(/\s+/g, ' ');
  const words = fullName.split(' ');
  if (words.length <= 2) return fullName;
  // Show first 2 words + initial of 3rd word
  const firstTwo = words.slice(0, 2).join(' ');
  const thirdWord = words[2];
  const initial = thirdWord ? ` ${thirdWord.charAt(0)}.` : '';
  return firstTwo + initial;
};

export default function SessionAgileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [actTitle, setActTitle] = useState('');
  
  const [randomStudentId, setRandomStudentId] = useState<number | null>(null);

  const [context, setContext] = useState<any>(null);

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [summaryNotes, setSummaryNotes] = useState('');

  const [showManageActivityModal, setShowManageActivityModal] = useState(false);
  const [manageActivityId, setManageActivityId] = useState<number | null>(null);
  const [manageActivityTitle, setManageActivityTitle] = useState('');

  // View Tab: 'attendance' (student list + attendance + behavior) or 'activities' (student list + activities)
  const [evaluationTab, setEvaluationTab] = useState<'attendance' | 'activities'>('attendance');

  const fetchData = async () => {
    try {
      const [stRes, actRes, attRes, compRes, contextRes] = await Promise.all([
        api.get(`/sessions/${id}/students`),
        api.get(`/sessions/${id}/activities`),
        api.get(`/sessions/${id}/attendance`),
        api.get(`/sessions/${id}/completions`),
        api.get(`/sessions/${id}/context`)
      ]);
      setStudents(stRes.data);
      setActivities(actRes.data);
      setAttendances(attRes.data);
      setCompletions(compRes.data);
      setContext(contextRes.data);
      if (contextRes.data?.session?.summary_notes) {
        setSummaryNotes(contextRes.data.session.summary_notes);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/activities', { title: actTitle, session_id: parseInt(id!) });
    setShowModal(false); setActTitle(''); fetchData();
  };

  const handleEditActivity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (manageActivityId === null) return;
    try {
      await api.put(`/activities/${manageActivityId}`, { title: manageActivityTitle });
      setShowManageActivityModal(false);
      fetchData();
    } catch (e) { alert("Error al actualizar la actividad"); }
  };

  const handleDeleteActivity = async () => {
    if (manageActivityId === null) return;
    try {
      await api.delete(`/activities/${manageActivityId}`);
      setShowManageActivityModal(false);
      fetchData();
    } catch (e) { alert("Error al ocultar la actividad"); }
  };

  const handleFinalizeClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/sessions/${id}`, {
        is_finalized: true,
        summary_notes: summaryNotes
      });
      setShowFinalizeModal(false);
      navigate(`/profesor/unidad/${context?.unit?.id}`);
    } catch (e) { alert("Error al finalizar la sesión"); }
  };

  const toggleStatus = async (studentId: number, activityId: number, currentStatus: boolean | undefined) => {
    const newStatus = currentStatus === undefined ? true : (currentStatus === true ? false : undefined);
    setCompletions(prev => {
      const filtered = prev.filter(c => !(c.student_id === studentId && c.activity_id === activityId));
      if (newStatus !== undefined) filtered.push({ student_id: studentId, activity_id: activityId, is_completed: newStatus });
      return filtered;
    });
    if (newStatus !== undefined) {
      await api.post('/activities/completion', { activity_id: activityId, student_id: studentId, is_completed: newStatus });
    }
  };

  const toggleAttendance = async (studentId: number) => {
    const current = attendances.find(a => a.student_id === studentId)?.status;
    const nextStatus = current === 'P' ? 'F' : (current === 'F' ? 'A' : (current === 'A' ? 'L' : 'P')); 
    setAttendances(prev => {
      const filtered = prev.filter(a => a.student_id !== studentId);
      filtered.push({ session_id: parseInt(id!), student_id: studentId, status: nextStatus });
      return filtered;
    });
    await api.post(`/sessions/${id}/attendance?student_id=${studentId}&status=${nextStatus}`);
  };

  const setAttendanceStatus = async (studentId: number, status: string) => {
    setAttendances(prev => {
      const filtered = prev.filter(a => a.student_id !== studentId);
      filtered.push({ session_id: parseInt(id!), student_id: studentId, status });
      return filtered;
    });
    await api.post(`/sessions/${id}/attendance?student_id=${studentId}&status=${status}`);
  };

  const handleKeyDownAttendance = (e: React.KeyboardEvent, studentId: number, index: number) => {
    const key = e.key.toLowerCase();
    if (key === 'p') setAttendanceStatus(studentId, 'P');
    else if (key === 'f') setAttendanceStatus(studentId, 'F');
    else if (key === 't' || key === 'a') setAttendanceStatus(studentId, 'A');
    else if (key === 'l') setAttendanceStatus(studentId, 'L');
    else if (key === 'enter' || key === 'arrowdown') {
      e.preventDefault();
      document.getElementById(`att-cell-${index + 1}`)?.focus();
    } else if (key === 'arrowup') {
      e.preventDefault();
      document.getElementById(`att-cell-${index - 1}`)?.focus();
    }
  };

  const pickRandom = () => {
    if (students.length === 0) return;
    let cycles = 0;
    const maxCycles = 15;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * students.length);
      setRandomStudentId(students[randomIdx].id);
      cycles++;
      if (cycles > maxCycles) clearInterval(interval);
    }, 100);
  };

  const updateBehavior = async (studentId: number, points: number) => {
    await api.post(`/students/${studentId}/behavior?points=${points}`);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, behavior_score: s.behavior_score + points } : s));
  };

  const getStatus = (studentId: number, activityId: number) => completions.find(c => c.student_id === studentId && c.activity_id === activityId)?.is_completed;
  const getAttendance = (studentId: number) => attendances.find(a => a.student_id === studentId)?.status || '—';

  const statsPresent = students.filter(s => getAttendance(s.id) === 'P').length;
  const statsAbsent = students.filter(s => getAttendance(s.id) === 'F').length;
  const statsLate = students.filter(s => getAttendance(s.id) === 'A').length;
  const statsLicense = students.filter(s => getAttendance(s.id) === 'L').length;
  const activeStudents = students.filter(s => getAttendance(s.id) !== 'F' && getAttendance(s.id) !== 'L').length;
  const totalEvaluations = activeStudents * activities.length;
  const totalCompletedEvaluations = completions.filter(c => {
    const att = getAttendance(c.student_id);
    return c.is_completed === true && att !== 'F' && att !== 'L';
  }).length;
  const completionPct = totalEvaluations > 0 ? Math.round((totalCompletedEvaluations / totalEvaluations) * 100) : 0;

  return (
    <div className="app-container fade-in">
      <GlobalNav 
        title="Evaluación Ágil"
        breadcrumbs={[
          { label: 'Mis Clases', path: '/profesor/clases' },
          { label: context?.class_group?.name || 'Clase', path: `/profesor/clase/${context?.class_group?.id}` },
          { label: context?.term?.name || 'Gestión', path: `/profesor/gestion/${context?.term?.id}` },
          { label: context?.unit?.name || 'Unidad', path: `/profesor/unidad/${context?.unit?.id}` },
          { label: `Sesión: ${context?.session?.session_date || '...'}` }
        ]}
        classId={context?.class_group?.id}
        className={context?.class_group?.name}
        termId={context?.term?.id}
        termName={context?.term?.name}
        unitId={context?.unit?.id}
        unitName={context?.unit?.name}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {context?.session?.is_finalized ? (
            <span className="badge-finalized">
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', marginRight: '6px' }}></span>
              Clase Finalizada
            </span>
          ) : (
            <span className="badge-finalized" style={{ background: 'rgba(86, 180, 233, 0.15)', color: 'var(--color-primary)', borderColor: 'rgba(86, 180, 233, 0.3)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', marginRight: '6px' }}></span>
              Clase Activa
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Segmented Control for Tab Switching */}
          <div style={{ display: 'flex', background: 'var(--color-surface)', padding: '0.3rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${evaluationTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setEvaluationTab('attendance')}
              style={{ padding: '0.4rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}
            >
              Asistencia
            </button>
            <button 
              className={`btn ${evaluationTab === 'activities' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setEvaluationTab('activities')}
              style={{ padding: '0.4rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}
            >
              Actividades
            </button>
          </div>

          <button className="btn" style={{ background: '#E69F00', color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={pickRandom}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
            Elegir al Azar
          </button>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setShowModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Nueva Actividad
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setShowFinalizeModal(true)}>
            {context?.session?.is_finalized ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                Observaciones
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Finalizar Clase
              </>
            )}
          </button>
        </div>
      </div>

      <main>
        {students.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Agrega estudiantes en el dashboard de la clase.</p>
        ) : (
          evaluationTab === 'attendance' ? (
            /* Attendance View: Estudiante + Asistencia + Conducta */
            <div className="agile-container fade-in">
              <div className="agile-grid" style={{ gridTemplateColumns: '1fr 110px 140px' }}>
                <div className="agile-cell agile-header">Estudiante</div>
                <div className="agile-cell agile-header" style={{ justifyContent: 'center' }}>Asistencia</div>
                <div className="agile-cell agile-header" style={{ justifyContent: 'center' }}>Conducta</div>

                {students.map((s, index) => {
                  const att = getAttendance(s.id);
                  let attClass = "agile-cell clickable-cell";
                  if (att === 'P') attClass += " completed"; 
                  if (att === 'F') attClass += " failed";    
                  if (att === 'A') attClass += " pending";   
                  if (att === 'L') attClass += " licensed";   

                  return (
                    <div key={`att-row-${s.id}`} style={{ display: 'contents' }}>
                      {/* Name with random highlight */}
                      <div 
                        className="agile-cell" 
                        title={`${s.first_name} ${s.last_name}`} 
                        style={{ 
                          fontWeight: 'bold', 
                          background: randomStudentId === s.id ? 'rgba(230, 159, 0, 0.4)' : 'var(--color-surface)', 
                          borderBottom: '1px solid var(--border-color)',
                          justifyContent: 'flex-start',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        <span className="student-name-full">{s.first_name} {s.last_name}</span>
                        <span className="student-name-short">{formatStudentName(s.first_name, s.last_name)}</span>
                      </div>

                      {/* Attendance Cycling Toggle Cell */}
                      <div 
                        id={`att-cell-${index}`}
                        tabIndex={0}
                        className={attClass} 
                        onClick={() => toggleAttendance(s.id)} 
                        onKeyDown={(e) => handleKeyDownAttendance(e, s.id, index)}
 
                        style={{ 
                          fontWeight: 'bold', 
                          fontSize: '1.1rem', 
                          justifyContent: 'center',
                          borderBottom: '1px solid var(--border-color)',
                          color: att === 'P' ? '#00ba88' : att === 'F' ? '#D55E00' : att === 'A' ? '#E69F00' : att === 'L' ? '#8B5CF6' : 'white',
                          border: att === 'F' ? '3px double var(--color-danger)' : 'none'
                        }}
                      >
                        {att === 'P' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            P
                          </span>
                        )}
                        {att === 'F' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            F
                          </span>
                        )}
                        {att === 'A' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            A
                          </span>
                        )}
                        {att === 'L' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            L
                          </span>
                        )}
                        {att === '—' && '—'}
                      </div>

                      {/* Behavior score modifier */}
                      <div className="agile-cell" style={{ justifyContent: 'center', gap: '0.5rem', background: 'var(--color-surface)', borderBottom: '1px solid var(--border-color)' }}>
                        <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', minWidth: '28px', fontSize: '0.85rem' }} onClick={() => updateBehavior(s.id, -1)}>-</button>
                        <span style={{ fontWeight: 'bold', minWidth: '25px', textAlign: 'center' }}>{s.behavior_score}</span>
                        <button className="btn btn-success" style={{ padding: '0.2rem 0.5rem', minWidth: '28px', fontSize: '0.85rem' }} onClick={() => updateBehavior(s.id, 1)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Activities View: Estudiante + Actividades columns only (compact on mobile!) */
            <div className="agile-container fade-in">
              {activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--color-surface)', borderRadius: '16px' }}>
                  <p className="text-muted" style={{ marginBottom: '1rem' }}>No hay actividades registradas para esta sesión.</p>
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>Crear Primera Actividad</button>
                </div>
              ) : (
                <div className="agile-grid" style={{ gridTemplateColumns: `1fr repeat(${activities.length}, 120px)` }}>
                  <div className="agile-cell agile-header">Estudiante</div>
                  {activities.map(a => (
                    <div 
                      key={a.id} 
                      className="agile-cell agile-header clickable-cell" 
                      style={{ 
                        flexDirection: 'column', 
                        gap: '0.3rem', 
                        padding: '0.6rem 0.3rem',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: '1px dashed rgba(255,255,255,0.1)'
                      }} 
                      title="Haz clic para Editar o Ocultar"
                      onClick={() => {
                        setManageActivityId(a.id);
                        setManageActivityTitle(a.title);
                        setShowManageActivityModal(true);
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', wordBreak: 'break-word', textAlign: 'center', fontWeight: 'bold' }}>{a.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        Gestionar
                      </span>
                    </div>
                  ))}

                  {students.map(s => (
                    <div key={`act-row-${s.id}`} style={{ display: 'contents' }}>
                      <div 
                        className="agile-cell" 
                        title={`${s.first_name} ${s.last_name}`} 
                        style={{ 
                          fontWeight: 'bold', 
                          background: randomStudentId === s.id ? 'rgba(230, 159, 0, 0.4)' : 'var(--color-surface)', 
                          borderBottom: '1px solid var(--border-color)',
                          justifyContent: 'flex-start',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        <span className="student-name-full">{s.first_name} {s.last_name}</span>
                        <span className="student-name-short">{formatStudentName(s.first_name, s.last_name)}</span>
                      </div>

                      {activities.map(a => {
                        const status = getStatus(s.id, a.id);
                        const attStatus = getAttendance(s.id);
                        const isAttDisabled = attStatus === 'F' || attStatus === 'L';
                        
                        let cellClass = "agile-cell";
                        let content = <span>—</span>;
                        let customStyles: React.CSSProperties = { 
                          borderBottom: '1px solid var(--border-color)', 
                          justifyContent: 'center' 
                        };
                        
                        if (isAttDisabled) {
                          cellClass += " disabled-cell";
                          customStyles.opacity = 0.55;
                          customStyles.cursor = 'not-allowed';
                          
                          if (attStatus === 'F') {
                            content = (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#D55E00', fontWeight: 'bold', fontSize: '0.95rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                F
                              </span>
                            );
                          } else if (attStatus === 'L') {
                            content = (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#8B5CF6', fontWeight: 'bold', fontSize: '0.95rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                L
                              </span>
                            );
                          }
                        } else {
                          cellClass += " clickable-cell";
                          if (status === true) { 
                            cellClass += " completed"; 
                            content = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; 
                          }
                          if (status === false) { 
                            cellClass += " failed"; 
                            content = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; 
                          }
                        }

                        return (
                          <div 
                            key={`cell-${s.id}-${a.id}`} 
                            className={cellClass} 
                            onClick={() => {
                              if (isAttDisabled) return;
                              toggleStatus(s.id, a.id, status);
                            }} 
                            style={customStyles}
                            title={isAttDisabled ? "Deshabilitado porque el estudiante no asistió (Falta o Licencia)" : undefined}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{content}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* Create Activity Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '400px' }}>
              <h2>Nueva Actividad</h2>
              <form onSubmit={handleCreateActivity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Ej: Práctica 1" value={actTitle} onChange={e => setActTitle(e.target.value)} required />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Crear</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Activity Modal (Edit and Soft-Delete combined) */}
        {showManageActivityModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '450px', border: '1px solid rgba(86, 180, 233, 0.3)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                Gestionar Actividad
              </h2>
              <p className="text-muted" style={{ margin: '0.5rem 0 1.5rem 0', lineHeight: '1.4' }}>
                Modifica el nombre o gestiona el estado de visualización de esta actividad.
              </p>
              
              <form onSubmit={handleEditActivity} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Nombre de la Actividad:</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Práctica de Lectura" 
                    value={manageActivityTitle} 
                    onChange={e => setManageActivityTitle(e.target.value)} 
                    required 
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowManageActivityModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Actualizar
                  </button>
                </div>
              </form>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '1.5rem 0' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#D55E00', fontWeight: 'bold' }}>Zona de Peligro:</p>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem 1rem', 
                    justifyContent: 'center', 
                    background: 'transparent',
                    border: '3px double #D55E00', // Daltonism-friendly high contrast double outline!
                    color: '#D55E00'
                  }}
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de que deseas ocultar la actividad "${activities.find(a => a.id === manageActivityId)?.title}"?`)) {
                      handleDeleteActivity();
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  Ocultar Actividad (Soft-delete)
                </button>
                <p className="text-muted" style={{ fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
                  * Al ocultar se conserva el historial y la nota de los alumnos para reportes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Finalize Class Modal */}
        {showFinalizeModal && (
          <div className="modal-overlay">
            <div className="card" style={{ width: '500px', border: '1px solid rgba(86, 180, 233, 0.3)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Finalizar y Resumir Clase
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', margin: '1.5rem 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="card" style={{ padding: '0.8rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Asistencia</p>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <span style={{display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)'}} title="Presentes"></span> {statsPresent} | 
                      <span style={{display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)'}} title="Atrasos"></span> {statsLate} | 
                      <span style={{display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-danger)'}} title="Faltas"></span> {statsAbsent} | 
                      <span style={{display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6'}} title="Licencias"></span> {statsLicense}
                    </p>
                  </div>
                  <div className="card" style={{ padding: '0.8rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Actividades Hechas</p>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.2rem', color: 'var(--color-primary)' }}>
                      {completionPct}% ({totalCompletedEvaluations}/{totalEvaluations})
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Observaciones Pedagógicas / Comentarios:</label>
                  <textarea 
                    rows={4} 
                    placeholder="Escribe comentarios sobre el comportamiento del grupo, temas avanzados, o recordatorios para la siguiente clase..."
                    value={summaryNotes}
                    onChange={e => setSummaryNotes(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFinalizeModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleFinalizeClass}>
                  {context?.session?.is_finalized ? "Guardar Cambios" : "Confirmar y Finalizar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

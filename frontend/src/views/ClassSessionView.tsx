import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ClassSessionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [activityId, setActivityId] = useState<number | null>(null);
  const [completions, setCompletions] = useState<Record<number, boolean | null>>({});

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      setSessionDate(today);

      // Fetch Students
      const stRes = await api.get(`/classes/${id}/students`);
      setStudents(stRes.data);

      // Create or Get Today's Session
      // MVP Hack: just create a session for unit 1 for now if it doesn't exist.
      // In a real app we'd fetch first, or have a Unit selector.
      const sessRes = await api.post('/sessions', { session_date: today, unit_id: 1 }).catch(() => null);
      const sid = sessRes?.data?.id || 1; 
      setSessionId(sid);

      // Create an activity for today
      const actRes = await api.post('/activities', { title: `Actividad ${today}`, session_id: sid }).catch(() => null);
      setActivityId(actRes?.data?.id || 1);

    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleMark = async (studentId: number, isCompleted: boolean) => {
    try {
      if (!activityId) return;
      await api.post('/activities/completion', {
        activity_id: activityId,
        student_id: studentId,
        is_completed: isCompleted
      });
      setCompletions(prev => ({ ...prev, [studentId]: isCompleted }));
    } catch (e) {
      alert("Error al guardar");
    }
  };

  const handleSendWhatsApp = async (student: any) => {
    try {
      await api.post('/whatsapp/send', {
        tutor_phone: student.tutor_phone,
        student_name: student.first_name,
        report_text: "Este es un reporte automático de rendimiento."
      });
      alert(`Reporte enviado por WhatsApp a ${student.tutor_name}`);
    } catch (e) {
      alert("Error al enviar WhatsApp");
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <button className="btn btn-secondary" onClick={() => navigate('/profesor/clases')}>Volver</button>
          <h1 style={{ marginTop: '1rem' }}>Sesión del Día</h1>
        </div>
        <div className="badge">Fecha: {sessionDate}</div>
      </header>

      <main>
        <section className="card">
          <h2>Lista Ágil de Evaluación</h2>
          <p className="text-muted">Marca rápidamente quién completó la actividad de hoy</p>
          
          <div className="student-list" style={{marginTop: '2rem'}}>
            {students.length === 0 ? <p>No hay estudiantes registrados. Vuelve y crea una clase con estudiantes.</p> : null}
            
            {students.map(student => {
              const status = completions[student.id];
              return (
                <div key={student.id} className="student-item">
                  <div className="student-info">
                    <h3>{student.first_name} {student.last_name}</h3>
                    <p>Tutor: {student.tutor_name}</p>
                  </div>
                  
                  <div className="btn-check-group">
                    <button 
                      className="btn btn-danger" 
                      style={{ opacity: status === false ? 1 : 0.5 }}
                      onClick={() => handleMark(student.id, false)}
                    >
                      ❌ No Hizo
                    </button>
                    <button 
                      className="btn btn-success"
                      style={{ opacity: status === true ? 1 : 0.5 }}
                      onClick={() => handleMark(student.id, true)}
                    >
                      ✅ Hizo
                    </button>
                    <button className="btn btn-whatsapp" style={{ marginLeft: '1rem' }} onClick={() => handleSendWhatsApp(student)}>
                      📱
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

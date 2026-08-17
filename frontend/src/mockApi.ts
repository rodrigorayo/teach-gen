// High-fidelity Mock API Client for Frontend-Only Prototyping and UX-UI Redesign
// Simulates a full backend database inside browser's localStorage

interface MockDB {
  users: any[];
  classes: any[];
  students: any[];
  terms: any[];
  units: any[];
  sessions: any[];
  activities: any[];
  completions: any[];
  attendances: any[];
  diary: any[];
}

const DEFAULT_DB: MockDB = {
  users: [
    {
      id: 1,
      email: "admin@teachgen.com",
      name: "Prof. Alejandro Rayo",
      role: "PROFESSOR",
      phone: "+591 76543210"
    }
  ],
  classes: [
    { id: 1, name: "Matemáticas - 4to de Primaria", professor_id: 1 },
    { id: 2, name: "Ciencias Naturales - 5to de Primaria", professor_id: 1 }
  ],
  students: [
    { id: 1, first_name: "ARMENGOL", last_name: "BRAVO DANIEL", course: "N/A", tutor_name: "Daniel Armengol Sr.", tutor_phone: "70112233", class_group_id: 1, behavior_score: 5, is_deleted: false },
    { id: 2, first_name: "AVILES", last_name: "CALLE CLAUDIO", course: "N/A", tutor_name: "Clara Calle", tutor_phone: "70223344", class_group_id: 1, behavior_score: 3, is_deleted: false },
    { id: 3, first_name: "CAMPOS", last_name: "ALVAREZ LUIS BENJAMIN", course: "N/A", tutor_name: "Jose Campos", tutor_phone: "70334455", class_group_id: 1, behavior_score: -1, is_deleted: false },
    { id: 4, first_name: "CAMPOS", last_name: "ALVAREZ RUBEN SAMUEL", course: "N/A", tutor_name: "Jose Campos", tutor_phone: "70334455", class_group_id: 1, behavior_score: 2, is_deleted: false },
    { id: 5, first_name: "FLORES", last_name: "MARCA CARLA", course: "N/A", tutor_name: "Elena Marca", tutor_phone: "70445566", class_group_id: 1, behavior_score: 4, is_deleted: false },
    { id: 6, first_name: "GOMEZ", last_name: "ZEBALLOS LIZBETH", course: "N/A", tutor_name: "Hugo Gomez", tutor_phone: "70556677", class_group_id: 1, behavior_score: 0, is_deleted: false }
  ],
  terms: [
    { id: 1, name: "1er Trimestre - 2026", start_date: "2026-02-01", end_date: "2026-05-15", class_group_id: 1, is_active: true, is_deleted: false },
    { id: 2, name: "2do Trimestre - 2026", start_date: "2026-05-16", end_date: "2026-08-31", class_group_id: 1, is_active: false, is_deleted: false }
  ],
  units: [
    { id: 1, name: "Unidad 1: Aritmética y Fracciones", term_id: 1, is_deleted: false },
    { id: 2, name: "Unidad 2: Introducción a la Geometría", term_id: 1, is_deleted: false }
  ],
  sessions: [
    { id: 1, session_date: "2026-06-10", unit_id: 1, is_finalized: true, summary_notes: "Avanzamos suma de fracciones heterogéneas. La mayoría comprendió el concepto del mínimo común múltiplo.", is_deleted: false },
    { id: 2, session_date: "2026-06-15", unit_id: 1, is_finalized: false, summary_notes: "", is_deleted: false }
  ],
  activities: [
    { id: 1, title: "Book pag. 123", session_id: 1, is_deleted: false },
    { id: 2, title: "Notebook", session_id: 1, is_deleted: false },
    { id: 3, title: "Fracciones Práctica", session_id: 2, is_deleted: false },
    { id: 4, title: "Taller Grupal", session_id: 2, is_deleted: false }
  ],
  completions: [
    { activity_id: 1, student_id: 1, is_completed: true, notes: "" },
    { activity_id: 1, student_id: 2, is_completed: true, notes: "" },
    { activity_id: 1, student_id: 3, is_completed: true, notes: "" },
    { activity_id: 1, student_id: 4, is_completed: true, notes: "" },
    { activity_id: 2, student_id: 1, is_completed: true, notes: "" },
    { activity_id: 2, student_id: 2, is_completed: true, notes: "" },
    { activity_id: 2, student_id: 3, is_completed: true, notes: "" },
    { activity_id: 2, student_id: 4, is_completed: false, notes: "" },
    // Session 2 completions
    { activity_id: 3, student_id: 1, is_completed: true, notes: "" },
    { activity_id: 3, student_id: 2, is_completed: false, notes: "" },
    { activity_id: 4, student_id: 1, is_completed: true, notes: "" }
  ],
  attendances: [
    { session_id: 1, student_id: 1, status: "P" },
    { session_id: 1, student_id: 2, status: "P" },
    { session_id: 1, student_id: 3, status: "P" },
    { session_id: 1, student_id: 4, status: "P" },
    { session_id: 1, student_id: 5, status: "P" },
    { session_id: 1, student_id: 6, status: "F" },
    
    { session_id: 2, student_id: 1, status: "P" },
    { session_id: 2, student_id: 2, status: "A" },
    { session_id: 2, student_id: 3, status: "F" },
    { session_id: 2, student_id: 4, status: "L" },
    { session_id: 2, student_id: 5, status: "P" },
    { session_id: 2, student_id: 6, status: "—" }
  ],
  diary: []
};

// Initialize DB if not present
const getDB = (): MockDB => {
  const data = localStorage.getItem("teach_gen_mock_db");
  if (!data) {
    localStorage.setItem("teach_gen_mock_db", JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
  return JSON.parse(data);
};

const saveDB = (db: MockDB) => {
  localStorage.setItem("teach_gen_mock_db", JSON.stringify(db));
};

export const resetMockDB = () => {
  localStorage.setItem("teach_gen_mock_db", JSON.stringify(DEFAULT_DB));
};

// Helper to delay response for realistic feeling
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  get: async (url: string, _config?: any) => {
    await delay();
    const db = getDB();
    
    // Auth Me
    if (url === "/auth/me") {
      return { data: db.users[0] };
    }
    
    // Classes list
    if (url === "/classes") {
      return { data: db.classes };
    }
    
    // Class detail
    const classMatch = url.match(/^\/classes\/(\d+)$/);
    if (classMatch) {
      const id = parseInt(classMatch[1]);
      const cg = db.classes.find(c => c.id === id);
      return { data: cg };
    }

    // Class Students
    const classStudentsMatch = url.match(/^\/classes\/(\d+)\/students$/);
    if (classStudentsMatch) {
      const classId = parseInt(classStudentsMatch[1]);
      const st = db.students.filter(s => s.class_group_id === classId && !s.is_deleted);
      return { data: st };
    }

    // Class Terms
    const classTermsMatch = url.match(/^\/classes\/(\d+)\/terms$/);
    if (classTermsMatch) {
      const classId = parseInt(classTermsMatch[1]);
      const tr = db.terms.filter(t => t.class_group_id === classId && !t.is_deleted);
      return { data: tr };
    }

    // Class Diary
    const classDiaryMatch = url.match(/^\/classes\/(\d+)\/diary$/);
    if (classDiaryMatch) {
      const sessions = db.sessions.filter(s => !s.is_deleted);
      const diaryEntries = sessions.map(session => {
        const unit = db.units.find(u => u.id === session.unit_id);
        const term = unit ? db.terms.find(t => t.id === unit.term_id) : null;
        
        const atts = db.attendances.filter(a => a.session_id === session.id);
        const presents = atts.filter(a => a.status === "P").length;
        const lates = atts.filter(a => a.status === "A").length;
        const absents = atts.filter(a => a.status === "F").length;
        
        const acts = db.activities.filter(a => a.session_id === session.id && !a.is_deleted);
        
        return {
          session_id: session.id,
          session_date: session.session_date,
          is_finalized: session.is_finalized,
          summary_notes: session.summary_notes,
          unit_name: unit ? unit.name : "Unidad",
          term_name: term ? term.name : "Gestión",
          attendance: { presents, lates, absents },
          total_activities: acts.length
        };
      });
      return { data: diaryEntries };
    }

    // Class Centralizer
    const classCentralizerMatch = url.match(/^\/classes\/(\d+)\/centralizer$/);
    if (classCentralizerMatch) {
      const classId = parseInt(classCentralizerMatch[1]);
      const sts = db.students.filter(s => s.class_group_id === classId && !s.is_deleted);
      const results = sts.map(student => {
        const completions = db.completions.filter(c => c.student_id === student.id);
        const completed = completions.filter(c => c.is_completed).length;
        const total = completions.length;
        const pct = total > 0 ? (completed / total) * 100 : 0;
        
        const atts = db.attendances.filter(a => a.student_id === student.id);
        const presents = atts.filter(a => a.status === "P").length;
        const lates = atts.filter(a => a.status === "A").length;
        const absents = atts.filter(a => a.status === "F").length;
        
        return {
          student_id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          behavior_score: student.behavior_score,
          total_activities: total,
          completed_activities: completed,
          performance_percentage: Math.round(pct),
          attendance: { presents, lates, absents }
        };
      });
      return { data: results };
    }

    // Term context
    const termContextMatch = url.match(/^\/terms\/(\d+)\/context$/);
    if (termContextMatch) {
      const termId = parseInt(termContextMatch[1]);
      const term = db.terms.find(t => t.id === termId);
      const class_group = term ? db.classes.find(c => c.id === term.class_group_id) : null;
      return {
        data: {
          term: term ? { id: term.id, name: term.name } : null,
          class_group: class_group ? { id: class_group.id, name: class_group.name } : null
        }
      };
    }

    // Term Units
    const termUnitsMatch = url.match(/^\/terms\/(\d+)\/units$/);
    if (termUnitsMatch) {
      const termId = parseInt(termUnitsMatch[1]);
      const un = db.units.filter(u => u.term_id === termId && !u.is_deleted);
      return { data: un };
    }

    // Unit context
    const unitContextMatch = url.match(/^\/units\/(\d+)\/context$/);
    if (unitContextMatch) {
      const unitId = parseInt(unitContextMatch[1]);
      const unit = db.units.find(u => u.id === unitId);
      const term = unit ? db.terms.find(t => t.id === unit.term_id) : null;
      const class_group = term ? db.classes.find(c => c.id === term.class_group_id) : null;
      return {
        data: {
          unit: unit ? { id: unit.id, name: unit.name } : null,
          term: term ? { id: term.id, name: term.name } : null,
          class_group: class_group ? { id: class_group.id, name: class_group.name } : null
        }
      };
    }

    // Unit Sessions
    const unitSessionsMatch = url.match(/^\/units\/(\d+)\/sessions$/);
    if (unitSessionsMatch) {
      const unitId = parseInt(unitSessionsMatch[1]);
      const ss = db.sessions.filter(s => s.unit_id === unitId && !s.is_deleted);
      return { data: ss };
    }

    // Session detail
    const sessionMatch = url.match(/^\/sessions\/(\d+)$/);
    if (sessionMatch) {
      const id = parseInt(sessionMatch[1]);
      return { data: db.sessions.find(s => s.id === id) };
    }

    // Session Context
    const sessionContextMatch = url.match(/^\/sessions\/(\d+)\/context$/);
    if (sessionContextMatch) {
      const sessionId = parseInt(sessionContextMatch[1]);
      const session = db.sessions.find(s => s.id === sessionId);
      const unit = session ? db.units.find(u => u.id === session.unit_id) : null;
      const term = unit ? db.terms.find(t => t.id === unit.term_id) : null;
      const class_group = term ? db.classes.find(c => c.id === term.class_group_id) : null;
      
      return {
        data: {
          session: session ? {
            id: session.id,
            session_date: session.session_date,
            is_finalized: session.is_finalized,
            summary_notes: session.summary_notes
          } : null,
          unit: unit ? { id: unit.id, name: unit.name } : null,
          term: term ? { id: term.id, name: term.name } : null,
          class_group: class_group ? { id: class_group.id, name: class_group.name } : null
        }
      };
    }

    // Session Students
    const sessionStudentsMatch = url.match(/^\/sessions\/(\d+)\/students$/);
    if (sessionStudentsMatch) {
      // Just return class 1 students for simplicity
      const sts = db.students.filter(s => s.class_group_id === 1 && !s.is_deleted);
      return { data: sts };
    }

    // Session Attendance
    const sessionAttendanceMatch = url.match(/^\/sessions\/(\d+)\/attendance$/);
    if (sessionAttendanceMatch) {
      const sessionId = parseInt(sessionAttendanceMatch[1]);
      const atts = db.attendances.filter(a => a.session_id === sessionId);
      return { data: atts };
    }

    // Session Activities
    const sessionActivitiesMatch = url.match(/^\/sessions\/(\d+)\/activities$/);
    if (sessionActivitiesMatch) {
      const sessionId = parseInt(sessionActivitiesMatch[1]);
      const acts = db.activities.filter(a => a.session_id === sessionId && !a.is_deleted);
      return { data: acts };
    }

    // Session Completions
    const sessionCompletionsMatch = url.match(/^\/sessions\/(\d+)\/completions$/);
    if (sessionCompletionsMatch) {
      const sessionId = parseInt(sessionCompletionsMatch[1]);
      // Return completions for activities in this session
      const acts = db.activities.filter(a => a.session_id === sessionId);
      const actIds = acts.map(a => a.id);
      const comps = db.completions.filter(c => actIds.includes(c.activity_id));
      return { data: comps };
    }

    // Student Report
    const studentReportMatch = url.match(/^\/students\/(\d+)\/report$/);
    if (studentReportMatch) {
      const studentId = parseInt(studentReportMatch[1]);
      const student = db.students.find(s => s.id === studentId);
      if (!student) throw new Error("Student not found");
      
      const comps = db.completions.filter(c => c.student_id === studentId);
      const details = comps.map(c => {
        const act = db.activities.find(a => a.id === c.activity_id);
        const session = act ? db.sessions.find(s => s.id === act.session_id) : null;
        const unit = session ? db.units.find(u => u.id === session.unit_id) : null;
        const term = unit ? db.terms.find(t => t.id === unit.term_id) : null;
        return {
          term: term ? term.name : "Gestión",
          unit: unit ? unit.name : "Unidad",
          session_date: session ? session.session_date : "2026-06-10",
          activity: act ? act.title : "Actividad",
          is_completed: c.is_completed,
          notes: c.notes
        };
      });
      const completed = comps.filter(c => c.is_completed).length;
      const total = comps.length;
      
      return {
        data: {
          student: {
            first_name: student.first_name,
            last_name: student.last_name,
            course: student.course,
            tutor_name: student.tutor_name,
            behavior_score: student.behavior_score
          },
          summary: {
            total_activities: total,
            completed,
            not_completed: total - completed,
            performance_percentage: total > 0 ? Math.round((completed / total) * 100) : 0
          },
          details
        }
      };
    }

    return { data: null };
  },

  post: async (url: string, data?: any, _config?: any) => {
    await delay();
    const db = getDB();

    // Login
    if (url === "/auth/login") {
      return {
        data: {
          access_token: "mock-jwt-token-xyz",
          token_type: "bearer",
          role: "PROFESSOR",
          name: "Prof. Alejandro Rayo"
        }
      };
    }

    // Create student
    if (url === "/students") {
      const newSt = {
        id: db.students.length + 1,
        first_name: data.first_name,
        last_name: data.last_name,
        course: data.course || "N/A",
        tutor_name: data.tutor_name,
        tutor_phone: data.tutor_phone,
        class_group_id: data.class_group_id,
        behavior_score: 0,
        is_deleted: false
      };
      db.students.push(newSt);
      saveDB(db);
      return { data: newSt };
    }

    // Bulk student create
    const bulkStMatch = url.match(/^\/classes\/(\d+)\/students\/bulk$/);
    if (bulkStMatch) {
      const classId = parseInt(bulkStMatch[1]);
      const payload: string[] = data;
      payload.forEach(fullName => {
        const parts = fullName.trim().split(" ");
        const first_name = parts[0] || "Estudiante";
        const last_name = parts.slice(1).join(" ") || "Registrado";
        db.students.push({
          id: db.students.length + 1,
          first_name,
          last_name,
          course: "N/A",
          tutor_name: "N/A",
          tutor_phone: "—",
          class_group_id: classId,
          behavior_score: 0,
          is_deleted: false
        });
      });
      saveDB(db);
      return { data: { message: `Successfully created ${payload.length} students` } };
    }

    // Create Term
    if (url === "/terms") {
      const newT = {
        id: db.terms.length + 1,
        name: data.name,
        start_date: data.start_date || "2026-01-01",
        end_date: data.end_date || "2026-12-31",
        class_group_id: data.class_group_id,
        is_active: true,
        is_deleted: false
      };
      db.terms.push(newT);
      saveDB(db);
      return { data: newT };
    }

    // Create Unit
    if (url === "/units") {
      const newU = {
        id: db.units.length + 1,
        name: data.name,
        term_id: data.term_id,
        is_deleted: false
      };
      db.units.push(newU);
      saveDB(db);
      return { data: newU };
    }

    // Create Session
    if (url === "/sessions") {
      const newS = {
        id: db.sessions.length + 1,
        session_date: data.session_date,
        unit_id: data.unit_id,
        is_finalized: false,
        summary_notes: "",
        is_deleted: false
      };
      db.sessions.push(newS);
      saveDB(db);
      return { data: newS };
    }

    // Create Activity
    if (url === "/activities") {
      const newA = {
        id: db.activities.length + 1,
        title: data.title,
        session_id: data.session_id,
        is_deleted: false
      };
      db.activities.push(newA);
      saveDB(db);
      return { data: newA };
    }

    // Save Attendance
    const attendancePostMatch = url.match(/^\/sessions\/(\d+)\/attendance$/);
    if (attendancePostMatch) {
      const sessionId = parseInt(attendancePostMatch[1]);
      // url params logic: ?student_id=X&status=Y
      const params = new URLSearchParams(url.split("?")[1] || "");
      const studentId = parseInt(params.get("student_id") || "0");
      const status = params.get("status") || "—";
      
      const filtered = db.attendances.filter(a => !(a.session_id === sessionId && a.student_id === studentId));
      filtered.push({ session_id: sessionId, student_id: studentId, status });
      db.attendances = filtered;
      saveDB(db);
      return { data: { session_id: sessionId, student_id: studentId, status } };
    }

    // Save Completion
    if (url === "/activities/completion") {
      const activityId = data.activity_id;
      const studentId = data.student_id;
      const isCompleted = data.is_completed;
      
      const filtered = db.completions.filter(c => !(c.activity_id === activityId && c.student_id === studentId));
      filtered.push({ activity_id: activityId, student_id: studentId, is_completed: isCompleted, notes: "" });
      db.completions = filtered;
      saveDB(db);
      return { data: { activity_id: activityId, student_id: studentId, is_completed: isCompleted } };
    }

    // Behavior Score
    const behaviorMatch = url.match(/^\/students\/(\d+)\/behavior$/);
    if (behaviorMatch) {
      const studentId = parseInt(behaviorMatch[1]);
      const params = new URLSearchParams(url.split("?")[1] || "");
      const points = parseInt(params.get("points") || "0");
      
      const st = db.students.find(s => s.id === studentId);
      if (st) {
        st.behavior_score += points;
      }
      saveDB(db);
      return { data: st };
    }

    // WhatsApp Send
    if (url === "/whatsapp/send") {
      return { data: { status: "sent", to: data.tutor_phone } };
    }

    return { data: null };
  },

  put: async (url: string, data?: any, _config?: any) => {
    await delay();
    const db = getDB();

    // Edit profile
    if (url === "/auth/profile") {
      const u = db.users[0];
      if (data.name) u.name = data.name;
      if (data.phone) u.phone = data.phone;
      if (data.email) u.email = data.email;
      saveDB(db);
      return { data: u };
    }

    // Edit student
    const studentMatch = url.match(/^\/students\/(\d+)$/);
    if (studentMatch) {
      const id = parseInt(studentMatch[1]);
      const st = db.students.find(s => s.id === id);
      if (st) {
        if (data.first_name) st.first_name = data.first_name;
        if (data.last_name) st.last_name = data.last_name;
        if (data.tutor_name) st.tutor_name = data.tutor_name;
        if (data.tutor_phone) st.tutor_phone = data.tutor_phone;
      }
      saveDB(db);
      return { data: st };
    }

    // Edit term
    const termMatch = url.match(/^\/terms\/(\d+)$/);
    if (termMatch) {
      const id = parseInt(termMatch[1]);
      const tr = db.terms.find(t => t.id === id);
      if (tr) {
        if (data.name) tr.name = data.name;
      }
      saveDB(db);
      return { data: tr };
    }

    // Edit unit
    const unitMatch = url.match(/^\/units\/(\d+)$/);
    if (unitMatch) {
      const id = parseInt(unitMatch[1]);
      const un = db.units.find(u => u.id === id);
      if (un) {
        if (data.name) un.name = data.name;
      }
      saveDB(db);
      return { data: un };
    }

    // Edit session / Finalize
    const sessionMatch = url.match(/^\/sessions\/(\d+)$/);
    if (sessionMatch) {
      const id = parseInt(sessionMatch[1]);
      const ss = db.sessions.find(s => s.id === id);
      if (ss) {
        if (data.is_finalized !== undefined) ss.is_finalized = data.is_finalized;
        if (data.summary_notes !== undefined) ss.summary_notes = data.summary_notes;
      }
      saveDB(db);
      return { data: ss };
    }

    // Edit activity
    const activityMatch = url.match(/^\/activities\/(\d+)$/);
    if (activityMatch) {
      const id = parseInt(activityMatch[1]);
      const act = db.activities.find(a => a.id === id);
      if (act) {
        if (data.title) act.title = data.title;
      }
      saveDB(db);
      return { data: act };
    }

    return { data: null };
  },

  delete: async (url: string, _config?: any) => {
    await delay();
    const db = getDB();

    // Delete student
    const studentMatch = url.match(/^\/students\/(\d+)$/);
    if (studentMatch) {
      const id = parseInt(studentMatch[1]);
      const st = db.students.find(s => s.id === id);
      if (st) st.is_deleted = true;
      saveDB(db);
      return { data: { message: "Student deleted" } };
    }

    // Delete term
    const termMatch = url.match(/^\/terms\/(\d+)$/);
    if (termMatch) {
      const id = parseInt(termMatch[1]);
      const tr = db.terms.find(t => t.id === id);
      if (tr) tr.is_deleted = true;
      saveDB(db);
      return { data: { message: "Term deleted" } };
    }

    // Delete unit
    const unitMatch = url.match(/^\/units\/(\d+)$/);
    if (unitMatch) {
      const id = parseInt(unitMatch[1]);
      const un = db.units.find(u => u.id === id);
      if (un) un.is_deleted = true;
      saveDB(db);
      return { data: { message: "Unit deleted" } };
    }

    // Delete session
    const sessionMatch = url.match(/^\/sessions\/(\d+)$/);
    if (sessionMatch) {
      const id = parseInt(sessionMatch[1]);
      const ss = db.sessions.find(s => s.id === id);
      if (ss) ss.is_deleted = true;
      saveDB(db);
      return { data: { message: "Session deleted" } };
    }

    // Delete activity (Ocultar)
    const activityMatch = url.match(/^\/activities\/(\d+)$/);
    if (activityMatch) {
      const id = parseInt(activityMatch[1]);
      const act = db.activities.find(a => a.id === id);
      if (act) act.is_deleted = true;
      saveDB(db);
      return { data: { message: "Activity deleted" } };
    }

    return { data: null };
  }
};

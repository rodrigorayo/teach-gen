from sqlalchemy.orm import Session
from app.infrastructure.repositories import (
    TermRepository, ClassGroupRepository, StudentRepository, 
    SessionRepository, ActivityRepository, ActivityCompletionRepository, UnitRepository
)
from app.domain.models import (
    TermBase, ClassGroupBase, StudentBase, SessionBase, ActivityBase, ActivityCompletionBase, UnitBase
)

class ClassGroupService:
    def __init__(self, db: Session):
        self.repository = ClassGroupRepository(db)
        self.db = db
    def get_by_professor(self, professor_id: int): return self.repository.get_by_professor(professor_id)
    def create(self, obj_in: ClassGroupBase): return self.repository.create(obj_in)
    def update(self, id: int, obj_in):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.update(db_obj, obj_in)
    def delete(self, id: int):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.soft_delete(db_obj)

    def get_centralizer(self, class_id: int):
        from app.infrastructure.db_models import StudentDB, ActivityCompletionDB, ActivityDB, SessionDB, UnitDB, TermDB, AttendanceDB
        students = self.db.query(StudentDB).filter(
            StudentDB.class_group_id == class_id,
            StudentDB.is_deleted == False
        ).all()
        
        results = []
        for student in students:
            completions = self.db.query(ActivityCompletionDB)\
                .join(ActivityDB, ActivityCompletionDB.activity_id == ActivityDB.id)\
                .join(SessionDB, ActivityDB.session_id == SessionDB.id)\
                .join(UnitDB, SessionDB.unit_id == UnitDB.id)\
                .join(TermDB, UnitDB.term_id == TermDB.id)\
                .filter(
                    ActivityCompletionDB.student_id == student.id,
                    ActivityDB.is_deleted == False,
                    SessionDB.is_deleted == False,
                    UnitDB.is_deleted == False,
                    TermDB.is_deleted == False
                ).all()
            
            total = len(completions)
            completed = sum(1 for c in completions if c.is_completed)
            pct = (completed / total * 100) if total > 0 else 0
            
            attendances = self.db.query(AttendanceDB).filter(AttendanceDB.student_id == student.id).all()
            presents = sum(1 for a in attendances if a.status == 'P')
            lates = sum(1 for a in attendances if a.status == 'A')
            absents = sum(1 for a in attendances if a.status == 'F')
            
            results.append({
                "student_id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "behavior_score": student.behavior_score,
                "total_activities": total,
                "completed_activities": completed,
                "performance_percentage": round(pct, 2),
                "attendance": {
                    "presents": presents,
                    "lates": lates,
                    "absents": absents
                }
            })
        return results

    def get_diary(self, class_id: int):
        from app.infrastructure.db_models import SessionDB, UnitDB, TermDB, AttendanceDB, ActivityDB
        sessions = self.db.query(SessionDB, UnitDB, TermDB)\
            .join(UnitDB, SessionDB.unit_id == UnitDB.id)\
            .join(TermDB, UnitDB.term_id == TermDB.id)\
            .filter(
                TermDB.class_group_id == class_id,
                SessionDB.is_deleted == False,
                UnitDB.is_deleted == False,
                TermDB.is_deleted == False
            ).order_by(SessionDB.session_date.desc()).all()
            
        diary_entries = []
        for session, unit, term in sessions:
            attendances = self.db.query(AttendanceDB).filter(AttendanceDB.session_id == session.id).all()
            presents = sum(1 for a in attendances if a.status == 'P')
            lates = sum(1 for a in attendances if a.status == 'A')
            absents = sum(1 for a in attendances if a.status == 'F')
            
            activities = self.db.query(ActivityDB).filter(ActivityDB.session_id == session.id, ActivityDB.is_deleted == False).all()
            total_acts = len(activities)
            
            diary_entries.append({
                "session_id": session.id,
                "session_date": session.session_date.isoformat(),
                "is_finalized": session.is_finalized,
                "summary_notes": session.summary_notes,
                "unit_name": unit.name,
                "term_name": term.name,
                "attendance": {
                    "presents": presents,
                    "lates": lates,
                    "absents": absents
                },
                "total_activities": total_acts
            })
        return diary_entries

class TermService:
    def __init__(self, db: Session):
        self.repository = TermRepository(db)
    def get_by_class(self, class_id: int): return self.repository.get_by_class(class_id)
    def create(self, obj_in: TermBase): return self.repository.create(obj_in)
    def update(self, id: int, obj_in):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.update(db_obj, obj_in)
    def delete(self, id: int):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.soft_delete(db_obj)

class StudentService:
    def __init__(self, db: Session):
        self.repository = StudentRepository(db)
        self.db = db
    def get_by_class(self, class_id: int): return self.repository.get_by_class(class_id)
    def create(self, obj_in: StudentBase): return self.repository.create(obj_in)
    def update(self, id: int, obj_in):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.update(db_obj, obj_in)
    def delete(self, id: int):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.soft_delete(db_obj)
    
    def update_behavior(self, student_id: int, points: int):
        from app.infrastructure.db_models import StudentDB
        student = self.db.query(StudentDB).filter(StudentDB.id == student_id, StudentDB.is_deleted == False).first()
        if student:
            student.behavior_score += points
            self.db.commit()
            self.db.refresh(student)
        return student
    
    def get_report(self, student_id: int):
        from app.infrastructure.db_models import StudentDB, ActivityCompletionDB, ActivityDB, SessionDB, UnitDB, TermDB
        student = self.repository.db.query(StudentDB).filter(StudentDB.id == student_id, StudentDB.is_deleted == False).first()
        if not student: return None
        
        completions = self.db.query(ActivityCompletionDB, ActivityDB, SessionDB, UnitDB, TermDB)\
            .join(ActivityDB, ActivityCompletionDB.activity_id == ActivityDB.id)\
            .join(SessionDB, ActivityDB.session_id == SessionDB.id)\
            .join(UnitDB, SessionDB.unit_id == UnitDB.id)\
            .join(TermDB, UnitDB.term_id == TermDB.id)\
            .filter(
                ActivityCompletionDB.student_id == student_id,
                ActivityDB.is_deleted == False,
                SessionDB.is_deleted == False,
                UnitDB.is_deleted == False,
                TermDB.is_deleted == False
            )\
            .order_by(TermDB.start_date, UnitDB.id, SessionDB.session_date).all()
            
        details = []
        completed = 0
        for comp, act, sess, unit, term in completions:
            if comp.is_completed: completed += 1
            details.append({
                "term": term.name, "unit": unit.name, "session_date": sess.session_date.isoformat(),
                "activity": act.title, "is_completed": comp.is_completed, "notes": comp.notes
            })
            
        total = len(details)
        pct = (completed / total * 100) if total > 0 else 0
        
        return {
            "student": {"first_name": student.first_name, "last_name": student.last_name, "course": student.course, "tutor_name": student.tutor_name, "behavior_score": student.behavior_score},
            "summary": {"total_activities": total, "completed": completed, "not_completed": total - completed, "performance_percentage": round(pct, 2)},
            "details": details
        }

class UnitService:
    def __init__(self, db: Session):
        self.repository = UnitRepository(db)
    def get_by_term(self, term_id: int): return self.repository.get_by_term(term_id)
    def create(self, obj_in: UnitBase): return self.repository.create(obj_in)
    def update(self, id: int, obj_in):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.update(db_obj, obj_in)
    def delete(self, id: int):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.soft_delete(db_obj)

class SessionService:
    def __init__(self, db: Session):
        self.repository = SessionRepository(db)
        self.db = db
    def get_by_unit(self, unit_id: int): return self.repository.get_by_unit(unit_id)
    def create(self, obj_in: SessionBase):
        new_session = self.repository.create(obj_in)
        from app.infrastructure.db_models import ActivityDB
        for i in range(1, 4):
            act = ActivityDB(title=f"Revisión {i}", session_id=new_session.id)
            self.db.add(act)
        self.db.commit()
        return new_session
    def update(self, id: int, obj_in):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.update(db_obj, obj_in)
    def delete(self, id: int):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.soft_delete(db_obj)
    
    def get_students_by_session(self, session_id: int):
        from app.infrastructure.db_models import SessionDB, UnitDB, TermDB, ClassGroupDB, StudentDB
        session = self.db.query(SessionDB).filter(SessionDB.id == session_id, SessionDB.is_deleted == False).first()
        if not session: return []
        unit = self.db.query(UnitDB).filter(UnitDB.id == session.unit_id, UnitDB.is_deleted == False).first()
        if not unit: return []
        term = self.db.query(TermDB).filter(TermDB.id == unit.term_id, TermDB.is_deleted == False).first()
        if not term: return []
        return self.db.query(StudentDB).filter(StudentDB.class_group_id == term.class_group_id, StudentDB.is_deleted == False).all()
        
    def mark_attendance(self, session_id: int, student_id: int, status: str):
        from app.infrastructure.db_models import AttendanceDB
        att = self.db.query(AttendanceDB).filter(AttendanceDB.session_id == session_id, AttendanceDB.student_id == student_id).first()
        if att:
            att.status = status
        else:
            att = AttendanceDB(session_id=session_id, student_id=student_id, status=status)
            self.db.add(att)
        self.db.commit()
        self.db.refresh(att)
        return att
        
    def get_attendance(self, session_id: int):
        from app.infrastructure.db_models import AttendanceDB
        return self.db.query(AttendanceDB).filter(AttendanceDB.session_id == session_id).all()
        
    def sync_session_to_sheets(self, session_id: int, sheet_id: str, tab_name: str):
        from app.infrastructure.db_models import SessionDB, AttendanceDB, StudentDB
        from app.infrastructure.sheets_client import sync_attendance_to_sheet
        
        session = self.db.query(SessionDB).filter(SessionDB.id == session_id).first()
        if not session:
            raise ValueError("Sesión no encontrada")
            
        attendances = self.db.query(AttendanceDB).filter(AttendanceDB.session_id == session_id).all()
        
        att_data = []
        for att in attendances:
            student = self.db.query(StudentDB).filter(StudentDB.id == att.student_id).first()
            if student:
                # Name format as in sheet: "LAST_NAME FIRST_NAME"
                student_name = f"{student.first_name} {student.last_name}"
                att_data.append({
                    "student_name": student_name,
                    "status": att.status
                })
                
        # The date is stored as a string or Date object in SQLAlchemy. 
        date_str = str(session.session_date) # YYYY-MM-DD
        
        updated_cells = sync_attendance_to_sheet(sheet_id, tab_name, date_str, att_data)
        return {"updated_cells": updated_cells}

class ActivityService:
    def __init__(self, db: Session):
        self.repository = ActivityRepository(db)
        self.completion_repo = ActivityCompletionRepository(db)
        self.db = db
    
    def get_by_session(self, session_id: int): return self.repository.get_by_session(session_id)
    def create(self, obj_in: ActivityBase): return self.repository.create(obj_in)
    def update(self, id: int, obj_in):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.update(db_obj, obj_in)
    def delete(self, id: int):
        db_obj = self.repository.get_by_id(id)
        if not db_obj: return None
        return self.repository.soft_delete(db_obj)
    
    def mark_completion(self, completion_in: ActivityCompletionBase):
        return self.completion_repo.mark_completion(
            activity_id=completion_in.activity_id,
            student_id=completion_in.student_id,
            is_completed=completion_in.is_completed,
            notes=completion_in.notes
        )

    def get_completions_by_session(self, session_id: int):
        from app.infrastructure.db_models import ActivityCompletionDB, ActivityDB
        return self.db.query(ActivityCompletionDB)\
            .join(ActivityDB, ActivityCompletionDB.activity_id == ActivityDB.id)\
            .filter(ActivityDB.session_id == session_id, ActivityDB.is_deleted == False)\
            .all()

class WhatsAppService:
    @staticmethod
    def send_report(tutor_phone: str, student_name: str, report_text: str):
        print("--- MOCK WHATSAPP ---")
        print(f"Sending to: {tutor_phone}")
        print(f"Message: Hello, here is the report for {student_name}: {report_text}")
        print("---------------------")
        return {"status": "sent", "to": tutor_phone}

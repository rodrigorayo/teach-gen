from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from app.infrastructure.database import get_db
from app.domain.models import (
    Term, TermBase, TermUpdate, ClassGroup, ClassGroupBase, ClassGroupUpdate,
    Student, StudentBase, StudentUpdate, Unit, UnitBase, UnitUpdate,
    Session as SessionModel, SessionBase, SessionUpdate,
    Activity, ActivityBase, ActivityUpdate, ActivityCompletion, ActivityCompletionBase,
    User, UserCreate, UserUpdate
)
from app.application.services import (
    TermService, ClassGroupService, StudentService, UnitService,
    SessionService, ActivityService, WhatsAppService
)
from app.application.auth_service import AuthService
from app.presentation.deps import get_current_user, get_current_admin, get_current_professor
from app.infrastructure.db_models import UserDB

router = APIRouter(prefix="/api", tags=["API"])

# --- AUTH ---
@router.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = auth_service.create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "name": user.name}

@router.get("/auth/me", response_model=User)
def read_users_me(current_user: UserDB = Depends(get_current_user)):
    return current_user

@router.put("/auth/profile", response_model=User)
def update_profile(user: UserUpdate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    from app.infrastructure.repositories import BaseRepository
    repo = BaseRepository(db, UserDB)
    
    # Check if email is already taken by another user
    if user.email and user.email != current_user.email:
        existing = db.query(UserDB).filter(UserDB.email == user.email, UserDB.is_deleted == False).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
            
    obj_data = user.model_dump(exclude_unset=True)
    
    # Prevent regular users from changing their own role or is_deleted status
    if current_user.role != "ADMIN":
        obj_data.pop("role", None)
        obj_data.pop("is_deleted", None)
        
    if "password" in obj_data and obj_data["password"]:
        from passlib.hash import sha256_crypt
        obj_data["hashed_password"] = sha256_crypt.hash(obj_data.pop("password"))
    else:
        obj_data.pop("password", None)
        
    return repo.update(current_user, obj_data)

# --- ADMIN (PROFESSORS CRUD) ---
@router.post("/admin/professors", response_model=User)
def create_professor(user: UserCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_admin)):
    auth_service = AuthService(db)
    if auth_service.get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return auth_service.create_user(user)

@router.get("/admin/professors", response_model=List[User])
def get_professors(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_admin)):
    return db.query(UserDB).filter(UserDB.is_deleted == False).all()

@router.put("/admin/professors/{prof_id}", response_model=User)
def update_professor(prof_id: int, user: UserUpdate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_admin)):
    from app.infrastructure.repositories import BaseRepository
    repo = BaseRepository(db, UserDB)
    db_obj = repo.get_by_id(prof_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Professor not found")
    obj_data = user.model_dump(exclude_unset=True)
    if "password" in obj_data and obj_data["password"]:
        from passlib.hash import sha256_crypt
        obj_data["hashed_password"] = sha256_crypt.hash(obj_data.pop("password"))
    return repo.update(db_obj, obj_data)

@router.delete("/admin/professors/{prof_id}")
def delete_professor(prof_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_admin)):
    from app.infrastructure.repositories import BaseRepository
    repo = BaseRepository(db, UserDB)
    db_obj = repo.get_by_id(prof_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Professor not found")
    repo.soft_delete(db_obj)
    return {"message": "Professor soft deleted successfully"}

# --- CLASS GROUPS ---
@router.get("/classes", response_model=List[ClassGroup])
def read_classes(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return ClassGroupService(db).get_by_professor(current_user.id)

@router.get("/classes/{class_id}", response_model=ClassGroup)
def read_class(class_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    service = ClassGroupService(db)
    cg = service.repository.get_by_id(class_id)
    if not cg:
        raise HTTPException(status_code=404, detail="Class not found")
    return cg

@router.post("/classes", response_model=ClassGroup)
def create_class(cg: ClassGroupBase, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    if cg.professor_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Cannot create class for another professor")
    return ClassGroupService(db).create(cg)

@router.put("/classes/{class_id}", response_model=ClassGroup)
def update_class(class_id: int, cg: ClassGroupUpdate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    service = ClassGroupService(db)
    db_obj = service.repository.get_by_id(class_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    if db_obj.professor_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Cannot update class of another professor")
    return service.update(class_id, cg)

@router.delete("/classes/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    service = ClassGroupService(db)
    db_obj = service.repository.get_by_id(class_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    if db_obj.professor_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Cannot delete class of another professor")
    service.delete(class_id)
    return {"message": "Class soft deleted successfully"}

@router.get("/classes/{class_id}/centralizer")
def read_class_centralizer(class_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return ClassGroupService(db).get_centralizer(class_id)

@router.get("/classes/{class_id}/diary")
def read_class_diary(class_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return ClassGroupService(db).get_diary(class_id)

@router.post("/classes/{class_id}/students/bulk")
def create_students_bulk(class_id: int, payload: List[str], db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    from app.infrastructure.db_models import StudentDB
    created_students = []
    for full_name in payload:
        name_parts = full_name.strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        student = StudentDB(
            first_name=first_name,
            last_name=last_name,
            course="N/A",
            tutor_name="N/A",
            tutor_phone="—",
            class_group_id=class_id,
            behavior_score=0,
            is_deleted=False
        )
        db.add(student)
        created_students.append(student)
    db.commit()
    return {"message": f"Successfully created {len(created_students)} students"}

# --- STUDENTS ---
@router.get("/classes/{class_id}/students", response_model=List[Student])
def read_students_by_class(class_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return StudentService(db).get_by_class(class_id)

@router.post("/students", response_model=Student)
def create_student(student: StudentBase, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return StudentService(db).create(student)

@router.put("/students/{student_id}", response_model=Student)
def update_student(student_id: int, student: StudentUpdate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return StudentService(db).update(student_id, student)

@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    StudentService(db).delete(student_id)
    return {"message": "Student soft deleted successfully"}

@router.get("/students/{student_id}/report")
def get_student_report(student_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    report = StudentService(db).get_report(student_id)
    if not report: raise HTTPException(status_code=404, detail="Student not found")
    return report

@router.post("/students/{student_id}/behavior", response_model=Student)
def update_student_behavior(student_id: int, points: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return StudentService(db).update_behavior(student_id, points)

# --- TERMS ---
@router.get("/classes/{class_id}/terms", response_model=List[Term])
def read_terms(class_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return TermService(db).get_by_class(class_id)

@router.post("/terms", response_model=Term)
def create_term(term: TermBase, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return TermService(db).create(term)

@router.put("/terms/{term_id}", response_model=Term)
def update_term(term_id: int, term: TermUpdate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return TermService(db).update(term_id, term)

@router.delete("/terms/{term_id}")
def delete_term(term_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    TermService(db).delete(term_id)
    return {"message": "Term soft deleted successfully"}

# --- UNITS ---
@router.get("/terms/{term_id}/units", response_model=List[Unit])
def read_units(term_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return UnitService(db).get_by_term(term_id)

@router.post("/units", response_model=Unit)
def create_unit(unit: UnitBase, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return UnitService(db).create(unit)

@router.put("/units/{unit_id}", response_model=Unit)
def update_unit(unit_id: int, unit: UnitUpdate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return UnitService(db).update(unit_id, unit)

@router.delete("/units/{unit_id}")
def delete_unit(unit_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    UnitService(db).delete(unit_id)
    return {"message": "Unit soft deleted successfully"}

# --- SESSIONS & ACTIVITIES ---
@router.get("/units/{unit_id}/sessions", response_model=List[SessionModel])
def read_sessions(unit_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return SessionService(db).get_by_unit(unit_id)

@router.post("/sessions", response_model=SessionModel)
def create_session(session: SessionBase, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return SessionService(db).create(session)

@router.get("/sessions/{session_id}", response_model=SessionModel)
def read_session(session_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    service = SessionService(db)
    session = service.repository.get_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.put("/sessions/{session_id}", response_model=SessionModel)
def update_session(session_id: int, session: SessionUpdate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return SessionService(db).update(session_id, session)

@router.delete("/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    SessionService(db).delete(session_id)
    return {"message": "Session soft deleted successfully"}

@router.get("/sessions/{session_id}/context")
def read_session_context(session_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    from app.infrastructure.db_models import SessionDB, UnitDB, TermDB, ClassGroupDB
    session = db.query(SessionDB).filter(SessionDB.id == session_id, SessionDB.is_deleted == False).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    unit = db.query(UnitDB).filter(UnitDB.id == session.unit_id, UnitDB.is_deleted == False).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    term = db.query(TermDB).filter(TermDB.id == unit.term_id, TermDB.is_deleted == False).first()
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")
    class_group = db.query(ClassGroupDB).filter(ClassGroupDB.id == term.class_group_id, ClassGroupDB.is_deleted == False).first()
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return {
        "session": {
            "id": session.id,
            "session_date": session.session_date.isoformat(),
            "is_finalized": session.is_finalized,
            "summary_notes": session.summary_notes
        },
        "unit": {"id": unit.id, "name": unit.name},
        "term": {"id": term.id, "name": term.name},
        "class_group": {"id": class_group.id, "name": class_group.name}
    }

@router.get("/units/{unit_id}/context")
def read_unit_context(unit_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    from app.infrastructure.db_models import UnitDB, TermDB, ClassGroupDB
    unit = db.query(UnitDB).filter(UnitDB.id == unit_id, UnitDB.is_deleted == False).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    term = db.query(TermDB).filter(TermDB.id == unit.term_id, TermDB.is_deleted == False).first()
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")
    class_group = db.query(ClassGroupDB).filter(ClassGroupDB.id == term.class_group_id, ClassGroupDB.is_deleted == False).first()
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return {
        "unit": {"id": unit.id, "name": unit.name},
        "term": {"id": term.id, "name": term.name},
        "class_group": {"id": class_group.id, "name": class_group.name}
    }

@router.get("/terms/{term_id}/context")
def read_term_context(term_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    from app.infrastructure.db_models import TermDB, ClassGroupDB
    term = db.query(TermDB).filter(TermDB.id == term_id, TermDB.is_deleted == False).first()
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")
    class_group = db.query(ClassGroupDB).filter(ClassGroupDB.id == term.class_group_id, ClassGroupDB.is_deleted == False).first()
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return {
        "term": {"id": term.id, "name": term.name},
        "class_group": {"id": class_group.id, "name": class_group.name}
    }

@router.get("/sessions/{session_id}/students", response_model=List[Student])
def read_students_by_session(session_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return SessionService(db).get_students_by_session(session_id)

@router.post("/sessions/{session_id}/attendance")
def mark_attendance(session_id: int, student_id: int, status: str, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return SessionService(db).mark_attendance(session_id, student_id, status)

@router.get("/sessions/{session_id}/attendance")
def get_attendance(session_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return SessionService(db).get_attendance(session_id)

from pydantic import BaseModel
class SyncSheetsRequest(BaseModel):
    sheet_id: str
    tab_name: str

@router.post("/sessions/{session_id}/sync-sheets")
def sync_attendance_to_sheets(session_id: int, req: SyncSheetsRequest, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    try:
        return SessionService(db).sync_session_to_sheets(session_id, req.sheet_id, req.tab_name)
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions/{session_id}/activities", response_model=List[Activity])
def read_activities(session_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return ActivityService(db).get_by_session(session_id)

@router.post("/activities", response_model=Activity)
def create_activity(activity: ActivityBase, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return ActivityService(db).create(activity)

@router.put("/activities/{activity_id}", response_model=Activity)
def update_activity(activity_id: int, activity: ActivityUpdate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return ActivityService(db).update(activity_id, activity)

@router.delete("/activities/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    ActivityService(db).delete(activity_id)
    return {"message": "Activity soft deleted successfully"}

@router.post("/activities/completion", response_model=ActivityCompletion)
def mark_activity_completion(completion: ActivityCompletionBase, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return ActivityService(db).mark_completion(completion)

@router.get("/sessions/{session_id}/completions", response_model=List[ActivityCompletion])
def get_completions(session_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_professor)):
    return ActivityService(db).get_completions_by_session(session_id)

# --- WHATSAPP (MOCK) ---
from pydantic import BaseModel
class WhatsAppPayload(BaseModel):
    tutor_phone: str
    student_name: str
    report_text: str

@router.post("/whatsapp/send")
def send_whatsapp_report(payload: WhatsAppPayload, current_user: UserDB = Depends(get_current_professor)):
    return WhatsAppService.send_report(
        payload.tutor_phone, payload.student_name, payload.report_text
    )

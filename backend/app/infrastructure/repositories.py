from sqlalchemy.orm import Session
from app.infrastructure.db_models import TermDB, ClassGroupDB, StudentDB, SessionDB, ActivityDB, ActivityCompletionDB, UnitDB

class BaseRepository:
    def __init__(self, db: Session, model):
        self.db = db
        self.model = model

    def get_all(self):
        if hasattr(self.model, "is_deleted"):
            return self.db.query(self.model).filter(self.model.is_deleted == False).all()
        return self.db.query(self.model).all()

    def get_by_id(self, id: int):
        query = self.db.query(self.model).filter(self.model.id == id)
        if hasattr(self.model, "is_deleted"):
            query = query.filter(self.model.is_deleted == False)
        return query.first()

    def create(self, obj_in):
        db_obj = self.model(**obj_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj, obj_in):
        obj_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, obj_data[field])
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def soft_delete(self, db_obj):
        if hasattr(db_obj, "is_deleted"):
            db_obj.is_deleted = True
            self.db.commit()
            self.db.refresh(db_obj)
        return db_obj

class ClassGroupRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, ClassGroupDB)
        
    def get_by_professor(self, professor_id: int):
        return self.db.query(ClassGroupDB).filter(
            ClassGroupDB.professor_id == professor_id,
            ClassGroupDB.is_deleted == False
        ).all()

class TermRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, TermDB)
        
    def get_by_class(self, class_group_id: int):
        return self.db.query(TermDB).filter(
            TermDB.class_group_id == class_group_id,
            TermDB.is_deleted == False
        ).all()

class StudentRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, StudentDB)
        
    def get_by_class(self, class_group_id: int):
        return self.db.query(StudentDB).filter(
            StudentDB.class_group_id == class_group_id,
            StudentDB.is_deleted == False
        ).all()

class UnitRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, UnitDB)
        
    def get_by_term(self, term_id: int):
        return self.db.query(UnitDB).filter(
            UnitDB.term_id == term_id,
            UnitDB.is_deleted == False
        ).all()

class SessionRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, SessionDB)
        
    def get_by_unit(self, unit_id: int):
        return self.db.query(SessionDB).filter(
            SessionDB.unit_id == unit_id,
            SessionDB.is_deleted == False
        ).all()

class ActivityRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, ActivityDB)
        
    def get_by_session(self, session_id: int):
        return self.db.query(ActivityDB).filter(
            ActivityDB.session_id == session_id,
            ActivityDB.is_deleted == False
        ).all()

class ActivityCompletionRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, ActivityCompletionDB)
        
    def mark_completion(self, activity_id: int, student_id: int, is_completed: bool, notes: str = None):
        completion = self.db.query(ActivityCompletionDB).filter(
            ActivityCompletionDB.activity_id == activity_id,
            ActivityCompletionDB.student_id == student_id
        ).first()
        
        if completion:
            completion.is_completed = is_completed
            completion.notes = notes
        else:
            completion = ActivityCompletionDB(
                activity_id=activity_id,
                student_id=student_id,
                is_completed=is_completed,
                notes=notes
            )
            self.db.add(completion)
        
        self.db.commit()
        self.db.refresh(completion)
        return completion

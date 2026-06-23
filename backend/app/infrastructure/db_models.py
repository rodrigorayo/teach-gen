from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base

class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, nullable=False) # "ADMIN" or "PROFESSOR"
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    classes = relationship("ClassGroupDB", back_populates="professor")

class ClassGroupDB(Base):
    __tablename__ = "class_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    professor_id = Column(Integer, ForeignKey("users.id"))
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    professor = relationship("UserDB", back_populates="classes")
    students = relationship("StudentDB", back_populates="class_group")
    terms = relationship("TermDB", back_populates="class_group")

class TermDB(Base):
    __tablename__ = "terms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    class_group_id = Column(Integer, ForeignKey("class_groups.id"))
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    class_group = relationship("ClassGroupDB", back_populates="terms")
    units = relationship("UnitDB", back_populates="term")

class StudentDB(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    course = Column(String, nullable=False)
    tutor_name = Column(String, nullable=False)
    tutor_phone = Column(String, nullable=False)
    tutor_email = Column(String, nullable=True)
    behavior_score = Column(Integer, default=0)
    class_group_id = Column(Integer, ForeignKey("class_groups.id"))
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    class_group = relationship("ClassGroupDB", back_populates="students")
    activity_completions = relationship("ActivityCompletionDB", back_populates="student")
    attendances = relationship("AttendanceDB", back_populates="student")

class UnitDB(Base):
    __tablename__ = "units"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    term_id = Column(Integer, ForeignKey("terms.id"))
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    term = relationship("TermDB", back_populates="units")
    sessions = relationship("SessionDB", back_populates="unit")

class SessionDB(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_date = Column(Date, nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"))
    is_deleted = Column(Boolean, default=False, nullable=False)
    is_finalized = Column(Boolean, default=False, nullable=False)
    summary_notes = Column(Text, nullable=True)
    
    unit = relationship("UnitDB", back_populates="sessions")
    activities = relationship("ActivityDB", back_populates="session")
    attendances = relationship("AttendanceDB", back_populates="session")

class AttendanceDB(Base):
    __tablename__ = "attendances"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    status = Column(String, nullable=False) # "P", "F", "A"
    
    session = relationship("SessionDB", back_populates="attendances")
    student = relationship("StudentDB", back_populates="attendances")

class ActivityDB(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    session = relationship("SessionDB", back_populates="activities")
    completions = relationship("ActivityCompletionDB", back_populates="activity")

class ActivityCompletionDB(Base):
    __tablename__ = "activity_completions"
    
    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    is_completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    
    activity = relationship("ActivityDB", back_populates="completions")
    student = relationship("StudentDB", back_populates="activity_completions")

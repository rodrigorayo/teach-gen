from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from enum import Enum

# --- Base Models ---
class DBModelBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[int] = None

# --- Enums ---
class Role(str, Enum):
    ADMIN = "ADMIN"
    PROFESSOR = "PROFESSOR"

# --- User ---
class UserBase(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    role: Role = Role.PROFESSOR
    is_deleted: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[Role] = None
    password: Optional[str] = None
    is_deleted: Optional[bool] = None

class User(DBModelBase, UserBase):
    pass

# --- Class Group (Clase) ---
class ClassGroupBase(BaseModel):
    name: str = Field(..., example="Matemáticas 3ro Medio")
    professor_id: int
    is_deleted: bool = False

class ClassGroupUpdate(BaseModel):
    name: Optional[str] = None
    is_deleted: Optional[bool] = None

class ClassGroup(DBModelBase, ClassGroupBase):
    pass

# --- Term (Gestión) ---
class TermBase(BaseModel):
    name: str = Field(..., example="1er Trimestre")
    start_date: date
    end_date: date
    is_active: bool = True
    class_group_id: int
    is_deleted: bool = False

class TermUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    is_deleted: Optional[bool] = None

class Term(DBModelBase, TermBase):
    pass

# --- Student ---
class StudentBase(BaseModel):
    first_name: str
    last_name: str
    course: str
    tutor_name: str
    tutor_phone: str
    tutor_email: Optional[str] = None
    class_group_id: int
    behavior_score: int = 0
    is_deleted: bool = False

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    course: Optional[str] = None
    tutor_name: Optional[str] = None
    tutor_phone: Optional[str] = None
    tutor_email: Optional[str] = None
    behavior_score: Optional[int] = None
    is_deleted: Optional[bool] = None

class Student(DBModelBase, StudentBase):
    pass

# --- Unit ---
class UnitBase(BaseModel):
    name: str = Field(..., example="Unidad 1: Álgebra")
    term_id: int
    is_deleted: bool = False

class UnitUpdate(BaseModel):
    name: Optional[str] = None
    is_deleted: Optional[bool] = None

class Unit(DBModelBase, UnitBase):
    pass

# --- Session (Día de clases) ---
class SessionBase(BaseModel):
    session_date: date
    unit_id: int
    is_deleted: bool = False
    is_finalized: bool = False
    summary_notes: Optional[str] = None

class SessionUpdate(BaseModel):
    session_date: Optional[date] = None
    is_deleted: Optional[bool] = None
    is_finalized: Optional[bool] = None
    summary_notes: Optional[str] = None

class Session(DBModelBase, SessionBase):
    pass

# --- Attendance ---
class AttendanceBase(BaseModel):
    session_id: int
    student_id: int
    status: str # "P", "F", "A"

class Attendance(DBModelBase, AttendanceBase):
    pass

# --- Activity ---
class ActivityBase(BaseModel):
    title: str = Field(..., example="Lectura Página 40")
    description: Optional[str] = None
    session_id: int
    is_deleted: bool = False

class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_deleted: Optional[bool] = None

class Activity(DBModelBase, ActivityBase):
    pass

# --- Activity Completion (Check de Actividades) ---
class ActivityCompletionBase(BaseModel):
    activity_id: int
    student_id: int
    is_completed: bool
    notes: Optional[str] = None

class ActivityCompletion(DBModelBase, ActivityCompletionBase):
    pass

from datetime import datetime
from .extensions import db

class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class User(db.Model, TimestampMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    vehicles = db.relationship("Vehicle", backref="user", cascade="all, delete-orphan", lazy=True)

class Vehicle(db.Model, TimestampMixin):
    __tablename__ = "vehicles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    nickname = db.Column(db.String(120))
    vin = db.Column(db.String(17), index=True)

    year = db.Column(db.Integer)
    make = db.Column(db.String(120))
    model = db.Column(db.String(120))
    trim = db.Column(db.String(120))
    engine = db.Column(db.String(120))

    service_records = db.relationship("ServiceRecord", backref="vehicle", cascade="all, delete-orphan", lazy=True)
    reminders = db.relationship("Reminder", backref="vehicle", cascade="all, delete-orphan", lazy=True)

class ServiceRecord(db.Model, TimestampMixin):
    __tablename__ = "service_records"

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False, index=True)

    title = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80))
    service_date = db.Column(db.Date, nullable=False)

    mileage = db.Column(db.Integer)
    cost = db.Column(db.Numeric(10, 2))
    notes = db.Column(db.Text)

class Reminder(db.Model, TimestampMixin):
    __tablename__ = "reminders"

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False, index=True)

    title = db.Column(db.String(120), nullable=False)
    due_date = db.Column(db.Date)
    due_mileage = db.Column(db.Integer)

    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    notes = db.Column(db.Text)

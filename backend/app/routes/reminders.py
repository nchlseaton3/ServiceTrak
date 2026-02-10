from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Reminder, Vehicle

reminders_bp = Blueprint("reminders", __name__)
reminders_bp.strict_slashes = False


def reminder_to_dict(r: Reminder):
    return {
        "id": r.id,
        "vehicle_id": r.vehicle_id,
        "title": r.title,
        "due_date": r.due_date.isoformat() if r.due_date else None,
        "due_mileage": r.due_mileage,
        "is_completed": r.is_completed,
        "notes": r.notes,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }


def _parse_date(value):
    if not value:
        return None
    try:
        return date.fromisoformat(value)  # YYYY-MM-DD
    except ValueError:
        return None


@reminders_bp.get("/health")
def health():
    return jsonify({"status": "ok", "service": "reminders"}), 200


# CREATE reminder
@reminders_bp.post("/")
@jwt_required()
def create_reminder():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    vehicle_id = data.get("vehicle_id")
    title = (data.get("title") or "").strip()
    due_date_str = data.get("due_date")
    due_mileage = data.get("due_mileage")

    if not vehicle_id or not title:
        return jsonify({"message": "vehicle_id and title are required."}), 400

    # Require at least one: due_date or due_mileage
    if not due_date_str and due_mileage is None:
        return jsonify({"message": "Provide due_date or due_mileage."}), 400

    due_date = _parse_date(due_date_str)
    if due_date_str and not due_date:
        return jsonify({"message": "due_date must be YYYY-MM-DD."}), 400

    if due_mileage is not None and isinstance(due_mileage, int) and due_mileage < 0:
        return jsonify({"message": "due_mileage must be >= 0."}), 400

    # Ownership check
    vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first()
    if not vehicle:
        return jsonify({"message": "Vehicle not found."}), 404

    reminder = Reminder(
        vehicle_id=vehicle.id,
        title=title,
        due_date=due_date,
        due_mileage=due_mileage,
        notes=(data.get("notes") or "").strip() or None,
    )

    db.session.add(reminder)
    db.session.commit()

    return jsonify({"message": "Reminder created.", "reminder": reminder_to_dict(reminder)}), 201


# READ all reminders (optional filters)
@reminders_bp.get("/")
@jwt_required()
def list_reminders():
    user_id = int(get_jwt_identity())
    vehicle_id = request.args.get("vehicle_id", type=int)
    completed = request.args.get("completed")

    query = Reminder.query.join(Vehicle).filter(Vehicle.user_id == user_id)

    if vehicle_id:
        query = query.filter(Reminder.vehicle_id == vehicle_id)

    if completed is not None:
        if completed.lower() == "true":
            query = query.filter(Reminder.is_completed.is_(True))
        elif completed.lower() == "false":
            query = query.filter(Reminder.is_completed.is_(False))

    reminders = query.order_by(Reminder.created_at.desc()).all()
    return jsonify({"reminders": [reminder_to_dict(r) for r in reminders]}), 200


# READ one reminder
@reminders_bp.get("/<int:reminder_id>")
@jwt_required()
def get_reminder(reminder_id: int):
    user_id = int(get_jwt_identity())

    reminder = (
        Reminder.query
        .join(Vehicle)
        .filter(Reminder.id == reminder_id, Vehicle.user_id == user_id)
        .first()
    )

    if not reminder:
        return jsonify({"message": "Reminder not found."}), 404

    return jsonify({"reminder": reminder_to_dict(reminder)}), 200


# UPDATE reminder
@reminders_bp.put("/<int:reminder_id>")
@jwt_required()
def update_reminder(reminder_id: int):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    reminder = (
        Reminder.query
        .join(Vehicle)
        .filter(Reminder.id == reminder_id, Vehicle.user_id == user_id)
        .first()
    )
    if not reminder:
        return jsonify({"message": "Reminder not found."}), 404

    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({"message": "title cannot be empty."}), 400
        reminder.title = title

    if "due_date" in data:
        new_date = _parse_date(data.get("due_date"))
        if data.get("due_date") and not new_date:
            return jsonify({"message": "due_date must be YYYY-MM-DD."}), 400
        reminder.due_date = new_date

    if "due_mileage" in data:
        mileage = data.get("due_mileage")
        if mileage is not None and isinstance(mileage, int) and mileage < 0:
            return jsonify({"message": "due_mileage must be >= 0."}), 400
        reminder.due_mileage = mileage

    if "is_completed" in data:
        reminder.is_completed = bool(data.get("is_completed"))

    if "notes" in data:
        reminder.notes = (data.get("notes") or "").strip() or None

    # Optional: move reminder to another owned vehicle
    if "vehicle_id" in data and data.get("vehicle_id") is not None:
        new_vehicle_id = data.get("vehicle_id")
        vehicle = Vehicle.query.filter_by(id=new_vehicle_id, user_id=user_id).first()
        if not vehicle:
            return jsonify({"message": "New vehicle not found."}), 404
        reminder.vehicle_id = vehicle.id

    db.session.commit()
    return jsonify({"message": "Reminder updated.", "reminder": reminder_to_dict(reminder)}), 200


# DELETE reminder
@reminders_bp.delete("/<int:reminder_id>")
@jwt_required()
def delete_reminder(reminder_id: int):
    user_id = int(get_jwt_identity())

    reminder = (
        Reminder.query
        .join(Vehicle)
        .filter(Reminder.id == reminder_id, Vehicle.user_id == user_id)
        .first()
    )
    if not reminder:
        return jsonify({"message": "Reminder not found."}), 404

    db.session.delete(reminder)
    db.session.commit()
    return jsonify({"message": "Reminder deleted."}), 200

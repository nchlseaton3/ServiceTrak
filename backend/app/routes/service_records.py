from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import ServiceRecord, Vehicle

service_records_bp = Blueprint("service_records", __name__)
service_records_bp.strict_slashes = False


def service_record_to_dict(r: ServiceRecord):
    return {
        "id": r.id,
        "vehicle_id": r.vehicle_id,
        "title": r.title,
        "category": r.category,
        "service_date": r.service_date.isoformat() if r.service_date else None,
        "mileage": r.mileage,
        "cost": float(r.cost) if r.cost is not None else None,
        "notes": r.notes,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }


def _parse_date(value):
    if not value:
        return None
    try:
        return date.fromisoformat(value)  # expects YYYY-MM-DD
    except ValueError:
        return None


@service_records_bp.get("/health")
def health():
    return jsonify({"status": "ok", "service": "service_records"}), 200


# CREATE service record
@service_records_bp.post("/")
@jwt_required()
def create_service_record():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    vehicle_id = data.get("vehicle_id")
    title = (data.get("title") or "").strip()
    category = (data.get("category") or "").strip() or None
    service_date_str = data.get("service_date")

    if not vehicle_id or not title or not service_date_str:
        return jsonify({"message": "vehicle_id, title, and service_date are required."}), 400

    service_date = _parse_date(service_date_str)
    if not service_date:
        return jsonify({"message": "service_date must be YYYY-MM-DD."}), 400

    # Ownership check: vehicle must belong to logged-in user
    vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first()
    if not vehicle:
        return jsonify({"message": "Vehicle not found."}), 404

    mileage = data.get("mileage")
    cost = data.get("cost")
    notes = (data.get("notes") or "").strip() or None

    if mileage is not None and isinstance(mileage, int) and mileage < 0:
        return jsonify({"message": "mileage must be >= 0."}), 400

    record = ServiceRecord(
        vehicle_id=vehicle.id,
        title=title,
        category=category,
        service_date=service_date,
        mileage=mileage,
        cost=cost,
        notes=notes,
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({"message": "Service record created.", "service_record": service_record_to_dict(record)}), 201


# READ all service records (optional filters: vehicle_id)
@service_records_bp.get("/")
@jwt_required()
def list_service_records():
    user_id = int(get_jwt_identity())
    vehicle_id = request.args.get("vehicle_id", type=int)

    query = ServiceRecord.query.join(Vehicle).filter(Vehicle.user_id == user_id)

    if vehicle_id:
        query = query.filter(ServiceRecord.vehicle_id == vehicle_id)

    records = query.order_by(ServiceRecord.service_date.desc()).all()
    return jsonify({"service_records": [service_record_to_dict(r) for r in records]}), 200


# READ one service record
@service_records_bp.get("/<int:record_id>")
@jwt_required()
def get_service_record(record_id: int):
    user_id = int(get_jwt_identity())

    record = (
        ServiceRecord.query
        .join(Vehicle)
        .filter(ServiceRecord.id == record_id, Vehicle.user_id == user_id)
        .first()
    )

    if not record:
        return jsonify({"message": "Service record not found."}), 404

    return jsonify({"service_record": service_record_to_dict(record)}), 200


# UPDATE service record
@service_records_bp.put("/<int:record_id>")
@jwt_required()
def update_service_record(record_id: int):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    record = (
        ServiceRecord.query
        .join(Vehicle)
        .filter(ServiceRecord.id == record_id, Vehicle.user_id == user_id)
        .first()
    )
    if not record:
        return jsonify({"message": "Service record not found."}), 404

    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({"message": "title cannot be empty."}), 400
        record.title = title

    if "category" in data:
        record.category = (data.get("category") or "").strip() or None

    if "service_date" in data:
        new_date = _parse_date(data.get("service_date"))
        if not new_date:
            return jsonify({"message": "service_date must be YYYY-MM-DD."}), 400
        record.service_date = new_date

    if "mileage" in data:
        mileage = data.get("mileage")
        if mileage is not None and isinstance(mileage, int) and mileage < 0:
            return jsonify({"message": "mileage must be >= 0."}), 400
        record.mileage = mileage

    if "cost" in data:
        record.cost = data.get("cost")

    if "notes" in data:
        record.notes = (data.get("notes") or "").strip() or None

    # Optional: allow moving record to another vehicle that user owns
    if "vehicle_id" in data and data.get("vehicle_id") is not None:
        new_vehicle_id = data.get("vehicle_id")
        vehicle = Vehicle.query.filter_by(id=new_vehicle_id, user_id=user_id).first()
        if not vehicle:
            return jsonify({"message": "New vehicle not found."}), 404
        record.vehicle_id = vehicle.id

    db.session.commit()
    return jsonify({"message": "Service record updated.", "service_record": service_record_to_dict(record)}), 200


# DELETE service record
@service_records_bp.delete("/<int:record_id>")
@jwt_required()
def delete_service_record(record_id: int):
    user_id = int(get_jwt_identity())

    record = (
        ServiceRecord.query
        .join(Vehicle)
        .filter(ServiceRecord.id == record_id, Vehicle.user_id == user_id)
        .first()
    )
    if not record:
        return jsonify({"message": "Service record not found."}), 404

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Service record deleted."}), 200

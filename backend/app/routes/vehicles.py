from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Vehicle

vehicles_bp = Blueprint("vehicles", __name__)


def vehicle_to_dict(v: Vehicle):
    return {
        "id": v.id,
        "user_id": v.user_id,
        "nickname": v.nickname,
        "vin": v.vin,
        "year": v.year,
        "make": v.make,
        "model": v.model,
        "trim": v.trim,
        "engine": v.engine,
        "created_at": v.created_at.isoformat() if v.created_at else None,
        "updated_at": v.updated_at.isoformat() if v.updated_at else None,
    }


@vehicles_bp.get("/health")
def health():
    return jsonify({"status": "ok", "service": "vehicles"}), 200


# CREATE vehicle
@vehicles_bp.post("")
@jwt_required()
def create_vehicle():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    nickname = (data.get("nickname") or "").strip() or None
    vin = (data.get("vin") or "").strip().upper() or None

    # Optional basic VIN validation if provided
    if vin and len(vin) != 17:
        return jsonify({"message": "VIN must be 17 characters."}), 400

    vehicle = Vehicle(
        user_id=user_id,
        nickname=nickname,
        vin=vin,
        year=data.get("year"),
        make=(data.get("make") or "").strip() or None,
        model=(data.get("model") or "").strip() or None,
        trim=(data.get("trim") or "").strip() or None,
        engine=(data.get("engine") or "").strip() or None,
    )
    db.session.add(vehicle)
    db.session.commit()

    return jsonify({"message": "Vehicle created.", "vehicle": vehicle_to_dict(vehicle)}), 201


# READ all vehicles for the logged-in user
@vehicles_bp.get("")
@jwt_required()
def list_vehicles():
    user_id = int(get_jwt_identity())
    vehicles = Vehicle.query.filter_by(user_id=user_id).order_by(Vehicle.created_at.desc()).all()
    return jsonify({"vehicles": [vehicle_to_dict(v) for v in vehicles]}), 200


# READ one vehicle (must belong to user)
@vehicles_bp.get("/<int:vehicle_id>")
@jwt_required()
def get_vehicle(vehicle_id: int):
    user_id = int(get_jwt_identity())
    vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first()

    if not vehicle:
        return jsonify({"message": "Vehicle not found."}), 404

    return jsonify({"vehicle": vehicle_to_dict(vehicle)}), 200


# UPDATE vehicle (must belong to user)
@vehicles_bp.put("/<int:vehicle_id>")
@jwt_required()
def update_vehicle(vehicle_id: int):
    user_id = int(get_jwt_identity())
    vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first()

    if not vehicle:
        return jsonify({"message": "Vehicle not found."}), 404

    data = request.get_json(silent=True) or {}

    if "nickname" in data:
        vehicle.nickname = (data.get("nickname") or "").strip() or None

    if "vin" in data:
        vin = (data.get("vin") or "").strip().upper() or None
        if vin and len(vin) != 17:
            return jsonify({"message": "VIN must be 17 characters."}), 400
        vehicle.vin = vin

    # Decoded/entered details (optional)
    if "year" in data:
        vehicle.year = data.get("year")
    if "make" in data:
        vehicle.make = (data.get("make") or "").strip() or None
    if "model" in data:
        vehicle.model = (data.get("model") or "").strip() or None
    if "trim" in data:
        vehicle.trim = (data.get("trim") or "").strip() or None
    if "engine" in data:
        vehicle.engine = (data.get("engine") or "").strip() or None

    db.session.commit()
    return jsonify({"message": "Vehicle updated.", "vehicle": vehicle_to_dict(vehicle)}), 200


# DELETE vehicle (must belong to user)
@vehicles_bp.delete("/<int:vehicle_id>")
@jwt_required()
def delete_vehicle(vehicle_id: int):
    user_id = int(get_jwt_identity())
    vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first()

    if not vehicle:
        return jsonify({"message": "Vehicle not found."}), 404

    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({"message": "Vehicle deleted."}), 200

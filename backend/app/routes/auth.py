from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__)


def _user_to_dict(user: User):
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }


@auth_bp.get("/health")
def health():
    return jsonify({"status": "ok", "service": "auth"}), 200


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"message": "An account with that email already exists."}), 409

    user = User(
        email=email,
        first_name=first_name or None,
        last_name=last_name or None,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Registration successful.",
        "access_token": access_token,
        "user": _user_to_dict(user),
    }), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password."}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful.",
        "access_token": access_token,
        "user": _user_to_dict(user),
    }), 200


@auth_bp.get("/profile")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    return jsonify({"user": _user_to_dict(user)}), 200


@auth_bp.put("/update")
@jwt_required()
def update_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json(silent=True) or {}

    # Allow updating basic profile info
    if "first_name" in data:
        user.first_name = (data.get("first_name") or "").strip() or None
    if "last_name" in data:
        user.last_name = (data.get("last_name") or "").strip() or None
    if "email" in data:
        new_email = (data.get("email") or "").strip().lower()
        if not new_email:
            return jsonify({"message": "Email cannot be empty."}), 400
        # Prevent duplicate email
        existing = User.query.filter(User.email == new_email, User.id != user.id).first()
        if existing:
            return jsonify({"message": "That email is already in use."}), 409
        user.email = new_email

    # Optional: allow password change
    if "password" in data and data.get("password"):
        user.password_hash = generate_password_hash(data["password"])

    db.session.commit()
    return jsonify({"message": "Profile updated.", "user": _user_to_dict(user)}), 200

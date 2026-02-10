from flask import Blueprint, jsonify

reminders_bp = Blueprint("reminders", __name__)

@reminders_bp.get("/health")
def health():
    return jsonify({"status": "ok", "service": "reminders"}), 200

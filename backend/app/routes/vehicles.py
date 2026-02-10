from flask import Blueprint, jsonify

vehicles_bp = Blueprint("vehicles", __name__)

@vehicles_bp.get("/health")
def health():
    return jsonify({"status": "ok", "service": "vehicles"}), 200

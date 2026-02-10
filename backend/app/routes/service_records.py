from flask import Blueprint, jsonify

service_records_bp = Blueprint("service_records", __name__)

@service_records_bp.get("/health")
def health():
    return jsonify({"status": "ok", "service": "service_records"}), 200

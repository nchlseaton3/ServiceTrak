from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import ServiceRecord, Vehicle, ServiceRecordAttachment
from app.utils.storage import delete_attachment_file
import cloudinary.uploader


attachments_bp = Blueprint("attachments", __name__, url_prefix="/service-records")


def attachment_to_dict(a: ServiceRecordAttachment):
    return {
        "id": a.id,
        "service_record_id": a.service_record_id,
        "file_name": a.file_name,
        "file_url": a.file_url,
        "public_id": a.public_id,
        "file_type": a.file_type,
        "created_at": a.created_at.isoformat() if a.created_at else None,
        "updated_at": a.updated_at.isoformat() if a.updated_at else None,
    }


@attachments_bp.get("/<int:record_id>/attachments")
@jwt_required()
def list_service_record_attachments(record_id: int):
    user_id = int(get_jwt_identity())

    record = (
        ServiceRecord.query.join(Vehicle, ServiceRecord.vehicle_id == Vehicle.id)
        .filter(ServiceRecord.id == record_id, Vehicle.user_id == user_id)
        .first()
    )

    if not record:
        return jsonify({"message": "Service record not found."}), 404

    return jsonify({
        "attachments": [attachment_to_dict(a) for a in record.attachments]
    }), 200


@attachments_bp.post("/<int:record_id>/attachments")
@jwt_required()
def upload_service_record_attachment(record_id: int):
    user_id = int(get_jwt_identity())

    record = (
        ServiceRecord.query.join(Vehicle, ServiceRecord.vehicle_id == Vehicle.id)
        .filter(ServiceRecord.id == record_id, Vehicle.user_id == user_id)
        .first()
    )

    if not record:
        return jsonify({"message": "Service record not found."}), 404
    

    if "file" not in request.files:
        return jsonify({"message": "No file uploaded."}), 400

    file = request.files["file"]

    if not file or file.filename == "":
        return jsonify({"message": "No file selected."}), 400

    allowed_extensions = {"jpg", "jpeg", "png", "webp", "pdf"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""

    if ext not in allowed_extensions:
        return jsonify({
            "message": "Only JPG, JPEG, PNG, WEBP, and PDF files are allowed."
        }), 400

    try:
        resource_type = "image" if ext in {"jpg", "jpeg", "png", "webp"} else "raw"

        upload_result = cloudinary.uploader.upload(
            file,
            folder="servicetrak/service-records",
            resource_type=resource_type,
        )

        attachment = ServiceRecordAttachment(
            service_record_id=record.id,
            file_name=file.filename,
            file_url=upload_result.get("secure_url"),
            public_id=upload_result.get("public_id"),
            file_type=file.mimetype,
        )

        db.session.add(attachment)
        db.session.commit()

        return jsonify({
            "message": "Attachment uploaded successfully.",
            "attachment": attachment_to_dict(attachment),
        }), 201

    except Exception as e:
        print("Cloudinary upload failed:", str(e))
        return jsonify({"message": f"Failed to upload attachment: {str(e)}"}), 502


@attachments_bp.delete("/attachments/<int:attachment_id>")
@jwt_required()
def delete_service_record_attachment(attachment_id: int):
    user_id = int(get_jwt_identity())

    attachment = (
        ServiceRecordAttachment.query
        .join(ServiceRecord, ServiceRecordAttachment.service_record_id == ServiceRecord.id)
        .join(Vehicle, ServiceRecord.vehicle_id == Vehicle.id)
        .filter(ServiceRecordAttachment.id == attachment_id, Vehicle.user_id == user_id)
        .first()
    )

    if not attachment:
        return jsonify({"message": "Attachment not found."}), 404

    try:
        delete_attachment_file(attachment)
    except Exception:
        pass

    db.session.delete(attachment)
    db.session.commit()

    return jsonify({"message": "Attachment deleted."}), 200

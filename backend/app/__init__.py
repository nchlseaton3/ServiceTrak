from flask import Flask
import os
from .extensions import init_extensions
from .models import User, Vehicle, ServiceRecord, Reminder, ServiceRecordAttachment  # noqa: F401
from config import Config
import cloudinary


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    instance_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "instance")
    os.makedirs(instance_path, exist_ok=True)

    cloudinary.config(
        cloud_name=app.config.get("CLOUDINARY_CLOUD_NAME"),
        api_key=app.config.get("CLOUDINARY_API_KEY"),
        api_secret=app.config.get("CLOUDINARY_API_SECRET"),
        secure=True,
    )

    init_extensions(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.vehicles import vehicles_bp
    from .routes.service_records import service_records_bp
    from .routes.reminders import reminders_bp
    from .routes.attachments import attachments_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(vehicles_bp, url_prefix="/vehicles")
    app.register_blueprint(service_records_bp, url_prefix="/service-records")
    app.register_blueprint(reminders_bp, url_prefix="/reminders")
    app.register_blueprint(attachments_bp)

    return app

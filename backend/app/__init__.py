from flask import Flask
import os
from .extensions import db, init_extensions
from .models import User, Vehicle, ServiceRecord, Reminder  # noqa: F401
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_extensions(app)

    

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.vehicles import vehicles_bp
    from .routes.service_records import service_records_bp
    from .routes.reminders import reminders_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(vehicles_bp, url_prefix="/vehicles")
    app.register_blueprint(service_records_bp, url_prefix="/service-records")
    app.register_blueprint(reminders_bp, url_prefix="/reminders")

    # Create tables
    with app.app_context():
        db.create_all()

    return app

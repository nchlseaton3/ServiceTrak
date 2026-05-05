from dotenv import load_dotenv
import os

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DEFAULT_CORS_ORIGINS = ",".join(
    [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "https://service-trak.vercel.app",
    ]
)

class Config:
    ENV = os.getenv("FLASK_ENV", "production")
    TESTING = os.getenv("TESTING", "false").lower() == "true"
    IS_DEV = ENV == "development" or TESTING

    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    if IS_DEV:
        SECRET_KEY = SECRET_KEY or "dev-secret-change-me"
        JWT_SECRET_KEY = JWT_SECRET_KEY or "jwt-dev-secret-change-me"
    elif not SECRET_KEY or not JWT_SECRET_KEY:
        raise RuntimeError("SECRET_KEY and JWT_SECRET_KEY must be set outside development.")

    database_url = os.getenv("DATABASE_URL")
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    # SQLite stored in /backend/instance/servicetrak.db
    SQLALCHEMY_DATABASE_URI = database_url or (
        "sqlite:///" + os.path.join(BASE_DIR, "instance", "servicetrak.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
        if origin.strip()
    ]

    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

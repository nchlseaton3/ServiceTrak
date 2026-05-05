from app.models import ServiceRecordAttachment
from app.extensions import db

from conftest import auth_header, register_user


def create_vehicle(client, token, vin="1HGCM82633A004352"):
    response = client.post(
        "/vehicles/",
        headers=auth_header(token),
        json={"nickname": "Daily", "vin": vin, "year": "2020", "make": "Honda", "model": "Accord"},
    )
    assert response.status_code == 201
    return response.get_json()["vehicle"]


def create_service_record(client, token, vehicle_id):
    response = client.post(
        "/service-records/",
        headers=auth_header(token),
        json={
            "vehicle_id": vehicle_id,
            "title": "Oil Change",
            "service_date": "2026-01-15",
            "mileage": "12000",
            "cost": "89.50",
        },
    )
    assert response.status_code == 201
    return response.get_json()["service_record"]


def create_reminder(client, token, vehicle_id):
    response = client.post(
        "/reminders/",
        headers=auth_header(token),
        json={"vehicle_id": vehicle_id, "title": "Rotate tires", "due_mileage": "15000"},
    )
    assert response.status_code == 201
    return response.get_json()["reminder"]


def test_user_cannot_access_another_users_vehicle(client):
    owner_token = register_user(client, "owner@example.com")
    other_token = register_user(client, "other@example.com")
    vehicle = create_vehicle(client, owner_token)

    response = client.get(f"/vehicles/{vehicle['id']}", headers=auth_header(other_token))
    assert response.status_code == 404

    response = client.put(
        f"/vehicles/{vehicle['id']}",
        headers=auth_header(other_token),
        json={"nickname": "Mine now"},
    )
    assert response.status_code == 404

    response = client.delete(f"/vehicles/{vehicle['id']}", headers=auth_header(other_token))
    assert response.status_code == 404


def test_user_cannot_access_another_users_service_records_or_attachments(client, app):
    owner_token = register_user(client, "owner@example.com")
    other_token = register_user(client, "other@example.com")
    vehicle = create_vehicle(client, owner_token)
    record = create_service_record(client, owner_token, vehicle["id"])

    with app.app_context():
        attachment = ServiceRecordAttachment(
            service_record_id=record["id"],
            file_name="receipt.pdf",
            file_url="https://example.com/receipt.pdf",
            public_id="receipt-public-id",
            file_type="application/pdf",
        )
        db.session.add(attachment)
        db.session.commit()

    response = client.get(f"/service-records/{record['id']}", headers=auth_header(other_token))
    assert response.status_code == 404

    response = client.get(
        f"/service-records/{record['id']}/attachments",
        headers=auth_header(other_token),
    )
    assert response.status_code == 404


def test_user_cannot_access_another_users_reminder(client):
    owner_token = register_user(client, "owner@example.com")
    other_token = register_user(client, "other@example.com")
    vehicle = create_vehicle(client, owner_token)
    reminder = create_reminder(client, owner_token, vehicle["id"])

    response = client.get(f"/reminders/{reminder['id']}", headers=auth_header(other_token))
    assert response.status_code == 404


def test_negative_numeric_strings_are_rejected(client):
    token = register_user(client)
    vehicle = create_vehicle(client, token)

    response = client.post(
        "/service-records/",
        headers=auth_header(token),
        json={
            "vehicle_id": vehicle["id"],
            "title": "Bad mileage",
            "service_date": "2026-01-15",
            "mileage": "-1",
        },
    )
    assert response.status_code == 400

    response = client.post(
        "/reminders/",
        headers=auth_header(token),
        json={"vehicle_id": vehicle["id"], "title": "Bad mileage", "due_mileage": "-1"},
    )
    assert response.status_code == 400

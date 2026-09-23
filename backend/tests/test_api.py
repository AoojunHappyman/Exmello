import os
from datetime import timedelta
from uuid import UUID

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-only-0123456789abcdef0123456789")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import FocusSession, RecommendationRule, utcnow
from app.seed import seed


@pytest.fixture
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        seed(db)

    def test_db():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = test_db
    with TestClient(app) as test_client:
        yield test_client, engine
    app.dependency_overrides.clear()
    engine.dispose()


def register(client: TestClient, email: str = "student@example.com") -> str:
    response = client.post("/api/auth/register", json={"email": email, "password": "strong-password-123"})
    assert response.status_code == 201, response.text
    return response.json()["token"]


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_health_auth_and_resources(client):
    api, _ = client
    assert api.get("/api/health").json() == {"status": "ok"}
    preflight = api.options("/api/checkins", headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"})
    assert preflight.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert api.get("/api/auth/me").status_code == 401
    token = register(api)
    assert api.get("/api/auth/me", headers=auth(token)).json()["email"] == "student@example.com"
    assert api.post("/api/auth/register", json={"email": "student@example.com", "password": "strong-password-123"}).status_code == 409
    assert api.post("/api/auth/login", json={"email": "student@example.com", "password": "wrong"}).status_code == 401
    login = api.post("/api/auth/login", json={"email": "student@example.com", "password": "strong-password-123"})
    assert login.status_code == 200 and login.json()["token"]
    resources = api.get("/api/resources?category=study").json()
    assert len(resources) == 2
    assert api.get("/api/resources/5-minute-brain-reset").status_code == 200
    assert api.get("/api/resources/missing").status_code == 404


def test_checkin_multiple_concerns_priority_and_isolation(client):
    api, engine = client
    first = register(api, "first@example.com")
    second = register(api, "second@example.com")
    body = {"mood": "overwhelmed", "concerns": ["cant_remember", "running_out_of_time"], "needs": ["calm"]}
    created = api.post("/api/checkins", json=body, headers=auth(first))
    assert created.status_code == 201, created.text
    record = created.json()
    assert record["concerns"] == body["concerns"]
    assert record["recommendation"]["id"] == "need-calm"
    assert len(api.get("/api/checkins", headers=auth(first)).json()) == 1
    assert api.get(f"/api/checkins/{record['id']}", headers=auth(second)).status_code == 404
    assert api.get(f"/api/recommendations/{record['recommendation_id']}", headers=auth(second)).status_code == 404
    assert api.get(f"/api/recommendations/{record['recommendation_id']}", headers=auth(first)).json()["id"] == "need-calm"
    assert api.get("/api/checkins", headers=auth(second)).json() == []

    no_need = api.post("/api/checkins", json={"mood": "overwhelmed", "concerns": body["concerns"]}, headers=auth(first))
    assert no_need.json()["recommendation"]["id"] == "concern-time"
    mood = api.post("/api/checkins", json={"mood": "overwhelmed", "concerns": ["other"]}, headers=auth(first))
    assert mood.json()["recommendation"]["id"] == "mood-overwhelmed"
    with Session(engine) as db:
        db.query(RecommendationRule).filter(RecommendationRule.target_type != "fallback").update({"active": False})
        db.commit()
    fallback = api.post("/api/checkins", json={"mood": "great", "concerns": ["other"]}, headers=auth(first))
    assert fallback.json()["recommendation"]["id"] == "fallback"
    assert api.get("/api/dashboard", headers=auth(first)).json()["total_checkins"] == 4
    assert api.get("/api/dashboard", headers=auth(second)).json()["total_checkins"] == 0


def test_checkin_validation_and_database_rule_edit(client):
    api, engine = client
    token = register(api)
    bad = [
        {"mood": "invalid", "concerns": ["other"]},
        {"mood": "okay", "concerns": []},
        {"mood": "okay", "concerns": ["other"] * 4},
        {"mood": "okay", "concerns": ["other", "other"]},
        {"mood": "okay", "concerns": ["not-a-concern"]},
        {"mood": "okay", "concerns": ["other"], "needs": ["not-a-need"]},
    ]
    for body in bad:
        assert api.post("/api/checkins", json=body, headers=auth(token)).status_code == 422
    assert api.post("/api/checkins", json={"mood": "okay", "concerns": ["other"]}).status_code == 401
    with Session(engine) as db:
        db.get(RecommendationRule, "need-focus").payload = {"id": "edited-in-db", "headline": "Updated", "message": "Updated", "primaryAction": {"type": "focus", "label": "Go", "path": "/focus"}, "secondaryActions": []}
        db.commit()
    response = api.post("/api/checkins", json={"mood": "okay", "concerns": ["other"], "needs": ["focus"]}, headers=auth(token))
    assert response.json()["recommendation"]["id"] == "edited-in-db"


def test_focus_start_completion_cancel_and_isolation(client):
    api, engine = client
    first = register(api, "first@example.com")
    second = register(api, "second@example.com")
    response = api.post("/api/focus-sessions", json={"duration_minutes": 15}, headers=auth(first))
    assert response.status_code == 201
    session = response.json()
    assert session["status"] == "in_progress" and session["completed_at"] is None
    assert api.patch(f"/api/focus-sessions/{session['id']}", json={"status": "completed"}, headers=auth(first)).status_code == 409
    assert api.patch(f"/api/focus-sessions/{session['id']}", json={"status": "cancelled"}, headers=auth(second)).status_code == 404
    with Session(engine) as db:
        record = db.get(FocusSession, UUID(session["id"]))
        record.started_at = utcnow() - timedelta(minutes=16)
        db.commit()
    complete = api.patch(f"/api/focus-sessions/{session['id']}", json={"status": "completed"}, headers=auth(first))
    assert complete.status_code == 200 and complete.json()["completed_at"]
    assert api.patch(f"/api/focus-sessions/{session['id']}", json={"status": "cancelled"}, headers=auth(first)).status_code == 409
    assert api.get("/api/dashboard", headers=auth(first)).json()["completed_focus_minutes"] == 15
    assert api.get("/api/focus-sessions", headers=auth(second)).json() == []
    second_session = api.post("/api/focus-sessions", json={"duration_minutes": 25}, headers=auth(first)).json()
    cancelled = api.patch(f"/api/focus-sessions/{second_session['id']}", json={"status": "cancelled"}, headers=auth(first))
    assert cancelled.json()["status"] == "cancelled" and cancelled.json()["completed_at"] is None


def test_account_deletion_removes_owned_data(client):
    api, _ = client
    token = register(api)
    created = api.post("/api/checkins", json={"mood": "okay", "concerns": ["other"]}, headers=auth(token)).json()
    assert api.delete("/api/auth/me", headers=auth(token)).status_code == 204
    assert api.get("/api/auth/me", headers=auth(token)).status_code == 401
    replacement = register(api)
    assert api.get(f"/api/checkins/{created['id']}", headers=auth(replacement)).status_code == 404

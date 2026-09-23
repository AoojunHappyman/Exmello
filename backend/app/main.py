from datetime import timezone
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, selectinload

from app.config import get_settings
from app.database import get_db
from app.models import Checkin, CheckinConcern, CheckinNeed, FocusSession, Recommendation, Resource, User, utcnow
from app.recommendation import choose_rule
from app.schemas import AuthResponse, CheckinCreate, CheckinRead, DashboardRead, FocusCreate, FocusRead, FocusUpdate, LoginRequest, RegisterRequest, ResourceRead, UserRead
from app.security import create_token, current_user, hash_password, verify_password


def checkin_query():
    return select(Checkin).options(selectinload(Checkin.concerns), selectinload(Checkin.needs), selectinload(Checkin.recommendation))


def checkin_read(checkin: Checkin) -> CheckinRead:
    return CheckinRead(
        id=checkin.id,
        mood=checkin.mood,
        concerns=[item.concern for item in checkin.concerns],
        needs=[item.need for item in checkin.needs],
        created_at=checkin.created_at,
        recommendation_id=checkin.recommendation.id,
        recommendation=checkin.recommendation.payload,
    )


def resource_read(resource: Resource) -> ResourceRead:
    return ResourceRead(
        id=resource.id,
        title=resource.title,
        category=resource.category,
        categoryLabel=resource.category_label,
        readingTimeMinutes=resource.reading_time_minutes,
        summary=resource.description,
        coverImage=resource.cover_image,
        badge=resource.badge,
        contentMarkdown=resource.content_markdown,
        keyTakeaways=resource.key_takeaways,
        suggestedAction=resource.suggested_action,
        created_at=resource.created_at,
        updated_at=resource.updated_at,
    )


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="EXMELLO API", version="1.0.0")
    app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_credentials=True, allow_methods=["GET", "POST", "PATCH", "DELETE"], allow_headers=["Authorization", "Content-Type"])

    @app.get("/api/health")
    def health(db: Session = Depends(get_db)) -> dict[str, str]:
        try:
            db.execute(text("SELECT 1"))
        except SQLAlchemyError:
            raise HTTPException(status_code=503, detail="Database unavailable") from None
        return {"status": "ok"}

    @app.post("/api/auth/register", response_model=AuthResponse, status_code=201)
    def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
        user = User(email=payload.email, hashed_password=hash_password(payload.password), full_name=payload.full_name)
        db.add(user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Email already registered") from None
        db.refresh(user)
        return AuthResponse(user=UserRead.model_validate(user), token=create_token(user.id))

    @app.post("/api/auth/login", response_model=AuthResponse)
    def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
        user = db.scalar(select(User).where(User.email == payload.email.strip().lower()))
        if user is None or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return AuthResponse(user=UserRead.model_validate(user), token=create_token(user.id))

    @app.get("/api/auth/me", response_model=UserRead)
    def me(user: User = Depends(current_user)) -> User:
        return user

    @app.delete("/api/auth/me", status_code=204)
    def delete_account(user: User = Depends(current_user), db: Session = Depends(get_db)) -> None:
        db.delete(user)
        db.commit()

    @app.post("/api/checkins", response_model=CheckinRead, status_code=201)
    def create_checkin(payload: CheckinCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> CheckinRead:
        try:
            rule = choose_rule(db, payload)
        except RuntimeError:
            raise HTTPException(status_code=503, detail="Recommendation rules unavailable") from None
        checkin = Checkin(user_id=user.id, mood=payload.mood)
        checkin.concerns = [CheckinConcern(concern=value, position=position) for position, value in enumerate(payload.concerns)]
        checkin.needs = [CheckinNeed(need=value) for value in payload.needs]
        checkin.recommendation = Recommendation(rule_id=rule.id, payload=rule.payload.copy())
        db.add(checkin)
        db.commit()
        result = db.scalar(checkin_query().where(Checkin.id == checkin.id))
        return checkin_read(result)

    @app.get("/api/checkins", response_model=list[CheckinRead])
    def list_checkins(user: User = Depends(current_user), db: Session = Depends(get_db), limit: int = Query(default=50, ge=1, le=100)) -> list[CheckinRead]:
        records = db.scalars(checkin_query().where(Checkin.user_id == user.id).order_by(Checkin.created_at.desc()).limit(limit)).all()
        return [checkin_read(record) for record in records]

    @app.get("/api/checkins/{checkin_id}", response_model=CheckinRead)
    def get_checkin(checkin_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)) -> CheckinRead:
        record = db.scalar(checkin_query().where(Checkin.id == checkin_id, Checkin.user_id == user.id))
        if record is None:
            raise HTTPException(status_code=404, detail="Check-in not found")
        return checkin_read(record)

    @app.get("/api/recommendations/{recommendation_id}")
    def get_recommendation(recommendation_id: UUID, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
        recommendation = db.scalar(select(Recommendation).join(Checkin).where(Recommendation.id == recommendation_id, Checkin.user_id == user.id))
        if recommendation is None:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        return recommendation.payload

    @app.post("/api/focus-sessions", response_model=FocusRead, status_code=201)
    def start_focus(payload: FocusCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> FocusSession:
        session = FocusSession(user_id=user.id, duration_minutes=payload.duration_minutes, session_type=payload.session_type, status="in_progress")
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @app.patch("/api/focus-sessions/{session_id}", response_model=FocusRead)
    def finish_focus(session_id: UUID, payload: FocusUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> FocusSession:
        session = db.scalar(select(FocusSession).where(FocusSession.id == session_id, FocusSession.user_id == user.id).with_for_update())
        if session is None:
            raise HTTPException(status_code=404, detail="Focus session not found")
        if session.status != "in_progress":
            raise HTTPException(status_code=409, detail="Focus session already finished")
        now = utcnow()
        started = session.started_at.replace(tzinfo=timezone.utc) if session.started_at.tzinfo is None else session.started_at
        if payload.status == "completed" and (now - started).total_seconds() < session.duration_minutes * 60:
            raise HTTPException(status_code=409, detail="Focus timer has not completed")
        session.status = payload.status
        session.completed_at = now if payload.status == "completed" else None
        db.commit()
        db.refresh(session)
        return session

    @app.get("/api/focus-sessions", response_model=list[FocusRead])
    def list_focus(user: User = Depends(current_user), db: Session = Depends(get_db), limit: int = Query(default=50, ge=1, le=100)) -> list[FocusSession]:
        return list(db.scalars(select(FocusSession).where(FocusSession.user_id == user.id).order_by(FocusSession.started_at.desc()).limit(limit)).all())

    @app.get("/api/resources", response_model=list[ResourceRead])
    def list_resources(db: Session = Depends(get_db), category: str | None = Query(default=None, max_length=50)) -> list[ResourceRead]:
        query = select(Resource).where(Resource.published.is_(True))
        if category:
            query = query.where(Resource.category == category)
        return [resource_read(item) for item in db.scalars(query.order_by(Resource.created_at.desc())).all()]

    @app.get("/api/resources/{resource_id}", response_model=ResourceRead)
    def get_resource(resource_id: str, db: Session = Depends(get_db)) -> ResourceRead:
        resource = db.scalar(select(Resource).where(Resource.id == resource_id, Resource.published.is_(True)))
        if resource is None:
            raise HTTPException(status_code=404, detail="Resource not found")
        return resource_read(resource)

    @app.get("/api/dashboard", response_model=DashboardRead)
    def dashboard(user: User = Depends(current_user), db: Session = Depends(get_db)) -> DashboardRead:
        total_checkins = db.scalar(select(func.count()).select_from(Checkin).where(Checkin.user_id == user.id)) or 0
        recent = db.scalar(checkin_query().where(Checkin.user_id == user.id).order_by(Checkin.created_at.desc()).limit(1))
        total_focus = db.scalar(select(func.count()).select_from(FocusSession).where(FocusSession.user_id == user.id)) or 0
        completed_focus = db.scalar(select(func.count()).select_from(FocusSession).where(FocusSession.user_id == user.id, FocusSession.status == "completed")) or 0
        minutes = db.scalar(select(func.coalesce(func.sum(FocusSession.duration_minutes), 0)).where(FocusSession.user_id == user.id, FocusSession.status == "completed")) or 0
        return DashboardRead(total_checkins=total_checkins, recent_checkin=checkin_read(recent) if recent else None, total_focus_sessions=total_focus, completed_focus_sessions=completed_focus, completed_focus_minutes=minutes)

    return app


app = create_app()

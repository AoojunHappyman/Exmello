import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    checkins: Mapped[list["Checkin"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    focus_sessions: Mapped[list["FocusSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Checkin(Base):
    __tablename__ = "checkins"
    __table_args__ = (CheckConstraint("mood IN ('great','good','okay','stressed','overwhelmed')", name="valid_mood"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mood: Mapped[str] = mapped_column(String(30), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    user: Mapped[User] = relationship(back_populates="checkins")
    concerns: Mapped[list["CheckinConcern"]] = relationship(back_populates="checkin", cascade="all, delete-orphan", order_by="CheckinConcern.position")
    needs: Mapped[list["CheckinNeed"]] = relationship(back_populates="checkin", cascade="all, delete-orphan")
    recommendation: Mapped["Recommendation | None"] = relationship(back_populates="checkin", cascade="all, delete-orphan", uselist=False)


class CheckinConcern(Base):
    __tablename__ = "checkin_concerns"
    __table_args__ = (
        UniqueConstraint("checkin_id", "concern", name="uq_checkin_concern"),
        UniqueConstraint("checkin_id", "position", name="uq_checkin_concern_position"),
        CheckConstraint("position BETWEEN 0 AND 2", name="valid_concern_position"),
        CheckConstraint("concern IN ('cant_finish','cant_remember','running_out_of_time','didnt_sleep','worried_exam','racing_thoughts','exhausted','other')", name="valid_concern"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    checkin_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("checkins.id", ondelete="CASCADE"), nullable=False, index=True)
    concern: Mapped[str] = mapped_column(String(50), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    checkin: Mapped[Checkin] = relationship(back_populates="concerns")


class CheckinNeed(Base):
    __tablename__ = "checkin_needs"
    __table_args__ = (
        UniqueConstraint("checkin_id", "need", name="uq_checkin_need"),
        UniqueConstraint("checkin_id", name="uq_checkin_single_need"),
        CheckConstraint("need IN ('focus','calm','break','motivated')", name="valid_need"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    checkin_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("checkins.id", ondelete="CASCADE"), nullable=False, index=True)
    need: Mapped[str] = mapped_column(String(50), nullable=False)
    checkin: Mapped[Checkin] = relationship(back_populates="needs")


class RecommendationRule(Base):
    __tablename__ = "recommendation_rules"
    __table_args__ = (
        CheckConstraint("target_type IN ('need','concern','mood','fallback')", name="valid_rule_target"),
        Index("ix_recommendation_rules_lookup", "target_type", "target_value", "active", "priority"),
    )

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    target_type: Mapped[str] = mapped_column(String(20), nullable=False)
    target_value: Mapped[str | None] = mapped_column(String(50))
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    checkin_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("checkins.id", ondelete="CASCADE"), unique=True, nullable=False)
    rule_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("recommendation_rules.id", ondelete="SET NULL"))
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    checkin: Mapped[Checkin] = relationship(back_populates="recommendation")


class FocusSession(Base):
    __tablename__ = "focus_sessions"
    __table_args__ = (
        CheckConstraint("duration_minutes BETWEEN 1 AND 180", name="valid_focus_duration"),
        CheckConstraint("status IN ('in_progress','completed','cancelled')", name="valid_focus_status"),
        CheckConstraint("session_type = 'focus'", name="valid_focus_type"),
        Index("ix_focus_sessions_user_started", "user_id", "started_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="in_progress")
    session_type: Mapped[str] = mapped_column(String(20), nullable=False, default="focus")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    user: Mapped[User] = relationship(back_populates="focus_sessions")


class Resource(Base):
    __tablename__ = "resources"
    __table_args__ = (CheckConstraint("reading_time_minutes >= 1", name="valid_reading_time"),)

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    category_label: Mapped[str] = mapped_column(String(100), nullable=False)
    content_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    reading_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    cover_image: Mapped[str | None] = mapped_column(Text)
    badge: Mapped[str | None] = mapped_column(String(100))
    key_takeaways: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    suggested_action: Mapped[dict | None] = mapped_column(JSON)
    published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

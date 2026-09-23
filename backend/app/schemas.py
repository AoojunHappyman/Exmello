from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

Mood = Literal["great", "good", "okay", "stressed", "overwhelmed"]
Concern = Literal["cant_finish", "cant_remember", "running_out_of_time", "didnt_sleep", "worried_exam", "racing_thoughts", "exhausted", "other"]
Need = Literal["focus", "calm", "break", "motivated"]


class RegisterRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=100)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if value.count("@") != 1 or "." not in value.split("@", 1)[1] or " " in value:
            raise ValueError("Invalid email address")
        return value


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str | None
    created_at: datetime


class AuthResponse(BaseModel):
    user: UserRead
    token: str
    token_type: Literal["bearer"] = "bearer"


class CheckinCreate(BaseModel):
    mood: Mood
    concerns: list[Concern] = Field(min_length=1, max_length=3)
    needs: list[Need] = Field(default_factory=list, max_length=1)

    @field_validator("concerns")
    @classmethod
    def unique_concerns(cls, value: list[Concern]) -> list[Concern]:
        if len(value) != len(set(value)):
            raise ValueError("Duplicate concerns are not allowed")
        return value


class CheckinRead(BaseModel):
    id: UUID
    mood: Mood
    concerns: list[Concern]
    needs: list[Need]
    created_at: datetime
    recommendation_id: UUID
    recommendation: dict


class FocusCreate(BaseModel):
    duration_minutes: int = Field(default=25, ge=1, le=180)
    session_type: Literal["focus"] = "focus"


class FocusUpdate(BaseModel):
    status: Literal["completed", "cancelled"]


class FocusRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    duration_minutes: int
    session_type: str
    status: str
    started_at: datetime
    completed_at: datetime | None


class ResourceRead(BaseModel):
    id: str
    title: str
    category: str
    categoryLabel: str
    readingTimeMinutes: int
    summary: str
    coverImage: str | None
    badge: str | None
    contentMarkdown: str
    keyTakeaways: list[str]
    suggestedAction: dict | None
    created_at: datetime
    updated_at: datetime


class DashboardRead(BaseModel):
    total_checkins: int
    recent_checkin: CheckinRead | None
    total_focus_sessions: int
    completed_focus_sessions: int
    completed_focus_minutes: int

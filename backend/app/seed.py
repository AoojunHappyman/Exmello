"""Idempotent starter content. Runtime recommendation and resource reads use the database."""

import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.database import get_engine
from app.models import RecommendationRule, Resource


def action(kind: str, label: str, path: str, duration: int | None = None) -> dict:
    result = {"type": kind, "label": label, "path": path}
    if duration is not None:
        result["durationMinutes"] = duration
    return result


def rule(identifier: str, target_type: str, target_value: str | None, priority: int, headline: str, message: str, primary: dict, secondary: list[dict]) -> RecommendationRule:
    return RecommendationRule(
        id=identifier, target_type=target_type, target_value=target_value, priority=priority,
        payload={"id": identifier, "headline": headline, "message": message, "primaryAction": primary, "secondaryActions": secondary},
    )


BREATH = action("breathing", "ฝึกหายใจ 3 นาที →", "/breathing", 3)
FOCUS_15 = action("focus", "เริ่มโฟกัส 15 นาที →", "/focus?duration=15", 15)
FOCUS_25 = action("focus", "เริ่มโฟกัส 25 นาที →", "/focus?duration=25", 25)
RESET = action("reset", "พักและรีเซ็ตตัวเอง →", "/reset", 2)

RULES = [
    rule("need-focus", "need", "focus", 0, "เริ่มจากงานเล็ก ๆ ตรงหน้า", "เลือกหนึ่งสิ่งที่ทำได้ในช่วงสั้น ๆ นี้", FOCUS_25, [BREATH]),
    rule("need-calm", "need", "calm", 0, "พักหายใจก่อนนะ", "ให้เวลาตัวเองกลับมาอยู่กับปัจจุบัน", BREATH, [RESET]),
    rule("need-break", "need", "break", 0, "พักได้โดยไม่ต้องรู้สึกผิด", "ช่วงพักสั้น ๆ ช่วยให้กลับมาทำต่อได้", RESET, [BREATH]),
    rule("need-motivated", "need", "motivated", 0, "ก้าวแรกเล็ก ๆ ก็พอ", "ลองเริ่มต้นเพียงสิบห้านาที", FOCUS_15, [RESET]),
    rule("concern-time", "concern", "running_out_of_time", 10, "เลือกสิ่งสำคัญที่สุดก่อน", "ทำเพียงหนึ่งหัวข้อในสิบห้านาทีนี้", FOCUS_15, [BREATH]),
    rule("concern-finish", "concern", "cant_finish", 20, "ไม่ต้องทำทั้งหมดในคราวเดียว", "ค่อย ๆ แบ่งงานเป็นช่วงสั้น ๆ", FOCUS_25, [RESET]),
    rule("concern-exam", "concern", "worried_exam", 30, "มาช่วยให้ใจนิ่งลงก่อน", "หายใจช้า ๆ แล้วค่อยเลือกก้าวถัดไป", BREATH, [RESET]),
    rule("concern-sleep", "concern", "didnt_sleep", 40, "ร่างกายต้องการพัก", "ดื่มน้ำและยืดตัวสักครู่", RESET, [BREATH]),
    rule("concern-exhausted", "concern", "exhausted", 50, "พักก่อนก็ได้นะ", "การหยุดพักเป็นส่วนหนึ่งของการดูแลตัวเอง", RESET, [BREATH]),
    rule("concern-thoughts", "concern", "racing_thoughts", 60, "กลับมาอยู่กับลมหายใจ", "ให้ความคิดได้ช้าลงทีละนิด", BREATH, [FOCUS_25]),
    rule("concern-memory", "concern", "cant_remember", 70, "พักสมองสั้น ๆ ก่อน", "จากนั้นค่อยกลับมาทบทวนทีละเรื่อง", RESET, [FOCUS_25]),
    rule("mood-overwhelmed", "mood", "overwhelmed", 0, "หายใจก่อนนะ", "ตอนนี้ให้เวลากับตัวเองสักสามนาที", BREATH, [RESET]),
    rule("mood-stressed", "mood", "stressed", 0, "ช้าลงสักนิด", "หายใจให้สบายแล้วค่อยเริ่มใหม่", BREATH, [FOCUS_15]),
    rule("mood-okay", "mood", "okay", 0, "เริ่มด้วยช่วงสั้น ๆ", "ลองโฟกัสสิบห้านาทีโดยไม่กดดันตัวเอง", FOCUS_15, [RESET]),
    rule("mood-good", "mood", "good", 0, "พร้อมเริ่มช่วงโฟกัส", "เลือกงานหนึ่งอย่างแล้วลงมือทำ", FOCUS_25, [RESET]),
    rule("mood-great", "mood", "great", 0, "ใช้พลังวันนี้อย่างพอดี", "เริ่มงานหนึ่งอย่างและอย่าลืมพัก", FOCUS_25, [RESET]),
    rule("fallback", "fallback", None, 0, "ค่อย ๆ ไปทีละก้าว", "เริ่มจากลมหายใจและสิ่งเล็ก ๆ ที่ทำได้", BREATH, [FOCUS_25]),
]


def seed(db: Session) -> None:
    for item in RULES:
        if db.get(RecommendationRule, item.id) is None:
            db.add(RecommendationRule(id=item.id, target_type=item.target_type, target_value=item.target_value, priority=item.priority, active=True, payload=item.payload))
    resource_file = Path(__file__).resolve().parent.parent / "data" / "resources.json"
    for source in json.loads(resource_file.read_text(encoding="utf-8")):
        data = {
            "id": source["id"], "title": source["title"], "category": source["category"],
            "category_label": source["categoryLabel"], "description": source["summary"],
            "content_markdown": source["contentMarkdown"],
            "reading_time_minutes": source["readingTimeMinutes"], "cover_image": source["coverImage"],
            "badge": source["badge"], "key_takeaways": source["keyTakeaways"],
            "suggested_action": source.get("suggestedAction"), "published": True,
        }
        if db.get(Resource, data["id"]) is None:
            db.add(Resource(**data))
    db.commit()


if __name__ == "__main__":
    with Session(get_engine()) as session:
        seed(session)
    print("Seeded recommendation rules and resources")

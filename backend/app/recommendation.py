from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import RecommendationRule
from app.schemas import CheckinCreate


def choose_rule(db: Session, checkin: CheckinCreate) -> RecommendationRule:
    """Select one database rule: explicit need, concern, mood, fallback."""
    rules = db.scalars(select(RecommendationRule).where(RecommendationRule.active.is_(True))).all()
    by_target = {}
    for rule in sorted(rules, key=lambda item: (item.priority, item.id)):
        by_target.setdefault((rule.target_type, rule.target_value), rule)

    if checkin.needs:
        rule = by_target.get(("need", checkin.needs[0]))
        if rule:
            return rule

    concern_rules = [by_target[("concern", concern)] for concern in checkin.concerns if ("concern", concern) in by_target]
    if concern_rules:
        return min(concern_rules, key=lambda rule: (rule.priority, rule.id))

    for target in (("mood", checkin.mood), ("fallback", None)):
        rule = by_target.get(target)
        if rule:
            return rule
    raise RuntimeError("Recommendation rules are not seeded")

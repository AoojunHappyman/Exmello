"""Apply schema/seed explicitly during production builds, not API cold starts."""
import os
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import NullPool

from app.config import Settings
from app.seed import seed


def main() -> None:
    # Preview builds must use a separate Neon branch and an explicit opt-in.
    if os.getenv("APPLY_MIGRATIONS") != "true":
        print("Schema changes skipped; set APPLY_MIGRATIONS=true for the target environment.")
        return
    target = os.getenv("MIGRATION_DATABASE_URL") or os.environ["DATABASE_URL"]
    os.environ["DATABASE_URL"] = target
    from app.config import get_settings
    get_settings.cache_clear()
    settings = Settings()
    root = Path(__file__).resolve().parent.parent
    config = Config(str(root / "alembic.ini"))
    config.set_main_option("script_location", str(root / "alembic"))
    command.upgrade(config, "head")
    engine = create_engine(settings.database_url, poolclass=NullPool)
    try:
        with Session(engine) as db:
            seed(db)
    finally:
        engine.dispose()
    print("Database schema and starter content are ready.")


if __name__ == "__main__":
    main()

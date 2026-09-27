from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import get_settings


class Base(DeclarativeBase):
    pass


@lru_cache
def get_engine():
    settings = get_settings()
    options = {}
    if settings.database_url.startswith("postgresql"):
        options["connect_args"] = {"connect_timeout": settings.database_connect_timeout}
    if settings.database_pool_mode == "serverless":
        # Neon/PgBouncer owns pooling; do not hold sockets in frozen functions.
        options["poolclass"] = NullPool
    return create_engine(settings.database_url, pool_pre_ping=True, **options)


def get_db() -> Generator[Session, None, None]:
    factory = sessionmaker(bind=get_engine(), expire_on_commit=False)
    with factory() as session:
        yield session

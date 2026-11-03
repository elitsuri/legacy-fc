"""Alembic environment: uses the app's own settings and models. PostgreSQL migrations are serialised with an advisory lock so
several replicas starting together cannot race each other."""
from alembic import context
from sqlalchemy import text

from app import models  # noqa: F401  (register tables)
from app.db import Base, engine

target_metadata = Base.metadata
LOCK_ID = 7_352_001


def run_migrations_online() -> None:
    given = context.config.attributes.get("connection")  # tests pass their own connection
    if given is not None:
        context.configure(connection=given, target_metadata=target_metadata, compare_type=True, render_as_batch=given.dialect.name == "sqlite")
        with context.begin_transaction():
            context.run_migrations()
        return
    with engine.connect() as conn:
        pg = conn.dialect.name == "postgresql"
        if pg:
            conn.execute(text("SELECT pg_advisory_lock(:i)"), {"i": LOCK_ID})
            conn.commit()
        try:
            context.configure(connection=conn, target_metadata=target_metadata, compare_type=True, render_as_batch=conn.dialect.name == "sqlite")
            with context.begin_transaction():
                context.run_migrations()
        finally:
            if pg:
                conn.execute(text("SELECT pg_advisory_unlock(:i)"), {"i": LOCK_ID})
                conn.commit()


run_migrations_online()

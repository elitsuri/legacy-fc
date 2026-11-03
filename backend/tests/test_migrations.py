"""The Alembic migrations must build exactly the schema the models describe (no drift), and be re-runnable."""
from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from pathlib import Path
from sqlalchemy import create_engine, inspect

from app.db import Base

ROOT = Path(__file__).resolve().parent.parent


def _cfg(conn):
    cfg = Config(str(ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(ROOT / "migrations"))
    cfg.attributes["connection"] = conn
    return cfg


def test_migrations_match_the_models(tmp_path):
    eng = create_engine(f"sqlite:///{tmp_path / 'm.db'}")
    with eng.begin() as conn:
        command.upgrade(_cfg(conn), "head")
        command.upgrade(_cfg(conn), "head")  # running it again is a no-op
    with eng.connect() as conn:
        tables = set(inspect(conn).get_table_names())
        assert {"users", "saves", "save_backups", "leaderboard", "orders", "entitlements", "stripe_events", "friendships"} <= tables
        diff = compare_metadata(MigrationContext.configure(conn), Base.metadata)
        assert diff == [], f"models and migrations differ: {diff}"

import os
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime
from pathlib import Path

import psycopg2
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", 5432),
    "dbname": os.getenv("DB_NAME", "oid_registry"),
    "user": os.getenv("DB_USER", "oid_admin"),
    "password": os.environ["DB_PASS"],
}

class OIDEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: str
    name: str
    role: str
    access_level: str
    expires: datetime

BASE_OID = "1.3.6.1.4.1.61026.2"

@contextmanager
def database_cursor():
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        with conn:
            with conn.cursor() as cur:
                yield cur
    finally:
        conn.close()

def ensure_schema():
    migration_sql = Path(__file__).with_name("migrate.sql").read_text(encoding="utf-8")
    with database_cursor() as cur:
        cur.execute("SELECT pg_advisory_xact_lock(hashtext('oid_schema_migrations'))")
        cur.execute(migration_sql)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_schema()
    yield

app = FastAPI(lifespan=lifespan)

def serialize_oid(row):
    return {
        "oid": row[0],
        "user_id": row[1],
        "name": row[2],
        "role": row[3],
        "access_level": row[4],
        "expires": row[5].isoformat(),
        "full_oid": row[6],
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/oids")
def list_oids():
    with database_cursor() as cur:
        cur.execute(
            """
            SELECT oid, user_id, name, role, access_level, expires, full_oid
            FROM oids
            ORDER BY id
            """
        )
        return [serialize_oid(row) for row in cur.fetchall()]

@app.get("/oids/{oid}")
def get_oid(oid: str):
    with database_cursor() as cur:
        cur.execute(
            """
            SELECT oid, user_id, name, role, access_level, expires, full_oid
            FROM oids
            WHERE oid = %s OR full_oid = %s
            """,
            (oid, oid),
        )
        row = cur.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="OID not found")
    return serialize_oid(row)

@app.post("/oids")
def register_oid(entry: OIDEntry):
    with database_cursor() as cur:
        cur.execute("SELECT nextval('oid_suffix_seq')")
        next_suffix = cur.fetchone()[0]
        full_oid = f"{BASE_OID}.{next_suffix}"
        cur.execute(
            """
            INSERT INTO oids (oid, user_id, name, role, access_level, expires, full_oid, parent_oid)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                str(next_suffix),
                entry.user_id,
                entry.name,
                entry.role,
                entry.access_level,
                entry.expires,
                full_oid,
                BASE_OID,
            ),
        )

    return {"status": "registered", "oid": full_oid}

@app.put("/oids/{oid}")
def update_oid(oid: str, entry: OIDEntry):
    with database_cursor() as cur:
        cur.execute(
            """
            UPDATE oids
            SET user_id=%s, name=%s, role=%s, access_level=%s, expires=%s
            WHERE oid=%s OR full_oid=%s
            """,
            (
                entry.user_id,
                entry.name,
                entry.role,
                entry.access_level,
                entry.expires,
                oid,
                oid,
            ),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="OID not found")

    return {"status": "updated"}

@app.delete("/oids/{oid}")
def delete_oid(oid: str):
    with database_cursor() as cur:
        cur.execute("DELETE FROM oids WHERE oid = %s OR full_oid = %s", (oid, oid))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="OID not found")

    return {"status": "deleted"}
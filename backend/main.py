from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import os
from datetime import datetime

app = FastAPI()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", 5432),
    "dbname": os.getenv("DB_NAME", "oid_registry"),
    "user": os.getenv("DB_USER", "oid_admin"),
    "password": os.getenv("DB_PASS", "supersecurepassword")
}

class OIDEntry(BaseModel):
    oid: str | None = None
    user_id: str
    name: str
    role: str
    access_level: str
    expires: str

BASE_OID = "1.3.6.1.4.1.61026.2"

@app.get("/oids")
def list_oids():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("SELECT oid, user_id, name, role, access_level, expires, full_oid FROM oids")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "oid": row[0], "user_id": row[1], "name": row[2],
            "role": row[3], "access_level": row[4],
            "expires": row[5].isoformat(), "full_oid": row[6]
        } for row in rows
    ]

@app.post("/oids")
def register_oid(entry: OIDEntry):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("SELECT MAX(CAST(split_part(full_oid, '.', 7) AS INT)) FROM oids")
    max_suffix = cur.fetchone()[0]
    next_suffix = max_suffix + 1 if max_suffix else 1001
    full_oid = f"{BASE_OID}.{next_suffix}"
    cur.execute("""
        INSERT INTO oids (oid, user_id, name, role, access_level, expires, full_oid, parent_oid)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (str(next_suffix), entry.user_id, entry.name, entry.role, entry.access_level, entry.expires, full_oid, BASE_OID))
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "registered", "oid": full_oid}

@app.put("/oids/{oid}")
def update_oid(oid: str, entry: OIDEntry):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        UPDATE oids SET user_id=%s, name=%s, role=%s, access_level=%s, expires=%s
        WHERE oid=%s
    """, (entry.user_id, entry.name, entry.role, entry.access_level, entry.expires, oid))
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "updated"}

@app.delete("/oids/{oid}")
def delete_oid(oid: str):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("DELETE FROM oids WHERE oid = %s", (oid,))
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "deleted"}
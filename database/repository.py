import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import os

DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')

def get_connection():
    print(f"Conectando ao banco: {DB_NAME}@{DB_HOST}:{DB_PORT} como {DB_USER}")
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )

def insert_weather_data(city, temperature, efficiency):
    sql = """
        INSERT INTO current_weather (city, temperature, efficiency, datetime)
        VALUES (%s, %s, %s, %s)
    """
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(sql, (city, temperature, efficiency, datetime.utcnow()))
    finally:
        conn.close()

def get_weather_history():
    sql = """
        SELECT id, city, temperature, efficiency, datetime FROM current_weather ORDER BY datetime DESC LIMIT 100
    """
    conn = get_connection()
    try:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql)
                results = cur.fetchall()
                return results
    finally:
        conn.close()

def clear_weather_history():
    sql = "DELETE FROM current_weather"
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(sql)
    finally:
        conn.close()

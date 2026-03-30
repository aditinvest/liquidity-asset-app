import psycopg2
from psycopg2 import OperationalError

def test_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            user="postgres",
            password="postgres",
            database="liquidity_asset_db"
        )
        print("✅ Database connection successful!")
        conn.close()
        return True
    except OperationalError as e:
        print(f"❌ Database connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_db_connection()

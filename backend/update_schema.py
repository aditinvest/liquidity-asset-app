import psycopg2

# Database connection
conn = psycopg2.connect(
    host="localhost",
    database="liquidity_asset_db",
    user="postgres",
    password="postgres"
)
cur = conn.cursor()

# Drop the old constraint
cur.execute("ALTER TABLE manual_inputs DROP CONSTRAINT IF EXISTS manual_inputs_input_type_check;")

# Add new constraint with all input types
cur.execute("""
    ALTER TABLE manual_inputs 
    ADD CONSTRAINT manual_inputs_input_type_check 
    CHECK (input_type IN ('SALDO_AWAL', 'CF_OUT', 'SALDO_AWAL_REALISASI', 'CF_OUT_REALISASI'));
""")

conn.commit()
print("Database schema updated successfully!")

cur.close()
conn.close()

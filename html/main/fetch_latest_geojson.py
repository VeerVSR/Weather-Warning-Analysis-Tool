import psycopg2
import json
from datetime import datetime

# PostgreSQL connection parameters
conn = psycopg2.connect(
    dbname="imd",      # Change this if your DB name is different
    user="postgres",
    password="sql123T",   # <-- Replace with your actual DB password
    host="localhost",
    port="5432"
)

# Create cursor
cur = conn.cursor()

# Step 1: Fetch the latest row
cur.execute("""
    SELECT geojson_data
    FROM imd_geojson
    ORDER BY submitted_at DESC
    LIMIT 1
""")

row = cur.fetchone()
if row is None:
    print("❌ No GeoJSON found in the database.")
else:
    geojson_data = row[0]  # This is the JSONB column
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"geojson_{timestamp}.geojson"

    # Step 2: Save it to a .geojson file
    with open(filename, "w") as f:
        json.dump(geojson_data, f, indent=2)

    print(f"✅ Latest GeoJSON saved as {filename}")

# Clean up
cur.close()
conn.close()

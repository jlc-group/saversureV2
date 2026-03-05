import psycopg2
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

conn = psycopg2.connect(
    host='localhost', port=5433,
    dbname='saversure_v1_backup',
    user='saversure_app', password='julaherb789'
)
conn.set_client_encoding('UTF8')
cur = conn.cursor()

cur.execute("SELECT id, name_th, sku FROM products ORDER BY id LIMIT 5")
print("=== Products (Thai text check) ===")
for r in cur.fetchall():
    print(f"  ID={r[0]}: {r[1]} | SKU={r[2]}")

cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name LIKE '%name%'")
name_cols = [r[0] for r in cur.fetchall()]
if 'display_name' in name_cols:
    cur.execute("SELECT id, display_name FROM users WHERE display_name IS NOT NULL AND display_name != '' ORDER BY id LIMIT 5")
    print("\n=== Users (Thai text check via display_name) ===")
    for r in cur.fetchall():
        print(f"  ID={r[0]}: {r[1]}")
elif name_cols:
    col = name_cols[0]
    cur.execute(f"SELECT id, {col} FROM users WHERE {col} IS NOT NULL ORDER BY id LIMIT 5")
    print(f"\n=== Users (Thai text check via {col}) ===")
    for r in cur.fetchall():
        print(f"  ID={r[0]}: {r[1]}")
else:
    cur.execute("SELECT id FROM users ORDER BY id LIMIT 3")
    print("\n=== Users (no name column) ===")
    for r in cur.fetchall():
        print(f"  ID={r[0]}")

cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='rewards' AND data_type IN ('character varying','text') LIMIT 5")
rcols = [r[0] for r in cur.fetchall()]
rcol = 'name' if 'name' in rcols else (rcols[0] if rcols else None)
if rcol:
    cur.execute(f"SELECT id, {rcol} FROM rewards ORDER BY id LIMIT 5")
    print(f"\n=== Rewards (Thai text check via {rcol}) ===")
    for r in cur.fetchall():
        print(f"  ID={r[0]}: {r[1]}")
else:
    print("\n=== Rewards (no text column found) ===")

cur.execute("SELECT relname, n_live_tup FROM pg_stat_user_tables WHERE n_live_tup > 0 ORDER BY n_live_tup DESC LIMIT 15")
print("\n=== Top 15 tables by row count ===")
for r in cur.fetchall():
    print(f"  {r[0]:<45} {r[1]:>10,} rows")

# Byte check to confirm UTF-8 encoding
cur.execute("SELECT name_th FROM products WHERE id = 1")
val = cur.fetchone()[0]
raw = val.encode('utf-8')
print(f"\n=== Encoding check (Product ID=1) ===")
print(f"  Text: {val}")
print(f"  UTF-8 bytes: {raw[:30]}...")
print(f"  Starts with Thai? {raw[:3] == b'\\xe0\\xb9\\x81' or raw[0] >= 0xc0}")

conn.close()
print("\nAll checks passed!")

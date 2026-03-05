import psycopg2
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== Checking LOCAL backup DB ===")
conn_local = psycopg2.connect(
    host="localhost", port=5433,
    dbname="saversure_v1_backup",
    user="saversure_app", password="julaherb789"
)
conn_local.set_client_encoding('UTF8')
cur = conn_local.cursor()
cur.execute("SHOW server_encoding")
print(f"Local server encoding: {cur.fetchone()[0]}")
cur.execute("SELECT id, name_th, sku FROM products WHERE id = 1")
row = cur.fetchone()
print(f"Local ID 1: name_th='{row[1]}' sku='{row[2]}'")
print(f"Local ID 1 bytes: {row[1].encode('utf-8') if row[1] else 'None'}")
cur.close()
conn_local.close()

print("\n=== Checking PRODUCTION DB ===")
conn_prod = psycopg2.connect(
    host="saversure-julaherb-prod.cms4i8jm3njf.ap-southeast-1.rds.amazonaws.com",
    port=5432,
    dbname="saversurejulaherb",
    user="julaherbbackend",
    password="GW4Ku13MRzSIKS2xsFpq",
    sslmode="require"
)
conn_prod.set_client_encoding('UTF8')
cur = conn_prod.cursor()
cur.execute("SHOW server_encoding")
print(f"Prod server encoding: {cur.fetchone()[0]}")
cur.execute("SELECT id, name_th, sku FROM products WHERE id = 1")
row = cur.fetchone()
print(f"Prod ID 1: name_th='{row[1]}' sku='{row[2]}'")
print(f"Prod ID 1 bytes: {row[1].encode('utf-8') if row[1] else 'None'}")
cur.close()
conn_prod.close()

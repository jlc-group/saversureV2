"""
Import cleaned V1 products into V2
- Skips: test item, prizes (no SKU), event tickets
- Maps V1 fields → V2 schema
"""
import psycopg2
import uuid
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

TENANT_ID = '11111111-1111-1111-1111-111111111111'

EXCLUDE_IDS = {66, 67, 68, 69, 70, 150}

TICKET_SKU_KEYWORDS = [
    'บัตร', 'Ticket', 'PREMIERE', 'FIRST PREMIERE',
    'ตู้กด', 'Vending machine', 'Booth',
    'ONE DAY TRIP', 'VALENTINE LOVE', 'สิงสาลาตาย',
    'Final Episode', 'ดาเอ็นโดรฟิน',
]

def is_ticket(sku, name):
    if not sku:
        return False
    for kw in TICKET_SKU_KEYWORDS:
        if kw in sku or kw in name:
            return True
    if len(sku) > 60:
        return True
    return False

v1_conn = psycopg2.connect(
    host='localhost', port=5433,
    dbname='saversure_v1_backup',
    user='saversure_app', password='julaherb789'
)
v1_conn.set_client_encoding('UTF8')

v2_conn = psycopg2.connect(
    host='localhost', port=5433,
    dbname='saversure',
    user='saversure_app', password='julaherb789'
)
v2_conn.set_client_encoding('UTF8')

v1_cur = v1_conn.cursor()
v1_cur.execute("""
    SELECT id, name_th, name_en, name_sku, sku, points, extra_points,
           diamond_point, price, detail, created_at, updated_at
    FROM products
    ORDER BY id
""")
rows = v1_cur.fetchall()

excluded_test = []
excluded_tickets = []
excluded_no_sku = []
to_import = []

for r in rows:
    v1_id, name_th, name_en, name_sku, sku, points, extra_pts, diamond, price, detail, created, updated = r
    sku = (sku or '').strip()

    if v1_id in EXCLUDE_IDS:
        if v1_id == 150:
            excluded_test.append(r)
        else:
            excluded_no_sku.append(r)
        continue

    if is_ticket(sku, name_th or ''):
        excluded_tickets.append(r)
        continue

    to_import.append(r)

print(f"=== Cleaning Summary ===")
print(f"  Total V1 products:   {len(rows)}")
print(f"  Excluded (test):     {len(excluded_test)}")
print(f"  Excluded (no SKU):   {len(excluded_no_sku)}")
print(f"  Excluded (tickets):  {len(excluded_tickets)}")
print(f"  To import:           {len(to_import)}")

print(f"\n--- Excluded Tickets ---")
for r in excluded_tickets:
    print(f"  ID={r[0]}: {r[1]} | SKU={r[4]}")

print(f"\n--- Excluded No SKU ---")
for r in excluded_no_sku:
    print(f"  ID={r[0]}: {r[1]} | SKU={r[4]}")

v2_cur = v2_conn.cursor()

v2_cur.execute(f"DELETE FROM products WHERE tenant_id = '{TENANT_ID}'")
deleted_count = v2_cur.rowcount
if deleted_count > 0:
    print(f"\n  Cleared {deleted_count} existing products for this tenant")

imported = 0
errors = []

for r in to_import:
    v1_id, name_th, name_en, name_sku, sku, points, extra_pts, diamond, price, detail, created, updated = r

    sku_clean = (sku or '').strip()
    if not sku_clean or sku_clean == '-':
        sku_clean = None
    elif len(sku_clean) > 100:
        sku_clean = sku_clean[:100]

    name = (name_th or name_en or name_sku or f'Product {v1_id}').strip()
    if len(name) > 200:
        name = name[:200]

    pts = points if points and points > 0 else 1

    desc_parts = []
    if name_en and name_en.strip():
        desc_parts.append(f"EN: {name_en.strip()}")
    if name_sku and name_sku.strip():
        desc_parts.append(f"SKU Name: {name_sku.strip()}")
    if detail and detail.strip():
        desc_parts.append(detail.strip())
    if price and price > 0:
        desc_parts.append(f"ราคา: {price} บาท")
    if extra_pts and extra_pts > 0:
        desc_parts.append(f"Extra points: {extra_pts}")
    if diamond and diamond > 0:
        desc_parts.append(f"Diamond points: {diamond}")
    description = '\n'.join(desc_parts) if desc_parts else None

    new_id = str(uuid.uuid4())

    try:
        v2_cur.execute("""
            INSERT INTO products (id, tenant_id, name, sku, description, points_per_scan, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, 'active', %s, %s)
        """, (new_id, TENANT_ID, name, sku_clean, description, pts, created, updated))
        imported += 1
    except Exception as e:
        errors.append((v1_id, name_th, str(e)))
        v2_conn.rollback()

v2_conn.commit()

print(f"\n=== Import Results ===")
print(f"  Successfully imported: {imported}")
print(f"  Errors: {len(errors)}")

if errors:
    print(f"\n--- Errors ---")
    for v1_id, name, err in errors:
        print(f"  ID={v1_id}: {name} → {err}")

v2_cur.execute(f"SELECT COUNT(*) FROM products WHERE tenant_id = '{TENANT_ID}'")
count = v2_cur.fetchone()[0]
print(f"\n  Total products in V2 for Jula's Herb: {count}")

v2_cur.execute(f"""
    SELECT name, sku, points_per_scan, status
    FROM products WHERE tenant_id = '{TENANT_ID}'
    ORDER BY created_at LIMIT 5
""")
print(f"\n--- Sample imported products ---")
for r in v2_cur.fetchall():
    print(f"  {r[0]:<50} SKU={r[1]:<25} pts={r[2]} status={r[3]}")

v1_conn.close()
v2_conn.close()
print("\nDone!")

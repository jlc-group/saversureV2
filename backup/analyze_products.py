"""Analyze V1 products for cleaning before V2 import"""
import psycopg2
import json
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

cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products' ORDER BY ordinal_position")
print("=== V1 Products Schema ===")
for r in cur.fetchall():
    print(f"  {r[0]:<30} {r[1]}")

cur.execute("""
    SELECT id, name_th, name_en, name_sku, sku, points, extra_points, diamond_point,
           price, created_at, updated_at, deleted_at
    FROM products ORDER BY id
""")
rows = cur.fetchall()
cols = ['id','name_th','name_en','name_sku','sku','points','extra_points','diamond_point',
        'price','created_at','updated_at','deleted_at']

print(f"\n=== Total Products: {len(rows)} ===")

active = [r for r in rows if r[11] is None]
deleted = [r for r in rows if r[11] is not None]
print(f"  Active: {len(active)}")
print(f"  Deleted (soft): {len(deleted)}")

no_sku = [r for r in rows if not r[4] or r[4].strip() == '' or r[4].strip() == '-']
print(f"  Missing/Empty SKU: {len(no_sku)}")
for r in no_sku:
    print(f"    ID={r[0]}: {r[1]} | SKU='{r[4]}' | deleted={'YES' if r[11] else 'NO'}")

sku_map = {}
for r in rows:
    s = (r[4] or '').strip()
    if s and s != '-':
        sku_map.setdefault(s, []).append(r)
dups = {k:v for k,v in sku_map.items() if len(v) > 1}
print(f"\n=== Duplicate SKUs: {len(dups)} ===")
for sku, items in sorted(dups.items()):
    print(f"  SKU: {sku}")
    for r in items:
        print(f"    ID={r[0]}: {r[1]} | points={r[5]} | deleted={'YES' if r[11] else 'NO'}")

test_items = [r for r in rows if r[1] and ('test' in r[1].lower() or 'ทดสอบ' in r[1])]
print(f"\n=== Test/ทดสอบ Items: {len(test_items)} ===")
for r in test_items:
    print(f"  ID={r[0]}: {r[1]} | SKU={r[4]} | deleted={'YES' if r[11] else 'NO'}")

categories = {}
for r in rows:
    s = (r[4] or '').strip()
    if not s or s == '-':
        cat = 'NO_SKU'
    elif s.startswith('BOX-'):
        cat = 'BOX'
    elif s.startswith('SCH-'):
        cat = 'SCH (Sachet)'
    elif s.startswith('PM-'):
        cat = 'PM (Promo)'
    elif s.startswith('SET-'):
        cat = 'SET'
    elif 'TICKET' in s.upper():
        cat = 'TICKET'
    else:
        cat = 'OTHER'
    categories.setdefault(cat, []).append(r)

print(f"\n=== Categories by SKU Pattern ===")
for cat in ['BOX','SCH (Sachet)','PM (Promo)','SET','TICKET','OTHER','NO_SKU']:
    items = categories.get(cat, [])
    if items:
        act = sum(1 for r in items if r[11] is None)
        dele = sum(1 for r in items if r[11] is not None)
        print(f"  {cat:<15} total={len(items):>3}  active={act:>3}  deleted={dele:>3}")

print("\n=== All Active Products ===")
for r in active:
    print(f"  ID={r[0]:>3} | {r[1]:<50} | SKU={r[4]:<25} | pts={r[5]} extra={r[6]} diamond={r[7]} | price={r[8]}")

conn.close()

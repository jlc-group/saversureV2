import csv, sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'D:\Dev\apps\saversureV2\backup\v1_products_thai.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"=== Total products: {len(rows)} ===\n")

# Group by type based on SKU pattern
categories = {
    'สินค้า (กล่อง/BOX)': [],
    'สินค้า (ซอง/SCH)': [],
    'สินค้า (หลอด/TB)': [],
    'สินค้า (ขวด/อื่นๆ)': [],
    'ของพรีเมียม (PM)': [],
    'เซ็ต (SET)': [],
    'บัตรงาน/คูปอง': [],
    'ทดสอบ (test)': [],
}

for r in rows:
    sku = r['sku']
    name = r['name_th']
    pts = r['points']
    price = r['price']
    
    if sku == 'test' or name == 'test':
        categories['ทดสอบ (test)'].append(r)
    elif sku.startswith('BOX-'):
        categories['สินค้า (กล่อง/BOX)'].append(r)
    elif sku.startswith('SCH-'):
        categories['สินค้า (ซอง/SCH)'].append(r)
    elif sku.startswith('TB-'):
        categories['สินค้า (หลอด/TB)'].append(r)
    elif sku.startswith('PM-'):
        categories['ของพรีเมียม (PM)'].append(r)
    elif sku.startswith('SET-'):
        categories['เซ็ต (SET)'].append(r)
    elif sku.startswith(('coupon', 'POOH', 'PIT BABE', 'Ticket', 'First Premiere')):
        categories['บัตรงาน/คูปอง'].append(r)
    elif int(pts) == 0 and int(price) == 0 and not sku.startswith(('BOX', 'SCH')):
        categories['บัตรงาน/คูปอง'].append(r)
    else:
        categories['สินค้า (ขวด/อื่นๆ)'].append(r)

for cat, items in categories.items():
    if items:
        print(f"\n{'='*60}")
        print(f"  {cat} ({len(items)} รายการ)")
        print(f"{'='*60}")
        for r in items:
            print(f"  ID:{r['id']:>4} | SKU: {r['sku']:<25} | Pts:{r['points']:>3} | Price:{r['price']:>6} | {r['name_th'][:60]}")

# Check for duplicate SKUs
print(f"\n\n{'='*60}")
print("  ตรวจสอบ SKU ซ้ำ")
print(f"{'='*60}")
sku_map = {}
for r in rows:
    sku = r['sku']
    if sku not in sku_map:
        sku_map[sku] = []
    sku_map[sku].append(r)

dups = {k: v for k, v in sku_map.items() if len(v) > 1}
if dups:
    for sku, items in dups.items():
        print(f"\n  SKU ซ้ำ: {sku}")
        for r in items:
            print(f"    ID:{r['id']:>4} | {r['name_th'][:60]}")
else:
    print("  ไม่มี SKU ซ้ำ")

# Check products with SKU = "-" (no real SKU)
print(f"\n\n{'='*60}")
print("  สินค้าที่ไม่มี SKU จริง (SKU = '-')")
print(f"{'='*60}")
for r in rows:
    if r['sku'] == '-':
        print(f"  ID:{r['id']:>4} | {r['name_th'][:60]} | Price:{r['price']}")

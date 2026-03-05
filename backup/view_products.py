import csv, json, sys

with open(r'D:\Dev\apps\saversureV2\backup\v1_products_thai.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

for r in rows:
    r['id'] = int(r['id'])
    r['points'] = int(r['points'])
    r['extra_points'] = int(r['extra_points'])
    r['diamond_point'] = int(r['diamond_point'])
    r['price'] = int(r['price'])

data_json = json.dumps(rows, ensure_ascii=False, indent=2)

html = '''<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>Saversure V1 Products Analysis</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Sarabun',sans-serif;background:#0f1117;color:#e0e0e0;padding:24px;max-width:1400px;margin:0 auto}
h1{font-size:26px;color:#60a5fa;margin-bottom:8px;font-weight:700}
.subtitle{color:#9ca3af;margin-bottom:20px;font-size:14px}
.stats{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px}
.stat{background:#1e2030;border-radius:10px;padding:14px 20px;min-width:120px;text-align:center}
.stat .num{font-size:32px;font-weight:700;color:#60a5fa}
.stat .label{font-size:12px;color:#9ca3af;margin-top:4px}
.filters{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
#search{background:#1e2030;border:1px solid #3a3d4e;color:#e0e0e0;padding:10px 14px;border-radius:8px;width:300px;font-size:14px;font-family:inherit}
#typeFilter{background:#1e2030;border:1px solid #3a3d4e;color:#e0e0e0;padding:10px 14px;border-radius:8px;font-size:14px;font-family:inherit}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#1e2030;padding:10px 12px;text-align:left;color:#60a5fa;position:sticky;top:0;font-weight:600;cursor:pointer;user-select:none}
th:hover{background:#2a2d4e}
td{padding:8px 12px;border-bottom:1px solid #1e2030}
tr:hover{background:#1a1d2e}
.sku{font-family:monospace;color:#fbbf24;font-size:12px}
.pts{color:#34d399;font-weight:600;text-align:right}
.price{color:#f472b6;font-weight:600;text-align:right}
.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;white-space:nowrap}
.badge-box{background:#1e3a5f;color:#60a5fa}
.badge-sch{background:#1e3a2f;color:#34d399}
.badge-pm{background:#3a1e3a;color:#c084fc}
.badge-ticket{background:#3a2e1e;color:#fbbf24}
.badge-test{background:#3a1e1e;color:#f87171}
.badge-product{background:#1e2e3a;color:#67e8f9}
.badge-set{background:#2e1e3a;color:#a78bfa}
.warn{color:#fbbf24;font-size:12px}
.err{color:#f87171;font-size:12px}
.section{background:#1e2030;border-radius:12px;padding:20px;margin-bottom:20px}
.section h2{color:#34d399;margin-bottom:12px;font-size:18px}
.clean-list{list-style:none}
.clean-list li{padding:6px 0;border-bottom:1px solid #2a2d3e;display:flex;justify-content:space-between}
.clean-list .action{color:#f87171;font-weight:600;font-size:12px}
.count-badge{background:#60a5fa;color:#0f1117;border-radius:12px;padding:2px 8px;font-size:11px;font-weight:700;margin-left:8px}
</style>
</head>
<body>
<h1>📦 Saversure V1 — Products Analysis</h1>
<p class="subtitle">ข้อมูลสินค้าจาก Production DB | ทั้งหมด <span id="total"></span> รายการ</p>

<div class="stats" id="stats"></div>

<div class="section">
<h2>⚠️ รายการที่ต้อง Clean ก่อน Import</h2>
<ul class="clean-list" id="cleanList"></ul>
</div>

<div class="filters">
<input type="text" id="search" placeholder="🔍 ค้นหา SKU หรือชื่อสินค้า...">
<select id="typeFilter"><option value="">ทุกประเภท</option></select>
<span id="showing" style="color:#9ca3af;font-size:13px"></span>
</div>

<table>
<thead><tr>
<th onclick="sortBy('id')">ID ↕</th>
<th onclick="sortBy('name_th')">ชื่อสินค้า ↕</th>
<th onclick="sortBy('sku')">SKU ↕</th>
<th>ประเภท</th>
<th onclick="sortBy('points')" style="text-align:right">Points ↕</th>
<th onclick="sortBy('extra_points')" style="text-align:right">Extra ↕</th>
<th onclick="sortBy('price')" style="text-align:right">ราคา ↕</th>
<th>หมายเหตุ</th>
</tr></thead>
<tbody id="tbody"></tbody>
</table>

<script>
const DATA = ''' + data_json + ''';

function getType(r) {
  const s = r.sku || '';
  if (s === 'test' || r.name_th === 'test') return {label: 'ทดสอบ', cls: 'badge-test'};
  if (s.startsWith('BOX-')) return {label: 'กล่อง (BOX)', cls: 'badge-box'};
  if (s.startsWith('SCH-')) return {label: 'ซอง (SCH)', cls: 'badge-sch'};
  if (s.startsWith('PM-')) return {label: 'พรีเมียม', cls: 'badge-pm'};
  if (s.startsWith('SET-')) return {label: 'เซ็ต', cls: 'badge-set'};
  if (s.startsWith('TB-')) return {label: 'หลอด', cls: 'badge-product'};
  if (r.points === 0 && r.price === 0) return {label: 'บัตร/คูปอง', cls: 'badge-ticket'};
  return {label: 'สินค้า', cls: 'badge-product'};
}

const skuCount = {};
DATA.forEach(r => { skuCount[r.sku] = (skuCount[r.sku]||0) + 1; });

// Stats
const typeCount = {};
DATA.forEach(r => { const t = getType(r).label; typeCount[t] = (typeCount[t]||0) + 1; });
document.getElementById('total').textContent = DATA.length;
let statsHtml = '';
const order = ['สินค้า','กล่อง (BOX)','ซอง (SCH)','พรีเมียม','เซ็ต','บัตร/คูปอง','หลอด','ทดสอบ'];
order.forEach(t => {
  if (typeCount[t]) statsHtml += `<div class="stat"><div class="num">${typeCount[t]}</div><div class="label">${t}</div></div>`;
});
document.getElementById('stats').innerHTML = statsHtml;

// Clean list
let cleanHtml = '';
DATA.forEach(r => {
  if (r.sku === 'test') cleanHtml += `<li><span>ID:${r.id} — ${r.name_th} (SKU: test)</span><span class="action">🗑 ลบออก</span></li>`;
});
DATA.forEach(r => {
  if (r.sku === '-') cleanHtml += `<li><span>ID:${r.id} — ${r.name_th} (SKU: -)</span><span class="action">⚠️ กำหนด SKU ใหม่</span></li>`;
});
if (skuCount['-'] > 1) {
  // already shown
}
document.getElementById('cleanList').innerHTML = cleanHtml || '<li>ไม่มีรายการที่ต้อง clean</li>';

// Type filter
const typeFilter = document.getElementById('typeFilter');
order.forEach(t => {
  if (typeCount[t]) {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = `${t} (${typeCount[t]})`;
    typeFilter.appendChild(opt);
  }
});

let sortField = 'id', sortAsc = true;

function render() {
  const q = document.getElementById('search').value.toLowerCase();
  const tf = typeFilter.value;
  let filtered = DATA.filter(r => {
    const matchSearch = !q || (r.name_th + ' ' + r.sku).toLowerCase().includes(q);
    const matchType = !tf || getType(r).label === tf;
    return matchSearch && matchType;
  });
  filtered.sort((a,b) => {
    let va = a[sortField], vb = b[sortField];
    if (typeof va === 'number') return sortAsc ? va-vb : vb-va;
    return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });
  
  document.getElementById('showing').textContent = `แสดง ${filtered.length} / ${DATA.length} รายการ`;
  
  let html = '';
  filtered.forEach(r => {
    const type = getType(r);
    let note = '';
    if (r.sku === '-') note = '<span class="warn">⚠️ ไม่มี SKU</span>';
    if (r.sku === 'test') note = '<span class="err">🗑️ ลบออก</span>';
    if (skuCount[r.sku] > 1 && r.sku !== '-') note = '<span class="warn">⚠️ ซ้ำ (' + skuCount[r.sku] + ')</span>';
    
    html += `<tr>
      <td>${r.id}</td>
      <td>${r.name_th}</td>
      <td class="sku">${r.sku}</td>
      <td><span class="badge ${type.cls}">${type.label}</span></td>
      <td class="pts">${r.points}</td>
      <td class="pts">${r.extra_points || ''}</td>
      <td class="price">${r.price > 0 ? '฿' + r.price.toLocaleString() : '-'}</td>
      <td>${note}</td>
    </tr>`;
  });
  document.getElementById('tbody').innerHTML = html;
}

window.sortBy = function(field) {
  if (sortField === field) sortAsc = !sortAsc;
  else { sortField = field; sortAsc = true; }
  render();
};

document.getElementById('search').addEventListener('input', render);
typeFilter.addEventListener('change', render);
render();
</script>
</body>
</html>'''

with open(r'D:\Dev\apps\saversureV2\backup\products_viewer.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML created successfully!")
print(f"Total products: {len(rows)}")

types = {}
for r in rows:
    s = r['sku']
    if s == 'test': t = 'test'
    elif s.startswith('BOX-'): t = 'BOX'
    elif s.startswith('SCH-'): t = 'SCH'
    elif s.startswith('PM-'): t = 'PM'
    elif s.startswith('SET-'): t = 'SET'
    elif s.startswith('TB-'): t = 'TB'
    elif r['points'] == 0 and r['price'] == 0: t = 'ticket'
    else: t = 'product'
    types[t] = types.get(t, 0) + 1

for t, c in sorted(types.items(), key=lambda x: -x[1]):
    print(f"  {t}: {c}")

dup_skus = {}
for r in rows:
    dup_skus.setdefault(r['sku'], []).append(r)
dups = {k:v for k,v in dup_skus.items() if len(v) > 1}
if dups:
    print(f"\nDuplicate SKUs:")
    for sku, items in dups.items():
        print(f"  SKU '{sku}': {len(items)} items - IDs: {[i['id'] for i in items]}")

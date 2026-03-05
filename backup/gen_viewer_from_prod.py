import psycopg2
import json

conn = psycopg2.connect(
    host="saversure-julaherb-prod.cms4i8jm3njf.ap-southeast-1.rds.amazonaws.com",
    port=5432,
    dbname="saversurejulaherb",
    user="julaherbbackend",
    password="GW4Ku13MRzSIKS2xsFpq",
    sslmode="require"
)
conn.set_client_encoding('UTF8')
cur = conn.cursor()

cur.execute("""
    SELECT id, name_th, name_sku, sku, points, extra_points, diamond_point, price,
           CASE WHEN deleted_at IS NOT NULL THEN 'DELETED' ELSE 'ACTIVE' END as del
    FROM products ORDER BY id
""")
columns = [d[0] for d in cur.description]
rows = []
for row in cur.fetchall():
    d = dict(zip(columns, row))
    d['id'] = int(d['id']) if d['id'] else 0
    d['points'] = int(d['points']) if d['points'] else 0
    d['extra_points'] = int(d['extra_points']) if d['extra_points'] else 0
    d['diamond_point'] = int(d['diamond_point']) if d['diamond_point'] else 0
    d['price'] = int(d['price']) if d['price'] else 0
    d['name_th'] = d['name_th'] or ''
    d['name_sku'] = d['name_sku'] or ''
    d['sku'] = d['sku'] or ''
    rows.append(d)

cur.close()
conn.close()

data_json = json.dumps(rows, ensure_ascii=False)

html = r'''<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>Saversure V1 Products</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Sarabun',sans-serif;background:#0f1117;color:#e0e0e0;padding:24px;max-width:1400px;margin:0 auto}
h1{font-size:26px;color:#60a5fa;margin-bottom:8px;font-weight:700}
.sub{color:#9ca3af;margin-bottom:20px;font-size:14px}
.stats{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px}
.st{background:#1e2030;border-radius:10px;padding:14px 20px;min-width:110px;text-align:center}
.st .n{font-size:32px;font-weight:700;color:#60a5fa}
.st .l{font-size:12px;color:#9ca3af;margin-top:4px}
.flt{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
#s{background:#1e2030;border:1px solid #3a3d4e;color:#e0e0e0;padding:10px 14px;border-radius:8px;width:300px;font-size:14px;font-family:inherit}
#tf{background:#1e2030;border:1px solid #3a3d4e;color:#e0e0e0;padding:10px 14px;border-radius:8px;font-size:14px;font-family:inherit}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#1e2030;padding:10px 12px;text-align:left;color:#60a5fa;position:sticky;top:0;font-weight:600;cursor:pointer}
th:hover{background:#2a2d4e}
td{padding:8px 12px;border-bottom:1px solid #1e2030}
tr:hover{background:#1a1d2e}
.sk{font-family:monospace;color:#fbbf24;font-size:12px}
.pt{color:#34d399;font-weight:600;text-align:right}
.pr{color:#f472b6;font-weight:600;text-align:right}
.b{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600}
.b1{background:#1e3a5f;color:#60a5fa}
.b2{background:#1e3a2f;color:#34d399}
.b3{background:#3a1e3a;color:#c084fc}
.b4{background:#3a2e1e;color:#fbbf24}
.b5{background:#3a1e1e;color:#f87171}
.b6{background:#1e2e3a;color:#67e8f9}
.sec{background:#1e2030;border-radius:12px;padding:20px;margin-bottom:20px}
.sec h2{color:#34d399;margin-bottom:12px;font-size:18px}
.cl{list-style:none}
.cl li{padding:8px 0;border-bottom:1px solid #2a2d3e;display:flex;justify-content:space-between}
.w{color:#fbbf24;font-size:12px}
.e{color:#f87171;font-size:12px}
</style>
</head>
<body>
<h1>📦 Saversure V1 — รายการสินค้า (จาก Production)</h1>
<p class="sub">ทั้งหมด <span id="t"></span> รายการ | อ่านอย่างเดียว ไม่มีการแก้ไข Production</p>
<div class="stats" id="sts"></div>
<div class="sec">
<h2>⚠️ รายการที่ต้อง Clean ก่อน Import เข้า V2</h2>
<ul class="cl" id="cl"></ul>
</div>
<div class="flt">
<input type="text" id="s" placeholder="🔍 ค้นหา...">
<select id="tf"><option value="">ทุกประเภท</option></select>
<span id="sh" style="color:#9ca3af;font-size:13px"></span>
</div>
<table>
<thead><tr>
<th onclick="sb('id')">ID</th>
<th onclick="sb('name_th')">ชื่อสินค้า</th>
<th onclick="sb('name_sku')">Name SKU</th>
<th onclick="sb('sku')">SKU</th>
<th>ประเภท</th>
<th onclick="sb('points')" style="text-align:right">Points</th>
<th onclick="sb('extra_points')" style="text-align:right">Extra</th>
<th onclick="sb('diamond_point')" style="text-align:right">Diamond</th>
<th onclick="sb('price')" style="text-align:right">ราคา</th>
<th>หมายเหตุ</th>
</tr></thead>
<tbody id="tb"></tbody>
</table>
<script>
const D=''' + data_json + r''';
function gt(r){const s=r.sku||'';if(s==='test'||r.name_th==='test')return{l:'ทดสอบ',c:'b5'};if(s.startsWith('BOX-'))return{l:'กล่อง',c:'b1'};if(s.startsWith('SCH-'))return{l:'ซอง',c:'b2'};if(s.startsWith('PM-'))return{l:'พรีเมียม',c:'b3'};if(s.startsWith('SET-'))return{l:'เซ็ต',c:'b6'};if(s.startsWith('TB-'))return{l:'หลอด',c:'b6'};if(r.points===0&&r.price===0)return{l:'บัตร/คูปอง',c:'b4'};return{l:'สินค้า',c:'b6'}}
const sc={};D.forEach(r=>{sc[r.sku]=(sc[r.sku]||0)+1});
const tc={};D.forEach(r=>{const t=gt(r).l;tc[t]=(tc[t]||0)+1});
document.getElementById('t').textContent=D.length;
let sh='';['สินค้า','กล่อง','ซอง','พรีเมียม','เซ็ต','บัตร/คูปอง','หลอด','ทดสอบ'].forEach(t=>{if(tc[t])sh+='<div class="st"><div class="n">'+tc[t]+'</div><div class="l">'+t+'</div></div>'});
document.getElementById('sts').innerHTML=sh;
let ch='';D.forEach(r=>{if(r.sku==='test')ch+='<li><span>ID:'+r.id+' — '+r.name_th+'</span><span class="e">🗑 ลบ test</span></li>'});
D.forEach(r=>{if(r.sku==='-')ch+='<li><span>ID:'+r.id+' — '+r.name_th+'</span><span class="w">⚠️ ไม่มี SKU</span></li>'});
document.getElementById('cl').innerHTML=ch;
const tf=document.getElementById('tf');
['สินค้า','กล่อง','ซอง','พรีเมียม','เซ็ต','บัตร/คูปอง','หลอด','ทดสอบ'].forEach(t=>{if(tc[t]){const o=document.createElement('option');o.value=t;o.textContent=t+' ('+tc[t]+')';tf.appendChild(o)}});
let sf='id',sa=true;
function rn(){const q=document.getElementById('s').value.toLowerCase();const tv=tf.value;
let f=D.filter(r=>{const ms=!q||(r.name_th+' '+r.sku+' '+r.name_sku).toLowerCase().includes(q);const mt=!tv||gt(r).l===tv;return ms&&mt});
f.sort((a,b)=>{let va=a[sf],vb=b[sf];if(typeof va==='number')return sa?va-vb:vb-va;return sa?String(va).localeCompare(String(vb)):String(vb).localeCompare(String(va))});
document.getElementById('sh').textContent='แสดง '+f.length+' / '+D.length;
let h='';f.forEach(r=>{const t=gt(r);let n='';if(r.sku==='-')n='<span class="w">⚠️ ไม่มี SKU</span>';if(r.sku==='test')n='<span class="e">🗑️ ลบ</span>';if(sc[r.sku]>1&&r.sku!=='-')n='<span class="w">⚠️ ซ้ำ ('+sc[r.sku]+')</span>';
h+='<tr><td>'+r.id+'</td><td>'+r.name_th+'</td><td style="font-size:11px;color:#9ca3af;max-width:200px;overflow:hidden;text-overflow:ellipsis">'+r.name_sku+'</td><td class="sk">'+r.sku+'</td><td><span class="b '+t.c+'">'+t.l+'</span></td><td class="pt">'+r.points+'</td><td class="pt">'+(r.extra_points||'-')+'</td><td class="pt">'+(r.diamond_point||'-')+'</td><td class="pr">'+(r.price>0?'฿'+r.price.toLocaleString():'-')+'</td><td>'+n+'</td></tr>'});
document.getElementById('tb').innerHTML=h}
window.sb=function(f){if(sf===f)sa=!sa;else{sf=f;sa=true}rn()};
document.getElementById('s').addEventListener('input',rn);
tf.addEventListener('change',rn);
rn();
</script>
</body>
</html>'''

with open(r'D:\Dev\apps\saversureV2\backup\products_viewer.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Done! {len(rows)} products")
print(f"Sample: ID 1 = {rows[0]['name_th']}")
print(f"Sample: ID 41 = {rows[19]['name_th']}")

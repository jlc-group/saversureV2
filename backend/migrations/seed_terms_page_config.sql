-- Seed default page_config for /terms page
-- Idempotent: ON CONFLICT DO NOTHING skips tenants that already have a config

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT t.id, 'terms', '[
  {
    "id": "terms-header-default",
    "type": "page_header_basic",
    "order": 1,
    "visible": true,
    "props": {
      "title": "ข้อกำหนดและนโยบาย",
      "subtitle": "นโยบายความเป็นส่วนตัวและเงื่อนไข",
      "back_href": "/profile"
    }
  },
  {
    "id": "terms-content-default",
    "type": "rich_text",
    "order": 2,
    "visible": true,
    "props": {
      "title": "นโยบายความเป็นส่วนตัว (Privacy Policy)",
      "alignment": "left",
      "content": "<p>บริษัทให้ความสำคัญอย่างยิ่งในการคุ้มครองข้อมูลส่วนบุคคลของท่าน นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ เปิดเผย และปกป้องข้อมูลของท่านเมื่อท่านใช้แอปพลิเคชันของเรา</p><h4>1. ข้อมูลที่เราเก็บรวบรวม</h4><ul><li>ข้อมูลที่ท่านให้ไว้โดยตรง เช่น ชื่อ นามสกุล อีเมล เบอร์โทรศัพท์</li><li>ข้อมูลการใช้งานแอปพลิเคชันและการทำรายการต่างๆ</li><li>ข้อมูลอุปกรณ์ที่ใช้เข้าถึงระบบ</li></ul><h4>2. วัตถุประสงค์การใช้ข้อมูล</h4><ul><li>เพื่อให้บริการ การสะสมแต้ม และแลกของรางวัล</li><li>เพื่อปรับปรุงและพัฒนาแอปพลิเคชันให้ดียิ่งขึ้น</li><li>เพื่อนำเสนอโปรโมชันที่ตรงใจท่าน</li></ul><h4>3. สิทธิของเจ้าของข้อมูล (PDPA)</h4><p>ท่านมีสิทธิในการขอเข้าถึง ขอแก้ไข หรือขอลบข้อมูลส่วนบุคคลของท่าน รวมถึงสิทธิในการคัดค้านการประมวลผลข้อมูลตามที่กฎหมายกำหนด</p><p style=\"text-align:center;margin-top:24px;font-size:10px;opacity:0.5\">แก้ไขล่าสุด: 1 มกราคม 2567</p>"
    }
  }
]'::jsonb, 'published', 1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;

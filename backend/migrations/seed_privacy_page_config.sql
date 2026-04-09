-- Seed default page_config for /privacy page
-- Idempotent: ON CONFLICT DO NOTHING skips tenants that already have a config

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT t.id, 'privacy', '[
  {
    "id": "privacy-header-default",
    "type": "page_header_basic",
    "order": 1,
    "visible": true,
    "props": {
      "title": "นโยบายความเป็นส่วนตัว (PDPA)",
      "subtitle": "",
      "back_href": "/register"
    }
  },
  {
    "id": "privacy-content-default",
    "type": "rich_text",
    "order": 2,
    "visible": true,
    "props": {
      "title": "",
      "alignment": "left",
      "content": "<p>บริษัทให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ เราจะเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล ตามวัตถุประสงค์ที่แจ้งไว้เท่านั้น</p><p>ข้อมูลที่เรารวบรวม ได้แก่ ชื่อ นามสกุล เบอร์โทรศัพท์ อีเมล วันที่เกิด และข้อมูลที่อยู่ เพื่อใช้ในการให้บริการ ส่งรางวัล และปรับปรุงประสบการณ์การใช้งาน</p><p>คุณมีสิทธิ์ในการเข้าถึง แก้ไข ลบ หรือถอนความยินยอมข้อมูลส่วนบุคคลของคุณได้ตลอดเวลา โดยติดต่อฝ่ายบริการลูกค้า</p><p style=\"opacity:0.7;font-size:12px\">อัปเดตล่าสุด: มีนาคม 2025</p>"
    }
  }
]'::jsonb, 'published', 1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;

-- Seed default page_config for /support page
-- Idempotent: ON CONFLICT DO NOTHING skips tenants that already have a config

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT t.id, 'support', '[
  {
    "id": "support-page-header-default",
    "type": "support_page_header",
    "order": 1,
    "visible": true,
    "props": {
      "title": "คำถามที่พบบ่อย",
      "subtitle": "รวมคำตอบและวิธีการใช้งานเบื้องต้น"
    }
  },
  {
    "id": "support-faq-list-default",
    "type": "support_faq_list",
    "order": 2,
    "visible": true,
    "props": {
      "empty_text": "ยังไม่มีคำถามที่พบบ่อย",
      "items": [
        {
          "q": "แต้มสะสมจะหมดอายุเมื่อไหร่?",
          "a": "แต้มสะสมมีอายุตามที่แบรนด์กำหนด กรุณาตรวจสอบในหน้ากระเป๋าเงินหรือติดต่อทีมงาน"
        },
        {
          "q": "สแกน QR แล้วไม่ได้แต้ม?",
          "a": "อาจเกิดจาก QR ถูกสแกนไปแล้วหรือหมดอายุ กรุณาตรวจสอบประวัติการสแกนหรือแจ้งปัญหาผ่านแบบฟอร์มด้านล่าง"
        },
        {
          "q": "แลกของรางวัลแล้วจะได้รับเมื่อไหร่?",
          "a": "ระยะเวลาจัดส่งขึ้นอยู่กับประเภทของรางวัล คูปองจะได้รับทันที สินค้าจัดส่งภายใน 7-14 วันทำการ"
        },
        {
          "q": "เปลี่ยนเบอร์โทรศัพท์ได้อย่างไร?",
          "a": "ไปที่หน้าโปรไฟล์ แล้วกดแก้ไขข้อมูลส่วนตัว หากมีปัญหาให้แจ้งทีมงาน"
        }
      ]
    }
  },
  {
    "id": "support-contact-cta-default",
    "type": "support_contact_cta",
    "order": 3,
    "visible": true,
    "props": {
      "text": "ไม่พบคำตอบที่ต้องการ หรือต้องการแจ้งปัญหา?",
      "cta_label": "ไปหน้าแจ้งปัญหา",
      "cta_href": "/support/history?tab=ticket"
    }
  }
]'::jsonb, 'published', 1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;

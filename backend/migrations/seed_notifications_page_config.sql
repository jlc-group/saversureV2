-- Seed default page_config for /notifications page
-- Idempotent: ON CONFLICT DO NOTHING skips tenants that already have a config
-- (e.g. created manually via /page-builder admin UI)

INSERT INTO page_configs (tenant_id, page_slug, sections, status, version)
SELECT t.id, 'notifications', '[
  {
    "id": "notifications-page-header-default",
    "type": "notifications_page_header",
    "order": 1,
    "visible": true,
    "props": {
      "title": "Notifications",
      "back_href": "/"
    }
  },
  {
    "id": "notifications-list-default",
    "type": "notifications_list",
    "order": 2,
    "visible": true,
    "props": {
      "mark_all_label": "Mark all read",
      "marking_label": "...",
      "empty_text": "No notifications yet",
      "login_required_text": "Please login to view notifications",
      "login_label": "Login",
      "login_href": "/login",
      "time_just_now": "Just now",
      "time_minute_suffix": "m ago",
      "time_hour_suffix": "h ago",
      "time_day_suffix": "d ago"
    }
  }
]'::jsonb, 'published', 1
FROM tenants t
ON CONFLICT (tenant_id, page_slug) DO NOTHING;

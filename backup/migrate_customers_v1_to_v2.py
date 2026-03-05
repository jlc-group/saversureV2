"""
Migrate Saversure V1 customers → V2
- 810K users from saversure_v1_backup → saversure (V2)
- Includes: users, user_roles, user_addresses, point_ledger (initial balance)
"""
import psycopg2
import psycopg2.extras
import uuid
import time
import sys

V1_DSN = dict(
    host="localhost", port=5433,
    dbname="saversure_v1_backup",
    user="saversure_app", password="julaherb789",
)
V2_DSN = dict(
    host="localhost", port=5433,
    dbname="saversure",
    user="saversure_app", password="julaherb789",
)

TENANT_ID = "00000000-0000-0000-0000-000000000001"
BATCH_SIZE = 2000

# bcrypt hash of "V1_MIGRATED_NO_PASSWORD" — valid hash, cannot be used to login
PLACEHOLDER_HASH = "$2a$10$V1MiGrAtEdNoP4ssw0rd000000000000000000000000000000000"

GENDER_MAP = {"หญิง": "female", "ชาย": "male", "LGBTQ": "other"}
FLAG_MAP = {0: "white", 1: "green", 91: "yellow", 92: "orange", 93: "black", 201: "gray"}
STATUS_MAP = {0: "active", 3: "deleted"}


def trunc(val, maxlen):
    if val and len(val) > maxlen:
        return val[:maxlen]
    return val


def migrate_users():
    """Phase 1: Migrate users + user_roles"""
    v1 = psycopg2.connect(**V1_DSN)
    v2 = psycopg2.connect(**V2_DSN)
    v1.set_client_encoding('UTF8')
    v2.set_client_encoding('UTF8')

    v1_cur = v1.cursor("v1_users", cursor_factory=psycopg2.extras.DictCursor)
    v1_cur.itersize = BATCH_SIZE
    v1_cur.execute("""
        SELECT id, name, surname, email, telephone, line_user_id,
               birth_date, gender, profile_image, province, occupation,
               flag, status, point, created_at, updated_at, last_scan
        FROM users
        WHERE deleted_at IS NULL
        ORDER BY id
    """)

    v2_cur = v2.cursor()

    # Check existing v1_user_ids to support re-run
    v2_cur.execute("SELECT v1_user_id FROM users WHERE v1_user_id IS NOT NULL")
    existing_v1_ids = {r[0] for r in v2_cur.fetchall()}

    # Track used emails to handle duplicates
    v2_cur.execute("SELECT email FROM users WHERE tenant_id = %s", (TENANT_ID,))
    used_emails = {r[0].lower() for r in v2_cur.fetchall()}

    total = 0
    skipped = 0
    errors = []
    id_map = {}  # v1_id → v2_uuid
    start = time.time()

    batch_users = []
    batch_roles = []

    for row in v1_cur:
        v1_id = row["id"]

        if v1_id in existing_v1_ids:
            skipped += 1
            continue

        v2_id = str(uuid.uuid4())
        id_map[v1_id] = v2_id

        name = (row["name"] or "").strip()
        surname = (row["surname"] or "").strip()
        display_name = trunc(f"{name} {surname}".strip() or f"User {v1_id}", 255)
        first_name = trunc(name, 100) or None
        last_name = trunc(surname, 100) or None

        email = (row["email"] or "").strip().lower()
        if not email or len(email) > 250 or email in used_emails:
            email = f"v1_{v1_id}@migrated.saversure.local"
        used_emails.add(email)

        phone = trunc((row["telephone"] or "").strip(), 20) or None
        gender = GENDER_MAP.get(row["gender"])
        status = STATUS_MAP.get(row["status"], "active")
        flag = FLAG_MAP.get(row["flag"], "green")
        province = trunc((row["province"] or "").strip(), 100) or None
        occupation = trunc((row["occupation"] or "").strip(), 100) or None
        avatar_url = (row["profile_image"] or "").strip() or None
        line_uid = trunc((row["line_user_id"] or "").strip(), 100) or None
        birth_date = row["birth_date"]
        created_at = row["created_at"]
        updated_at = row["updated_at"]

        batch_users.append((
            v2_id, TENANT_ID, email, phone, PLACEHOLDER_HASH,
            display_name, status, created_at, updated_at,
            first_name, last_name, birth_date, gender,
            avatar_url, line_uid, province, occupation, flag, v1_id
        ))
        batch_roles.append((v2_id, TENANT_ID, "api_client"))
        total += 1

        if len(batch_users) >= BATCH_SIZE:
            try:
                _insert_user_batch(v2_cur, batch_users, batch_roles)
                v2.commit()
            except Exception as e:
                v2.rollback()
                errors.append((total, str(e)))
                print(f"  ERROR at batch ~{total}: {e}")
            batch_users.clear()
            batch_roles.clear()

            if total % 50000 == 0:
                elapsed = time.time() - start
                rate = total / elapsed if elapsed > 0 else 0
                print(f"  {total:>8,} users migrated ({rate:.0f}/s) | {elapsed:.0f}s | skipped {skipped}")
                sys.stdout.flush()

    if batch_users:
        try:
            _insert_user_batch(v2_cur, batch_users, batch_roles)
            v2.commit()
        except Exception as e:
            v2.rollback()
            errors.append((total, str(e)))
            print(f"  ERROR at final batch: {e}")

    v1_cur.close()
    v1.close()
    v2_cur.close()
    v2.close()

    elapsed = time.time() - start
    print(f"\n  Users: {total:,} migrated, {skipped:,} skipped, {len(errors)} errors in {elapsed:.0f}s")
    return id_map


def _insert_user_batch(cur, users, roles):
    psycopg2.extras.execute_values(cur, """
        INSERT INTO users (
            id, tenant_id, email, phone, password_hash,
            display_name, status, created_at, updated_at,
            first_name, last_name, birth_date, gender,
            avatar_url, line_user_id, province, occupation, customer_flag, v1_user_id
        ) VALUES %s
        ON CONFLICT (v1_user_id) WHERE v1_user_id IS NOT NULL DO NOTHING
    """, users, page_size=BATCH_SIZE)

    psycopg2.extras.execute_values(cur, """
        INSERT INTO user_roles (user_id, tenant_id, role)
        VALUES %s
        ON CONFLICT (user_id, tenant_id) DO NOTHING
    """, roles, page_size=BATCH_SIZE)


def build_id_map():
    """Rebuild id_map from existing migrated users (for re-run of later phases)"""
    v2 = psycopg2.connect(**V2_DSN)
    cur = v2.cursor()
    cur.execute("SELECT v1_user_id, id FROM users WHERE v1_user_id IS NOT NULL")
    id_map = {r[0]: str(r[1]) for r in cur.fetchall()}
    cur.close()
    v2.close()
    return id_map


def migrate_addresses(id_map):
    """Phase 2: Migrate user_addresses"""
    v1 = psycopg2.connect(**V1_DSN)
    v2 = psycopg2.connect(**V2_DSN)
    v1.set_client_encoding('UTF8')
    v2.set_client_encoding('UTF8')

    v1_cur = v1.cursor(cursor_factory=psycopg2.extras.DictCursor)
    v1_cur.execute("""
        SELECT user_id, recipient_name, recipient_address,
               sub_district, district, province, postcode,
               telephone, is_default, created_at, updated_at
        FROM user_address
        WHERE deleted_at IS NULL
        ORDER BY user_id
    """)

    v2_cur = v2.cursor()
    batch = []
    total = 0
    skipped = 0

    for row in v1_cur:
        v1_uid = row["user_id"]
        v2_uid = id_map.get(v1_uid)
        if not v2_uid:
            skipped += 1
            continue

        recipient = trunc((row["recipient_name"] or "").strip() or "ไม่ระบุ", 200)
        phone = trunc((row["telephone"] or "").strip(), 20) or ""
        addr = (row["recipient_address"] or "").strip() or ""
        postcode = trunc(str(row["postcode"]).strip(), 10) if row["postcode"] else None

        batch.append((
            v2_uid, TENANT_ID, "home", recipient, phone, addr,
            row["district"], row["sub_district"], row["province"],
            postcode, row["is_default"] or False,
            row["created_at"], row["updated_at"]
        ))
        total += 1

        if len(batch) >= BATCH_SIZE:
            psycopg2.extras.execute_values(v2_cur, """
                INSERT INTO user_addresses (
                    user_id, tenant_id, label, recipient_name, phone, address_line1,
                    district, sub_district, province, postal_code, is_default,
                    created_at, updated_at
                ) VALUES %s
            """, batch, page_size=BATCH_SIZE)
            v2.commit()
            batch.clear()

    if batch:
        psycopg2.extras.execute_values(v2_cur, """
            INSERT INTO user_addresses (
                user_id, tenant_id, label, recipient_name, phone, address_line1,
                district, sub_district, province, postal_code, is_default,
                created_at, updated_at
            ) VALUES %s
        """, batch, page_size=BATCH_SIZE)
        v2.commit()

    v1_cur.close()
    v2_cur.close()
    v1.close()
    v2.close()
    print(f"  Addresses: {total:,} migrated, {skipped:,} skipped (user not found)")


def migrate_points(id_map):
    """Phase 3: Migrate point balances as initial credit entries in point_ledger"""
    v1 = psycopg2.connect(**V1_DSN)
    v2 = psycopg2.connect(**V2_DSN)
    v1.set_client_encoding('UTF8')

    v1_cur = v1.cursor(cursor_factory=psycopg2.extras.DictCursor)
    v1_cur.execute("""
        SELECT id, point, created_at FROM users
        WHERE deleted_at IS NULL AND point > 0
        ORDER BY id
    """)

    v2_cur = v2.cursor()

    # Get v1_user_ids that already have migration entries
    v2_cur.execute("""
        SELECT reference_id FROM point_ledger
        WHERE reference_type = 'v1_migration' AND tenant_id = %s
    """, (TENANT_ID,))
    already_migrated = {r[0] for r in v2_cur.fetchall()}
    print(f"  {len(already_migrated):,} point entries already exist — will skip those")

    batch = []
    total = 0
    skipped = 0

    for row in v1_cur:
        v1_uid = row["id"]
        v2_uid = id_map.get(v1_uid)
        if not v2_uid:
            skipped += 1
            continue

        points = row["point"]
        if points <= 0:
            continue

        if str(v1_uid) in already_migrated:
            skipped += 1
            continue

        batch.append((
            TENANT_ID, v2_uid, "credit", points, points,
            "v1_migration", str(v1_uid),
            f"V1 migrated balance ({points} pts)",
            row["created_at"]
        ))
        total += 1

        if len(batch) >= BATCH_SIZE:
            psycopg2.extras.execute_values(v2_cur, """
                INSERT INTO point_ledger (
                    tenant_id, user_id, entry_type, amount, balance_after,
                    reference_type, reference_id, description, created_at
                ) VALUES %s
            """, batch, page_size=BATCH_SIZE)
            v2.commit()
            batch.clear()

    if batch:
        psycopg2.extras.execute_values(v2_cur, """
            INSERT INTO point_ledger (
                tenant_id, user_id, entry_type, amount, balance_after,
                reference_type, reference_id, description, created_at
            ) VALUES %s
        """, batch, page_size=BATCH_SIZE)
        v2.commit()

    v1_cur.close()
    v2_cur.close()
    v1.close()
    v2.close()
    print(f"  Points: {total:,} entries created, {skipped:,} skipped")


def main():
    print("=" * 60)
    print("  Saversure V1 → V2 Customer Migration")
    print("=" * 60)

    print("\n[Phase 1] Migrating users...")
    id_map = migrate_users()

    print("  Rebuilding full ID map from database...")
    id_map = build_id_map()
    print(f"  ID map: {len(id_map):,} entries")

    print("\n[Phase 2] Migrating addresses...")
    migrate_addresses(id_map)

    print("\n[Phase 3] Migrating point balances...")
    migrate_points(id_map)

    print("\n" + "=" * 60)
    print("  Migration complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()

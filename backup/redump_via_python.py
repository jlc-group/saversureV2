"""
Re-dump Saversure V1 Production → Local via Python psycopg2
Uses temp files for streaming (handles large tables like users ~810K rows)
Skips: qrcodes (151GB), qrcode_scan_history (9GB), qrcode_scan_history_unregister (2.4GB)
"""
import psycopg2
import tempfile
import os
import time
import sys

SKIP_TABLES = {
    'qrcodes',
    'qrcode_scan_history',
    'qrcode_scan_history_unregister',
}

PROD_DSN = dict(
    host="saversure-julaherb-prod.cms4i8jm3njf.ap-southeast-1.rds.amazonaws.com",
    port=5432,
    dbname="saversurejulaherb",
    user="julaherbbackend",
    password="GW4Ku13MRzSIKS2xsFpq",
    sslmode="require",
    options="-c statement_timeout=0",
)

LOCAL_DSN = dict(
    host="localhost",
    port=5433,
    dbname="saversure_v1_backup",
    user="saversure_app",
    password="julaherb789",
)

TEMP_DIR = r"D:\Dev\apps\saversureV2\backup\tmp"

def get_tables_ordered(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    """)
    all_tables = [r[0] for r in cur.fetchall()]

    cur.execute("""
        SELECT DISTINCT
            tc.table_name AS child,
            ccu.table_name AS parent
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND ccu.table_schema = 'public'
            AND tc.table_name != ccu.table_name
    """)
    deps = {}
    for child, parent in cur.fetchall():
        deps.setdefault(child, set()).add(parent)
    cur.close()

    ordered = []
    visited = set()
    def visit(t):
        if t in visited:
            return
        visited.add(t)
        for dep in deps.get(t, []):
            if dep in all_tables and dep not in SKIP_TABLES:
                visit(dep)
        ordered.append(t)

    for t in all_tables:
        if t not in SKIP_TABLES:
            visit(t)
    return ordered

def copy_table_via_file(table):
    """Copy one table using temp file — fresh connections per table"""
    tmp_path = os.path.join(TEMP_DIR, f"{table}.csv")

    prod_conn = psycopg2.connect(**PROD_DSN)
    prod_conn.set_client_encoding('UTF8')
    try:
        with open(tmp_path, 'wb') as f:
            prod_cur = prod_conn.cursor()
            prod_cur.copy_expert(
                f"COPY \"{table}\" TO STDOUT WITH (FORMAT csv, HEADER false, ENCODING 'UTF8')",
                f
            )
            prod_cur.close()
    finally:
        prod_conn.close()

    file_size = os.path.getsize(tmp_path)
    if file_size == 0:
        os.remove(tmp_path)
        return 0, 0

    local_conn = psycopg2.connect(**LOCAL_DSN)
    local_conn.set_client_encoding('UTF8')
    try:
        local_cur = local_conn.cursor()
        local_cur.execute(f"TRUNCATE \"{table}\" CASCADE")
        with open(tmp_path, 'rb') as f:
            local_cur.copy_expert(
                f"COPY \"{table}\" FROM STDIN WITH (FORMAT csv, HEADER false, ENCODING 'UTF8')",
                f
            )
        local_conn.commit()
        local_cur.execute(f"SELECT COUNT(*) FROM \"{table}\"")
        count = local_cur.fetchone()[0]
        local_cur.close()
    finally:
        local_conn.close()

    os.remove(tmp_path)
    return count, file_size

def main():
    os.makedirs(TEMP_DIR, exist_ok=True)

    print("Getting table list from production...")
    prod_conn = psycopg2.connect(**PROD_DSN)
    prod_conn.set_client_encoding('UTF8')
    ordered = get_tables_ordered(prod_conn)
    prod_conn.close()
    print(f"Will copy {len(ordered)} tables (skipping {len(SKIP_TABLES)} huge tables)")

    local_conn = psycopg2.connect(**LOCAL_DSN)
    local_cur = local_conn.cursor()
    local_cur.execute("SET session_replication_role = 'replica';")
    local_conn.commit()
    local_cur.close()
    local_conn.close()

    total_rows = 0
    total_bytes = 0
    errors = []
    start = time.time()

    for i, table in enumerate(ordered, 1):
        t0 = time.time()
        try:
            count, size = copy_table_via_file(table)
            elapsed = time.time() - t0
            total_rows += count
            total_bytes += size
            size_str = f"{size/1024/1024:.1f}MB" if size > 1024*1024 else f"{size/1024:.0f}KB"
            status = f"OK  {count:>10,} rows  {size_str:>8}  {elapsed:.1f}s"
        except Exception as e:
            errors.append((table, str(e)))
            status = f"ERR {e}"

        print(f"  [{i:>2}/{len(ordered)}] {table:<45} {status}")
        sys.stdout.flush()

    local_conn = psycopg2.connect(**LOCAL_DSN)
    local_cur = local_conn.cursor()
    local_cur.execute("SET session_replication_role = 'origin';")
    local_conn.commit()
    local_cur.close()
    local_conn.close()

    elapsed_total = time.time() - start
    print(f"\n{'='*60}")
    print(f"  Total rows:  {total_rows:,}")
    print(f"  Total data:  {total_bytes/1024/1024:.0f} MB")
    print(f"  Time:        {elapsed_total:.0f}s ({elapsed_total/60:.1f}min)")
    print(f"  Tables OK:   {len(ordered) - len(errors)}/{len(ordered)}")

    if errors:
        print(f"\n  ERRORS ({len(errors)}):")
        for t, e in errors:
            print(f"    {t}: {e}")

    try:
        os.rmdir(TEMP_DIR)
    except:
        pass

if __name__ == '__main__':
    main()

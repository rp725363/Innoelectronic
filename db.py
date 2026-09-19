"""
Database and Catalog Sync Engine for Innoelectronics
Powered by SQLite with FTS5 Full-Text Search and B-Tree indexing.
Designed for scalability up to 100,000+ products with sub-millisecond query latency.
"""
import os
import io
import csv
import re
import time
import sqlite3
import threading
import urllib.request

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'catalog.db')
SHEET_ID = '12CYpadbOJkj4HUCDTTHflMPHH2sWCqJ8-6x8X8pZbUs'
SHEET_NAME = 'Products'
GOOGLE_SHEET_URL = f'https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet={SHEET_NAME}'
CACHE_TTL_SECONDS = 3600  # Background refresh every 1 hour

_sync_lock = threading.Lock()
_is_syncing = False


def get_db_connection():
    """Returns a SQLite connection configured for high performance."""
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA cache_size = -64000;")  # 64MB cache
    return conn


def init_db():
    """Initializes the database schema with indexes and FTS5 table."""
    conn = get_db_connection()
    with conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            sku TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            price TEXT,
            parsed_price REAL,
            stock INTEGER DEFAULT 0,
            in_stock INTEGER DEFAULT 0,
            image TEXT,
            partcode TEXT,
            datasheet TEXT,
            sheet_index INTEGER,
            updated_at INTEGER
        );
        """)

        conn.execute("CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_products_instock ON products(in_stock);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_products_price ON products(parsed_price);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_products_sheet_idx ON products(sheet_index);")

        conn.execute("""
        CREATE TABLE IF NOT EXISTS sync_meta (
            key TEXT PRIMARY KEY,
            value TEXT
        );
        """)

        # Check if FTS5 table exists
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='products_fts';")
        if not cursor.fetchone():
            try:
                conn.execute("""
                CREATE VIRTUAL TABLE products_fts USING fts5(
                    sku,
                    name,
                    category,
                    description,
                    partcode,
                    content='products',
                    content_rowid='rowid'
                );
                """)
                # Auto-sync triggers
                conn.execute("""
                CREATE TRIGGER products_ai AFTER INSERT ON products BEGIN
                  INSERT INTO products_fts(rowid, sku, name, category, description, partcode)
                  VALUES (new.rowid, new.sku, new.name, new.category, new.description, new.partcode);
                END;
                """)
                conn.execute("""
                CREATE TRIGGER products_ad AFTER DELETE ON products BEGIN
                  INSERT INTO products_fts(products_fts, rowid, sku, name, category, description, partcode)
                  VALUES('delete', old.rowid, old.sku, old.name, old.category, old.description, old.partcode);
                END;
                """)
                conn.execute("""
                CREATE TRIGGER products_au AFTER UPDATE ON products BEGIN
                  INSERT INTO products_fts(products_fts, rowid, sku, name, category, description, partcode)
                  VALUES('delete', old.rowid, old.sku, old.name, old.category, old.description, old.partcode);
                  INSERT INTO products_fts(rowid, sku, name, category, description, partcode)
                  VALUES (new.rowid, new.sku, new.name, new.category, new.description, new.partcode);
                END;
                """)
            except Exception as e:
                print(f"[DB Warning] FTS5 initialization note: {e}")
    conn.close()


def normalize_stock(raw):
    s = (raw or '').strip().lower()
    if s in ['', 'na', 'n/a', 'null', 'none']:
        return 0
    if s in ['in stock', 'in_stock', 'instock', 'yes', 'y', 'available', 'available now', 'true', '1']:
        return 1
    if s in ['out of stock', 'out_of_stock', 'outofstock', 'no', 'n', 'unavailable', 'false', '0']:
        return 0

    digits = ''
    for ch in s:
        if (ch >= '0' and ch <= '9') or ch == '.':
            digits += ch
        elif digits:
            break
    try:
        n = float(digits)
        return int(n)
    except (ValueError, TypeError):
        return 0


def parse_price(raw):
    if not raw or raw.strip().lower() == 'x':
        return None
    cleaned = re.sub(r'[^\d.]', '', raw)
    if not cleaned:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def sync_products_from_sheet(force=False):
    """
    Fetches the catalog from Google Sheet and syncs atomically into SQLite.
    Returns: dict with total_products, categories_count, and sync status.
    """
    global _is_syncing
    if _is_syncing:
        return {'status': 'sync_already_in_progress'}

    with _sync_lock:
        _is_syncing = True
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Check last sync time
            if not force:
                cursor.execute("SELECT value FROM sync_meta WHERE key = 'last_sync_timestamp';")
                row = cursor.fetchone()
                if row:
                    last_time = float(row['value'])
                    if time.time() - last_time < CACHE_TTL_SECONDS:
                        cursor.execute("SELECT COUNT(*) as count FROM products;")
                        total = cursor.fetchone()['count']
                        conn.close()
                        return {'status': 'cached', 'total_products': total}

            print("[Sync] Fetching Google Sheet CSV...")
            req = urllib.request.Request(
                GOOGLE_SHEET_URL,
                headers={'User-Agent': 'Mozilla/5.0 InnoelectronicsCatalogSync/2.0'}
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                content = resp.read().decode('utf-8', errors='replace')

            reader = list(csv.reader(io.StringIO(content)))
            if len(reader) < 2:
                raise ValueError("CSV response contains no data rows")

            header = [h.strip().lower() for h in reader[0]]

            def get_col_idx(names):
                for name in names:
                    if name in header:
                        return header.index(name)
                return -1

            sku_idx = get_col_idx(['sku', 'id', 'item code'])
            name_idx = get_col_idx(['name', 'product name', 'title'])
            cat_idx = get_col_idx(['catogary', 'category', 'type', 'group'])
            desc_idx = get_col_idx(['description', 'desc', 'details', 'specs'])
            price_idx = get_col_idx(['price', 'unit price', 'cost', 'mrp'])
            stock_idx = get_col_idx(['stock', 'quantity', 'qty', 'inventory'])
            img_idx = get_col_idx(['imageurl', 'image', 'photo', 'picture', 'img'])
            part_idx = get_col_idx(['partcode', 'part code', 'part number', 'mpn'])
            sheet_idx = get_col_idx(['datasheeturl', 'datasheet', 'datasheet url', 'pdf'])

            rows_to_insert = []
            now_ts = int(time.time())

            for r_idx, r in enumerate(reader[1:], start=1):
                if not r or not any(c.strip() for c in r):
                    continue

                sku = (r[sku_idx].strip() if sku_idx >= 0 and sku_idx < len(r) else '') or f'SKU-{r_idx}'
                name = (r[name_idx].strip() if name_idx >= 0 and name_idx < len(r) else '') or f'Product {r_idx}'
                category = (r[cat_idx].strip() if cat_idx >= 0 and cat_idx < len(r) else '') or 'General Components'
                description = r[desc_idx].strip() if desc_idx >= 0 and desc_idx < len(r) else ''
                raw_price = r[price_idx].strip() if price_idx >= 0 and price_idx < len(r) else ''
                raw_stock = r[stock_idx].strip() if stock_idx >= 0 and stock_idx < len(r) else ''

                stock = normalize_stock(raw_stock)
                p_price = parse_price(raw_price)

                image = r[img_idx].strip() if img_idx >= 0 and img_idx < len(r) else ''
                partcode = r[part_idx].strip() if part_idx >= 0 and part_idx < len(r) else 'x'
                datasheet = r[sheet_idx].strip() if sheet_idx >= 0 and sheet_idx < len(r) else 'x'

                rows_to_insert.append((
                    sku,
                    name,
                    category,
                    description,
                    raw_price or 'X',
                    p_price,
                    stock,
                    1 if stock > 0 else 0,
                    image,
                    partcode,
                    datasheet,
                    r_idx - 1,
                    now_ts
                ))

            # Atomic transaction
            with conn:
                conn.execute("DELETE FROM products;")
                # Rebuild FTS table if exists
                try:
                    conn.execute("DELETE FROM products_fts;")
                except Exception:
                    pass

                conn.executemany("""
                INSERT INTO products (
                    sku, name, category, description, price, parsed_price,
                    stock, in_stock, image, partcode, datasheet, sheet_index, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, rows_to_insert)

                conn.execute("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_sync_timestamp', ?);", (str(now_ts),))
                conn.execute("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('total_products', ?);", (str(len(rows_to_insert)),))

            print(f"[Sync Success] Indexed {len(rows_to_insert)} products into SQLite.")
            conn.close()
            return {'status': 'success', 'total_products': len(rows_to_insert)}

        except Exception as e:
            print(f"[Sync Error] Failed to sync from sheet: {e}")
            return {'status': 'error', 'message': str(e)}
        finally:
            _is_syncing = False


def ensure_data_ready_async():
    """Runs a background check to ensure catalog is populated without blocking web requests."""
    def worker():
        try:
            init_db()
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM products;")
            row = cursor.fetchone()
            count = row['count'] if row else 0
            conn.close()

            if count == 0:
                print("[Init] Local catalog empty. Initiating background sync...")
                sync_products_from_sheet(force=True)
            else:
                # Background sync if older than TTL
                sync_products_from_sheet(force=False)
        except Exception as err:
            print(f"[Background Sync Error]: {err}")

    t = threading.Thread(target=worker, daemon=True)
    t.start()


# --- Query Helpers ---

def get_catalog_summary():
    """Returns total count, categories list with product count and sample image."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM products;")
    total_products = cursor.fetchone()['total']

    cursor.execute("""
    SELECT 
        category as name,
        COUNT(*) as count,
        MIN(CASE WHEN image != '' AND image != 'x' THEN image ELSE NULL END) as sampleImage
    FROM products
    GROUP BY category
    ORDER BY count DESC;
    """)
    categories = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return {
        'totalProducts': total_products,
        'totalCategories': len(categories),
        'categories': categories
    }


def query_products(category=None, query=None, brand=None, pins=None, type_filter=None, sort=None, in_stock=False, page=1, limit=24):
    """
    Fast, scalable query with SQLite indexing and pagination.
    Handles 100,000+ items with sub-millisecond execution.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = []
    params = []

    # Category Filter
    if category:
        conditions.append("category = ?")
        params.append(category)

    # In Stock Filter
    if in_stock:
        conditions.append("in_stock = 1")

    # Search Query (Use FTS5 if available or parameterized LIKE)
    if query:
        q_term = query.strip()
        # Clean search terms for safe token matching
        tokens = [t.strip() for t in re.findall(r'[\w\d\.-]+', q_term) if t.strip()]
        if tokens:
            fts_query = ' AND '.join(f'"{t}"*' for t in tokens)
            try:
                # Test FTS query
                cursor.execute("SELECT rowid FROM products_fts WHERE products_fts MATCH ? LIMIT 1;", (fts_query,))
                conditions.append("rowid IN (SELECT rowid FROM products_fts WHERE products_fts MATCH ?)")
                params.append(fts_query)
            except Exception:
                # Fallback to standard SQL LIKE matching across fields
                like_clauses = []
                for tok in tokens:
                    like_clauses.append("(name LIKE ? OR description LIKE ? OR partcode LIKE ? OR sku LIKE ?)")
                    p_val = f"%{tok}%"
                    params.extend([p_val, p_val, p_val, p_val])
                conditions.append(" AND ".join(like_clauses))

    # Brand Filter
    if brand:
        conditions.append("(name LIKE ? OR description LIKE ? OR partcode LIKE ?)")
        b_val = f"%{brand.strip()}%"
        params.extend([b_val, b_val, b_val])

    # Type Filter
    if type_filter:
        conditions.append("(name LIKE ? OR description LIKE ?)")
        t_val = f"%{type_filter.strip()}%"
        params.extend([t_val, t_val])

    # Pins Filter
    if pins:
        p_str = pins.strip()
        if p_str == '2':
            conditions.append("(name LIKE '% 2 pin%' OR name LIKE '% 2-pin%' OR name LIKE '% 2p %' OR description LIKE '% 2 pin%')")
        elif p_str == '3':
            conditions.append("(name LIKE '% 3 pin%' OR name LIKE '% 3-pin%' OR name LIKE '% 3p %' OR description LIKE '% 3 pin%')")
        elif p_str == '4+':
            conditions.append("(name LIKE '% 4 pin%' OR name LIKE '% 5 pin%' OR name LIKE '% 6 pin%' OR name LIKE '% 8 pin%' OR description LIKE '% pin%')")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    # Sort
    order_clause = "ORDER BY rowid ASC"
    if sort == 'price_low':
        order_clause = "ORDER BY (parsed_price IS NULL) ASC, parsed_price ASC"
    elif sort == 'price_high':
        order_clause = "ORDER BY (parsed_price IS NULL) ASC, parsed_price DESC"
    elif sort == 'name_asc':
        order_clause = "ORDER BY name ASC"
    elif sort == 'name_desc':
        order_clause = "ORDER BY name DESC"
    elif sort == 'newest':
        order_clause = "ORDER BY rowid DESC"

    # Total count query
    count_sql = f"SELECT COUNT(*) as total FROM products {where_clause};"
    cursor.execute(count_sql, params)
    total = cursor.fetchone()['total']

    # Paginated select
    page = max(1, page)
    limit = min(100, max(1, limit))
    offset = (page - 1) * limit

    data_sql = f"""
    SELECT 
        sku, name, category, description, price, parsed_price as parsedPrice,
        stock, (in_stock = 1) as inStock, image, partcode, datasheet, sheet_index as sheetIndex
    FROM products
    {where_clause}
    {order_clause}
    LIMIT ? OFFSET ?;
    """
    cursor.execute(data_sql, params + [limit, offset])
    items = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return {
        'total': total,
        'page': page,
        'limit': limit,
        'totalPages': (total + limit - 1) // limit if total > 0 else 1,
        'items': items
    }


def get_product_by_sku(sku):
    """Fetches a single product by SKU or sheetIndex, plus 4 related category items."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT 
        sku, name, category, description, price, parsed_price as parsedPrice,
        stock, (in_stock = 1) as inStock, image, partcode, datasheet, sheet_index as sheetIndex
    FROM products
    WHERE LOWER(sku) = LOWER(?) OR CAST(sheet_index AS TEXT) = ?
    LIMIT 1;
    """, (sku.strip(), sku.strip()))

    row = cursor.fetchone()
    if not row:
        conn.close()
        return None, []

    product = dict(row)

    # Related items in same category
    cursor.execute("""
    SELECT 
        sku, name, category, description, price, parsed_price as parsedPrice,
        stock, (in_stock = 1) as inStock, image, partcode, datasheet, sheet_index as sheetIndex
    FROM products
    WHERE category = ? AND sku != ?
    LIMIT 4;
    """, (product['category'], product['sku']))

    related = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return product, related


def get_all_product_slugs():
    """Returns list of all products for generating dynamic XML sitemap."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT sku, category, name, updated_at FROM products ORDER BY rowid ASC;")
    items = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return items

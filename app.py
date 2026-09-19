"""
Innoelectronics - Production Web Application for PythonAnywhere
High-Performance Catalog API with SQLite FTS5 Search & Advanced SEO Engine.
"""
import os
import time
import urllib.parse
import json
from flask import Flask, request, jsonify, send_from_directory, abort, Response, render_template_string
import db

app = Flask(__name__, static_folder=None)

# Ensure database tables and background sync are initialized
db.init_db()
db.ensure_data_ready_async()

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')


def get_index_html_path():
    dist_index = os.path.join(DIST_DIR, 'index.html')
    if os.path.exists(dist_index):
        return dist_index
    src_index = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.html')
    if os.path.exists(src_index):
        return src_index
    return dist_index


# --- API Routes ---

@app.route('/api/health')
def api_health():
    """Returns application health and catalog metrics."""
    try:
        summary = db.get_catalog_summary()
        return jsonify({
            'status': 'ok',
            'app': 'Innoelectronics High-Performance Catalog API',
            'environment': 'PythonAnywhere / WSGI',
            'database': 'SQLite with FTS5 Full-Text Search',
            'cachedProducts': summary['totalProducts'],
            'totalCategories': summary['totalCategories'],
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        })
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500


@app.route('/api/catalog')
def api_catalog():
    """Returns categories summary and counts."""
    try:
        summary = db.get_catalog_summary()
        resp = jsonify({
            'success': True,
            'totalProducts': summary['totalProducts'],
            'totalCategories': summary['totalCategories'],
            'categories': summary['categories']
        })
        resp.headers['Cache-Control'] = 'public, max-age=60'
        return resp
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/products')
def api_products():
    """
    Search and filter products.
    Supports: category, q, brand, pins, type, sort, inStock, page, limit.
    """
    try:
        category = request.args.get('category', '').strip() or None
        query = request.args.get('q', '').strip() or None
        brand = request.args.get('brand', '').strip() or None
        pins = request.args.get('pins', '').strip() or None
        type_filter = request.args.get('type', '').strip() or None
        sort = request.args.get('sort', '').strip() or None
        in_stock = request.args.get('inStock', '').lower() == 'true'

        try:
            page = max(1, int(request.args.get('page', 1)))
        except ValueError:
            page = 1

        try:
            limit = min(100, max(1, int(request.args.get('limit', 24))))
        except ValueError:
            limit = 24

        result = db.query_products(
            category=category,
            query=query,
            brand=brand,
            pins=pins,
            type_filter=type_filter,
            sort=sort,
            in_stock=in_stock,
            page=page,
            limit=limit
        )

        resp = jsonify({
            'success': True,
            'total': result['total'],
            'page': result['page'],
            'limit': result['limit'],
            'totalPages': result['totalPages'],
            'items': result['items']
        })
        resp.headers['Cache-Control'] = 'public, max-age=30'
        return resp
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/product/<sku>')
def api_product_detail(sku):
    """Returns single product detail and related items in same category."""
    try:
        product, related = db.get_product_by_sku(sku)
        if not product:
            return jsonify({'success': False, 'error': 'Product not found'}), 404

        resp = jsonify({
            'success': True,
            'product': product,
            'related': related
        })
        resp.headers['Cache-Control'] = 'public, max-age=120'
        return resp
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/checkout', methods=['POST'])
def api_checkout():
    """Generates an order reference and formatted WhatsApp message."""
    data = request.get_json(force=True, silent=True) or {}
    name = data.get('name', 'Customer')
    email = data.get('email', '')
    phone = data.get('phone', '')
    address = data.get('address', '')
    notes = data.get('notes', '')
    items = data.get('items', [])

    if not items or not isinstance(items, list):
        return jsonify({'success': False, 'error': 'Cart is empty'}), 400

    order_id = f"INNO-{str(int(time.time()))[-6:]}"

    wa_message = f"*New Order Inquiry: {order_id}*\n\n"
    wa_message += f"*Customer:* {name}\n"
    wa_message += f"*Phone:* {phone}\n"
    wa_message += f"*Email:* {email}\n"
    wa_message += f"*Address:* {address or 'N/A'}\n\n"
    wa_message += "*Items Ordered:*\n"

    for idx, itm in enumerate(items, 1):
        price_str = f" [{itm.get('price')}]" if itm.get('price') else ""
        wa_message += f"{idx}. {itm.get('name')} (SKU: {itm.get('sku')}) - Qty: {itm.get('quantity', 1)}{price_str}\n"

    if notes:
        wa_message += f"\n*Notes:* {notes}\n"

    wa_url = f"https://wa.me/919428447698?text={urllib.parse.quote(wa_message)}"

    return jsonify({
        'success': True,
        'orderId': order_id,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'message': 'Order received! Please confirm on WhatsApp or wait for sales confirmation.',
        'whatsappUrl': wa_url,
        'whatsappPhone': '+91 94284 47698',
        'salesEmail': 'sales.innoelectronics@gmail.com'
    })


@app.route('/api/contact', methods=['POST'])
def api_contact():
    """Handles contact inquiries."""
    data = request.get_json(force=True, silent=True) or {}
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not name or not email or not message:
        return jsonify({'success': False, 'error': 'Name, email, and message are required.'}), 400

    return jsonify({
        'success': True,
        'message': 'Thank you for contacting Innoelectronics! Our team will get back to you within 24 hours.',
        'salesEmail': 'sales.innoelectronics@gmail.com',
        'salesPhone': '+91 94284 47698'
    })


@app.route('/api/sync', methods=['GET', 'POST'])
def api_sync():
    """
    Manual or webhook trigger to update the SQLite catalog from Google Sheets.
    Usage: GET or POST /api/sync?token=inno2026
    """
    token = request.args.get('token', '')
    # Allow local trigger or matched token
    if token and token != 'inno2026':
        return jsonify({'success': False, 'error': 'Unauthorized token'}), 403

    res = db.sync_products_from_sheet(force=True)
    return jsonify({
        'success': res.get('status') == 'success',
        'result': res
    })


# --- SEO: SITEMAP & ROBOTS.TXT ---

@app.route('/robots.txt')
def robots_txt():
    """Serves robots.txt with sitemap directive."""
    host = request.host_url.rstrip('/')
    content = f"""User-agent: *
Allow: /
Disallow: /api/

Sitemap: {host}/sitemap.xml
"""
    return Response(content, mimetype='text/plain')


@app.route('/sitemap.xml')
def sitemap_xml():
    """
    Dynamically generates a standards-compliant XML sitemap.
    Lists homepage, category hubs, and all individual products.
    """
    base_url = request.host_url.rstrip('/')
    products = db.get_all_product_slugs()
    summary = db.get_catalog_summary()

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    # 1. Homepage
    today = time.strftime('%Y-%m-%d')
    xml_lines.append(f"""  <url>
    <loc>{base_url}/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>""")

    # 2. Categories
    for cat in summary.get('categories', []):
        cat_url = f"{base_url}/?category={urllib.parse.quote(cat['name'])}"
        xml_lines.append(f"""  <url>
    <loc>{cat_url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>""")

    # 3. Product pages
    for p in products:
        p_url = f"{base_url}/product/{urllib.parse.quote(str(p['sku']))}"
        mod_date = time.strftime('%Y-%m-%d', time.gmtime(p.get('updated_at', time.time()))) if p.get('updated_at') else today
        xml_lines.append(f"""  <url>
    <loc>{p_url}</loc>
    <lastmod>{mod_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>""")

    xml_lines.append('</urlset>')
    return Response('\n'.join(xml_lines), mimetype='application/xml')


# --- Dynamic SEO Prerender & Static Serving ---

def render_page_with_seo(product=None):
    """
    Injects dynamic OpenGraph, Twitter, and Schema.org Product metadata
    directly into index.html for search engine crawlers and social share bots.
    """
    index_path = get_index_html_path()
    if not os.path.exists(index_path):
        return "Application building... please refresh in a moment.", 503

    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()

    if not product:
        return html

    # Build Product-Specific SEO tags
    p_name = product.get('name', 'Electronic Component')
    p_sku = product.get('sku', '')
    p_cat = product.get('category', 'Components')
    p_desc = product.get('description', '') or f"Genuine {p_name} ({p_sku}) in stock at Innoelectronics. Inquire for bulk pricing and technical datasheets."
    p_img = product.get('image') or f"{request.host_url.rstrip('/')}/logo9.png"
    p_price = product.get('parsedPrice') or 0.0
    p_instock = product.get('inStock', True)

    canonical_url = f"{request.host_url.rstrip('/')}/product/{urllib.parse.quote(p_sku)}"

    # Replacement tags
    seo_title = f"{p_name} (SKU: {p_sku}) - Innoelectronics"
    seo_desc = (p_desc[:155] + '...') if len(p_desc) > 155 else p_desc

    # Schema.org Product JSON-LD
    product_schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p_name,
        "sku": p_sku,
        "category": p_cat,
        "image": p_img,
        "description": p_desc,
        "brand": {
            "@type": "Brand",
            "name": "Innoelectronics"
        },
        "offers": {
            "@type": "Offer",
            "url": canonical_url,
            "priceCurrency": "INR",
            "price": str(p_price) if p_price > 0 else "Contact For Price",
            "availability": "https://schema.org/InStock" if p_instock else "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "Innoelectronics"
            }
        }
    }
    schema_script = f'<script type="application/ld+json">{json.dumps(product_schema, ensure_ascii=False)}</script>'

    # Inject into HTML
    html = html.replace(
        '<title>Innoelectronics - Premier Electronic Components &amp; Connectors Store</title>',
        f'<title>{seo_title}</title>'
    )
    html = html.replace('content="/logo9.png"', f'content="{p_img}"')
    
    # Inject Schema and custom OG tags right before </head>
    injected_head = f"""
    <meta name="description" content="{seo_desc}" />
    <meta property="og:title" content="{seo_title}" />
    <meta property="og:description" content="{seo_desc}" />
    <meta property="og:image" content="{p_img}" />
    <meta property="og:url" content="{canonical_url}" />
    <meta name="twitter:title" content="{seo_title}" />
    <meta name="twitter:description" content="{seo_desc}" />
    <meta name="twitter:image" content="{p_img}" />
    <link rel="canonical" href="{canonical_url}" />
    {schema_script}
    </head>"""

    html = html.replace('</head>', injected_head, 1)
    return html


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """
    Serves static files, routes /product/<sku> with dynamic SEO prerendering,
    and falls back to Single Page Application.
    """
    if path.startswith('api/'):
        abort(404)

    # 1. Check if path is a static file that exists in dist
    target_file = os.path.join(DIST_DIR, path)
    if path and os.path.exists(target_file) and not os.path.isdir(target_file):
        return send_from_directory(DIST_DIR, path)

    # 2. Check for /product/<sku> dynamic SEO injection
    if path.startswith('product/'):
        sku_candidate = path.split('product/', 1)[1].strip()
        if sku_candidate:
            product, _ = db.get_product_by_sku(sku_candidate)
            if product:
                return render_page_with_seo(product)

    # 3. Default SPA fallback
    return render_page_with_seo(None)


if __name__ == '__main__':
    print("[Server] Starting Innoelectronics local development server...")
    app.run(host='0.0.0.0', port=5000, debug=True)

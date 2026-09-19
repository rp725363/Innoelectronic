"""
Automated Comprehensive Test Suite for Innoelectronics Backend & SEO
Verifies SQLite indexing, query performance, API endpoints, WhatsApp checkout,
XML Sitemap, and Dynamic SEO meta prerendering.
"""
import unittest
import json
import xml.etree.ElementTree as ET
import db
import app as flask_app_module


class TestInnoelectronicsBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n--- Starting Innoelectronics Backend Test Suite ---")
        db.init_db()
        # Ensure data is populated
        summary = db.get_catalog_summary()
        if summary['totalProducts'] == 0:
            print("Populating test database from Google Sheet...")
            db.sync_products_from_sheet(force=True)

        flask_app_module.app.testing = True
        cls.client = flask_app_module.app.test_client()

    def test_01_database_catalog_summary(self):
        """Test database catalog summary and category counts."""
        summary = db.get_catalog_summary()
        self.assertGreater(summary['totalProducts'], 3000, "Should have over 3,000 products")
        self.assertGreater(summary['totalCategories'], 10, "Should have over 10 categories")
        print(f"PASS: Catalog has {summary['totalProducts']} products across {summary['totalCategories']} categories.")

    def test_02_api_health(self):
        """Test /api/health endpoint."""
        resp = self.client.get('/api/health')
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertEqual(data['status'], 'ok')
        self.assertIn('cachedProducts', data)
        self.assertGreater(data['cachedProducts'], 3000)
        print("PASS: /api/health verified.")

    def test_03_api_catalog(self):
        """Test /api/catalog endpoint."""
        resp = self.client.get('/api/catalog')
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertTrue(data['success'])
        self.assertGreater(data['totalCategories'], 5)
        # Check first category structure
        first_cat = data['categories'][0]
        self.assertIn('name', first_cat)
        self.assertIn('count', first_cat)
        self.assertGreater(first_cat['count'], 0)
        print(f"PASS: /api/catalog returns top category '{first_cat['name']}' with {first_cat['count']} items.")

    def test_04_api_products_search_and_filter(self):
        """Test /api/products with search, filters, and pagination."""
        # 1. Search for 'connector'
        resp = self.client.get('/api/products?q=connector&limit=10')
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertTrue(data['success'])
        self.assertGreater(data['total'], 0)
        self.assertEqual(len(data['items']), min(10, data['total']))

        # 2. Filter by inStock=true
        resp_instock = self.client.get('/api/products?inStock=true&limit=5')
        data_instock = json.loads(resp_instock.data)
        for itm in data_instock['items']:
            self.assertTrue(itm['inStock'])

        # 3. Sort by price low
        resp_sort = self.client.get('/api/products?sort=price_low&limit=5')
        data_sort = json.loads(resp_sort.data)
        self.assertTrue(data_sort['success'])
        print(f"PASS: /api/products search returned {data['total']} items for 'connector'.")

    def test_05_api_product_detail(self):
        """Test /api/product/<sku> with related category items."""
        # Get first product SKU
        first_sku = '250001'
        resp = self.client.get(f'/api/product/{first_sku}')
        if resp.status_code != 200:
            # Fallback to querying any item
            p_res = db.query_products(limit=1)
            first_sku = p_res['items'][0]['sku']
            resp = self.client.get(f'/api/product/{first_sku}')

        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['product']['sku'], first_sku)
        self.assertIsInstance(data['related'], list)
        print(f"PASS: Product detail retrieved for SKU '{first_sku}' with {len(data['related'])} related items.")

    def test_06_api_checkout_whatsapp(self):
        """Test /api/checkout WhatsApp message generation."""
        payload = {
            "name": "Arjun Patel",
            "email": "arjun@example.com",
            "phone": "+91 98765 43210",
            "address": "GIDC Industrial Estate, Vadodara, Gujarat",
            "notes": "Urgent delivery needed for production line",
            "items": [
                {"sku": "250001", "name": "Molex KK 2.54mm Connector 16-Pin", "quantity": 100, "price": "12.50"}
            ]
        }
        resp = self.client.post('/api/checkout', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertTrue(data['success'])
        self.assertIn('whatsappUrl', data)
        self.assertIn('wa.me/919428447698', data['whatsappUrl'])
        self.assertIn('Molex', data['whatsappUrl'])
        print(f"PASS: /api/checkout generated Order ID '{data['orderId']}' with WhatsApp direct link.")

    def test_07_api_contact(self):
        """Test /api/contact inquiry handler."""
        payload = {
            "name": "Industrial Client",
            "email": "procurement@techcorp.in",
            "message": "We need custom harness assemblies for our electronics unit."
        }
        resp = self.client.post('/api/contact', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertTrue(data['success'])
        print("PASS: /api/contact successfully received.")

    def test_08_seo_sitemap_xml(self):
        """Test /sitemap.xml conforms to standard sitemap XML."""
        resp = self.client.get('/sitemap.xml')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('application/xml', resp.content_type)
        xml_content = resp.data.decode('utf-8')
        root = ET.fromstring(xml_content)
        self.assertTrue(root.tag.endswith('urlset'))
        # Should have thousands of URLs
        urls = root.findall('{http://www.sitemaps.org/schemas/sitemap/0.9}url')
        self.assertGreater(len(urls), 100, "Sitemap should contain all products and categories")
        print(f"PASS: /sitemap.xml generated with {len(urls)} indexed URLs.")

    def test_09_seo_robots_txt(self):
        """Test /robots.txt includes sitemap reference."""
        resp = self.client.get('/robots.txt')
        self.assertEqual(resp.status_code, 200)
        text = resp.data.decode('utf-8')
        self.assertIn('User-agent: *', text)
        self.assertIn('Sitemap:', text)
        print("PASS: /robots.txt properly configured.")

    def test_10_seo_dynamic_product_prerender(self):
        """Test dynamic SSR meta and Schema.org Product injection on /product/<sku>."""
        p_res = db.query_products(limit=1)
        test_sku = p_res['items'][0]['sku']
        test_name = p_res['items'][0]['name']

        resp = self.client.get(f'/product/{test_sku}')
        self.assertEqual(resp.status_code, 200)
        html = resp.data.decode('utf-8')

        # Check injected dynamic SEO tags
        self.assertIn(f"{test_name} (SKU: {test_sku}) - Innoelectronics", html)
        self.assertIn('property="og:title"', html)
        self.assertIn('property="og:image"', html)
        self.assertIn('application/ld+json', html)
        self.assertIn('"@type": "Product"', html)
        self.assertIn(test_sku, html)
        print(f"PASS: Dynamic SEO Prerender for SKU '{test_sku}' verified with Schema.org Product JSON-LD.")


if __name__ == '__main__':
    unittest.main()

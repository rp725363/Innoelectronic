import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

interface Product {
  sku: string;
  name: string;
  category: string;
  description: string;
  price: string;
  parsedPrice: number | null;
  stock: number; // 0 = out of stock, >0 = in stock
  inStock: boolean;
  image: string;
  partcode: string;
  datasheet: string;
  sheetIndex?: number;
}

// In-memory cache for sheet products with 120s TTL
let sheetCache: { [category: string]: Product[] } | null = null;
let allProductsList: Product[] = [];
let sheetCacheTimestamp = 0;
const CACHE_TTL_MS = 120 * 1000;

function normalizeStock(raw: string | null | undefined): number {
  const s = (raw || '').trim().toLowerCase();
  if (['', 'na', 'n/a', 'null', 'none'].includes(s)) return 0;
  if (['in stock', 'in_stock', 'instock', 'yes', 'y', 'available', 'available now', 'true', '1'].includes(s)) return 1;
  if (['out of stock', 'out_of_stock', 'outofstock', 'no', 'n', 'unavailable', 'false', '0'].includes(s)) return 0;

  // Numeric fallback (e.g. "10", "10 pcs", "~5")
  let digits = '';
  for (const ch of s) {
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      digits += ch;
    } else if (digits) {
      break;
    }
  }
  const n = parseFloat(digits);
  return isNaN(n) ? 0 : Math.floor(n);
}

function parsePrice(raw: string | null | undefined): number | null {
  if (!raw || raw.trim().toLowerCase() === 'x') return null;
  const cleaned = raw.replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const p = parseFloat(cleaned);
  return isNaN(p) ? null : p;
}

function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let inQuote = false;
  let field = '';
  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    if (inQuote) {
      if (c === '"' && csvText[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuote = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuote = true;
      } else if (c === ',') {
        cur.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && csvText[i + 1] === '\n') {
          i++;
        }
        cur.push(field);
        field = '';
        if (cur.some((col) => col.trim().length > 0)) {
          rows.push(cur);
        }
        cur = [];
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  return rows;
}

async function fetchProductsFromSheet(): Promise<{ [cat: string]: Product[] }> {
  const now = Date.now();
  if (sheetCache && now - sheetCacheTimestamp < CACHE_TTL_MS) {
    return sheetCache;
  }

  const sheetId = '12CYpadbOJkj4HUCDTTHflMPHH2sWCqJ8-6x8X8pZbUs';
  const sheetName = 'Products';
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      throw new Error(`Google Sheet request failed with status: ${res.status}`);
    }
    const csvData = await res.text();
    const rows = parseCSV(csvData);
    if (rows.length < 2) {
      throw new Error('CSV has no data rows');
    }

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const getColIdx = (names: string[]) => {
      for (const n of names) {
        const idx = header.indexOf(n);
        if (idx >= 0) return idx;
      }
      return -1;
    };

    const skuIdx = getColIdx(['sku', 'id', 'item code']);
    const nameIdx = getColIdx(['name', 'product name', 'title']);
    const catIdx = getColIdx(['catogary', 'category', 'type', 'group']);
    const descIdx = getColIdx(['description', 'desc', 'details', 'specs']);
    const priceIdx = getColIdx(['price', 'unit price', 'cost', 'mrp']);
    const stockIdx = getColIdx(['stock', 'quantity', 'qty', 'inventory']);
    const imageIdx = getColIdx(['imageurl', 'image', 'photo', 'picture', 'img']);
    const partcodeIdx = getColIdx(['partcode', 'part code', 'part number', 'mpn']);
    const datasheetIdx = getColIdx(['datasheeturl', 'datasheet', 'datasheet url', 'pdf']);

    const grouped: { [cat: string]: Product[] } = {};
    const flat: Product[] = [];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const category = (catIdx >= 0 ? row[catIdx] : '')?.trim() || 'General Components';
      const rawStock = stockIdx >= 0 ? row[stockIdx] : '';
      const stock = normalizeStock(rawStock);
      const rawPrice = priceIdx >= 0 ? row[priceIdx]?.trim() : '';

      const product: Product = {
        sku: (skuIdx >= 0 ? row[skuIdx] : '')?.trim() || `SKU-${r}`,
        name: (nameIdx >= 0 ? row[nameIdx] : '')?.trim() || `Product ${r}`,
        category,
        description: (descIdx >= 0 ? row[descIdx] : '')?.trim() || '',
        price: rawPrice || 'X',
        parsedPrice: parsePrice(rawPrice),
        stock,
        inStock: stock > 0,
        image: (imageIdx >= 0 ? row[imageIdx] : '')?.trim() || '',
        partcode: (partcodeIdx >= 0 ? row[partcodeIdx] : '')?.trim() || 'x',
        datasheet: (datasheetIdx >= 0 ? row[datasheetIdx] : '')?.trim() || 'x',
        sheetIndex: r - 1,
      };

      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
      flat.push(product);
    }

    sheetCache = grouped;
    allProductsList = flat;
    sheetCacheTimestamp = now;
    console.log(`Loaded ${flat.length} products in ${Object.keys(grouped).length} categories from Google Sheet.`);
    return grouped;
  } catch (err) {
    console.error('Error fetching sheet data:', err);
    if (sheetCache) {
      console.warn('Returning stale cached sheet data');
      return sheetCache;
    }
    throw err;
  }
}

// 1. API: Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Innoelectronics Catalog API',
    cachedProducts: allProductsList.length,
    timestamp: new Date().toISOString(),
  });
});

// 2. API: Catalog metadata and categories summary
app.get('/api/catalog', async (req: Request, res: Response) => {
  try {
    const grouped = await fetchProductsFromSheet();
    const categories = Object.keys(grouped).map((cat) => ({
      name: cat,
      count: grouped[cat].length,
      sampleImage: grouped[cat].find((p) => p.image && p.image !== 'x')?.image || '',
    }));

    // Sort categories by product count descending
    categories.sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      totalProducts: allProductsList.length,
      totalCategories: categories.length,
      categories,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch catalog' });
  }
});

// 3. API: Products search & filtering
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    await fetchProductsFromSheet();

    const category = (req.query.category as string)?.trim();
    const q = (req.query.q as string)?.trim().toLowerCase() || '';
    const brand = (req.query.brand as string)?.trim().toLowerCase() || '';
    const pins = (req.query.pins as string)?.trim() || '';
    const type = (req.query.type as string)?.trim().toLowerCase() || '';
    const sort = (req.query.sort as string)?.trim() || '';
    const inStockOnly = req.query.inStock === 'true';
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 24));

    let items = category && sheetCache && sheetCache[category] ? [...sheetCache[category]] : [...allProductsList];

    // Filter by search query
    if (q) {
      items = items.filter((p) => {
        const text = `${p.name} ${p.description} ${p.partcode} ${p.sku} ${p.category}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Filter by brand
    if (brand) {
      items = items.filter((p) => {
        const text = `${p.name} ${p.description} ${p.partcode}`.toLowerCase();
        return text.includes(brand);
      });
    }

    // Filter by type
    if (type) {
      items = items.filter((p) => {
        const text = `${p.name} ${p.description}`.toLowerCase();
        return text.includes(type);
      });
    }

    // Filter by pins (2, 3, 4+)
    if (pins) {
      items = items.filter((p) => {
        const text = `${p.name} ${p.description}`.toLowerCase();
        if (pins === '2') {
          return /\b2[\s-]*pins?\b/.test(text) || /\b2p\b/.test(text);
        }
        if (pins === '3') {
          return /\b3[\s-]*pins?\b/.test(text) || /\b3p\b/.test(text);
        }
        if (pins === '4+') {
          const m = text.match(/(\d+)[\s-]*pins?\b/);
          if (m && parseInt(m[1], 10) >= 4) return true;
          return /\b(4|5|6|7|8|9|1\d+)[\s-]*pins?\b/.test(text);
        }
        return true;
      });
    }

    // Filter by stock
    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    // Sort
    if (sort === 'price_low') {
      items.sort((a, b) => {
        if (a.parsedPrice === null) return 1;
        if (b.parsedPrice === null) return -1;
        return a.parsedPrice - b.parsedPrice;
      });
    } else if (sort === 'price_high') {
      items.sort((a, b) => {
        if (a.parsedPrice === null) return 1;
        if (b.parsedPrice === null) return -1;
        return b.parsedPrice - a.parsedPrice;
      });
    } else if (sort === 'name_asc') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name_desc') {
      items.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === 'newest') {
      items.reverse();
    }

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: paginatedItems,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to query products' });
  }
});

// 4. API: Single Product Detail by SKU
app.get('/api/product/:sku', async (req: Request, res: Response) => {
  try {
    await fetchProductsFromSheet();
    const skuParam = req.params.sku.trim();
    const product = allProductsList.find(
      (p) => p.sku.toLowerCase() === skuParam.toLowerCase() || String(p.sheetIndex) === skuParam
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Also get related products in same category
    const related = (sheetCache?.[product.category] || [])
      .filter((p) => p.sku !== product.sku)
      .slice(0, 4);

    res.json({
      success: true,
      product,
      related,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch product' });
  }
});

// 5. API: Checkout submission
app.post('/api/checkout', (req: Request, res: Response) => {
  const { name, email, phone, address, notes, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Cart is empty' });
  }

  const orderId = `INNO-${Date.now().toString().slice(-6)}`;
  console.log(`[ORDER PLACED] ${orderId} by ${name} (${email}, ${phone}) with ${items.length} items.`);

  // Generate WhatsApp pre-filled message text
  let waMessage = `*New Order Inquiry: ${orderId}*\n\n`;
  waMessage += `*Customer:* ${name}\n`;
  waMessage += `*Phone:* ${phone}\n`;
  waMessage += `*Email:* ${email}\n`;
  waMessage += `*Address:* ${address || 'N/A'}\n\n`;
  waMessage += `*Items Ordered:*\n`;

  items.forEach((item: any, idx: number) => {
    waMessage += `${idx + 1}. ${item.name} (SKU: ${item.sku}) - Qty: ${item.quantity || 1} ${item.price ? `[${item.price}]` : ''}\n`;
  });

  if (notes) {
    waMessage += `\n*Notes:* ${notes}\n`;
  }

  const waUrl = `https://wa.me/919428447698?text=${encodeURIComponent(waMessage)}`;

  res.json({
    success: true,
    orderId,
    timestamp: new Date().toISOString(),
    message: 'Order received! Please confirm on WhatsApp or wait for sales confirmation.',
    whatsappUrl: waUrl,
    whatsappPhone: '+91 94284 47698',
    salesEmail: 'sales.innoelectronics@gmail.com',
  });
});

// 6. API: Contact Form submission
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  console.log(`[CONTACT INQUIRY] From: ${name} <${email}> | Subject: ${subject}`);
  console.log(`Message: ${message}`);

  res.json({
    success: true,
    message: 'Thank you for contacting Innoelectronics! Our team will get back to you within 24 hours.',
    salesEmail: 'sales.innoelectronics@gmail.com',
    salesPhone: '+91 94284 47698',
  });
});

// 7. API: Force sync / flush cache from Google Sheet
app.all('/api/sync', async (req: Request, res: Response) => {
  try {
    sheetCache = null;
    sheetCacheTimestamp = 0;
    await fetchProductsFromSheet();
    res.json({
      success: true,
      message: 'Catalog synchronized from Google Sheet successfully.',
      totalProducts: allProductsList.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Sync failed' });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  // Preload products in background
  fetchProductsFromSheet().catch((e) => console.warn('Initial sheet load deferred:', e.message));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Innoelectronics server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

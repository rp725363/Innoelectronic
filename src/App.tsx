import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Cpu, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  List, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Package, 
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Truck,
  BookOpen,
  Headphones,
  Check
} from 'lucide-react';
import { Product, CartItem, CategorySummary, FilterState } from './types';
import { KNOWN_CATEGORIES } from './data/categories';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { FilterSidebar } from './components/FilterSidebar';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';
import { Logo } from './components/Logo';
import { getCategoryFallbackImage, CATEGORY_METADATA } from './data/categoryImages';

const CART_STORAGE_KEY = 'inno_cart_items_v1';

export default function App() {
  // Navigation View State: 'home' (landing with categories and company info, NO product cards) vs 'catalog' (full products list, filters & cards)
  const [currentView, setCurrentView] = useState<'home' | 'catalog'>('home');

  // State: Catalog & Categories
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [totalCatalogCount, setTotalCatalogCount] = useState<number>(0);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // State: Filter & Query
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    brand: '',
    type: '',
    pins: '',
    sort: '',
    inStockOnly: false,
    page: 1,
    limit: 24,
  });

  // State: Products listing
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // State: Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State: Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to persist cart:', e);
    }
  }, [cart]);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Fetch initial catalog categories summary
  const loadCatalog = useCallback(async () => {
    try {
      setLoadingCatalog(true);
      const res = await fetch('/api/catalog');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setTotalCatalogCount(data.totalProducts || 0);
      }
    } catch (e) {
      console.error('Failed to load catalog metadata:', e);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Fetch filtered products
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.search) params.set('q', filters.search);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.type) params.set('type', filters.type);
      if (filters.pins) params.set('pins', filters.pins);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.inStockOnly) params.set('inStock', 'true');
      params.set('page', String(filters.page));
      params.set('limit', String(filters.limit));

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.items || []);
        setTotalProducts(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoadingProducts(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.sku === product.sku);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${product.name} to cart`);
  };

  const handleUpdateCartQuantity = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.sku === sku) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.product.sku !== sku));
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Cart cleared');
  };

  // Filter handlers
  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      type: '',
      pins: '',
      sort: '',
      inStockOnly: false,
      page: 1,
      limit: 24,
    });
  };

  const handleGoHome = () => {
    setCurrentView('home');
    handleResetFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCatalog = (cat?: string) => {
    if (cat) {
      setFilters((prev) => ({
        ...prev,
        category: cat,
        brand: '',
        pins: '',
        page: 1,
      }));
    }
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: string) => {
    setFilters((prev) => ({
      ...prev,
      category: cat,
      brand: '',
      pins: '',
      page: 1,
    }));
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalCartCount = useMemo(
    () => cart.reduce((sum, it) => sum + it.quantity, 0),
    [cart]
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        categories={categories}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={handleSelectCategory}
        activeCategory={filters.category}
        searchQuery={filters.search}
        onSearchChange={(q) => {
          handleFilterChange({ search: q, page: 1 });
          if (q.trim()) {
            setCurrentView('catalog');
          }
        }}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onHomeClick={handleGoHome}
        currentView={currentView}
        onNavigateToCatalog={() => handleNavigateToCatalog()}
      />

      {/* HOMEPAGE VIEW (NO PRODUCT CARDS) */}
      {currentView === 'home' && (
        <div className="flex-1 w-full">
          {/* Hero Banner Highlighting Innoelectronics Brand & Catalog */}
          <section className="bg-slate-900 text-white relative overflow-hidden border-b border-slate-800 py-12 md:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Brand Statement & Search */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center space-x-2 bg-slate-800/90 text-cyan-400 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Innoelectronics Official Online Catalog &bull; 3,400+ SKUs</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-400">
                      Innoelectronics
                    </span>
                    <br className="hidden sm:inline" />
                    <span className="text-slate-100 font-bold text-2xl sm:text-3xl lg:text-4xl block mt-1">
                      High-Performance Connectors &amp; Electronic Hardware
                    </span>
                  </h1>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                    Welcome to <strong>Innoelectronics</strong>, India&apos;s premier online distributor of authentic Molex, JST, Dupont, XLR, Anderson power connectors, microcontrollers, and electronic prototyping tools. Access real-time inventory counts and manufacturer technical datasheets.
                  </p>

                  {/* Main Action CTAs */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleNavigateToCatalog()}
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg hover:shadow-cyan-500/25 transition-all"
                    >
                      <span>Browse 3,400+ Components</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Request Custom Quote (RFQ)</span>
                    </button>
                  </div>

                  {/* Quick Search Tags */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Popular Searches:</span>
                    {[
                      { label: 'Molex KK 2.54mm', q: 'Molex' },
                      { label: 'JST-XH', q: 'JST-XH' },
                      { label: 'Anderson 175A', q: 'Anderson' },
                      { label: 'Terminal Blocks', cat: 'Terminal Blocks' },
                      { label: 'Microcontrollers', cat: 'Microcontrollers' },
                      { label: 'Soldering Tools', cat: 'Soldering Tools' },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => {
                          if (chip.cat) handleSelectCategory(chip.cat);
                          else {
                            handleFilterChange({ search: chip.q, page: 1 });
                            setCurrentView('catalog');
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Column: Innoelectronics Brand Spotlight Card */}
                <div className="lg:col-span-5">
                  <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 shadow-2xl backdrop-blur-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Verified Distributor
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">HQ Ahmedabad, India</span>
                    </div>

                    <div className="pt-1">
                      <Logo size="lg" variant="dark" showSubtitle={true} allowCustomUpload={true} />
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      At <strong>Innoelectronics</strong>, we supply certified electronic components with 100% trace authenticity, guaranteed pinout mating, and express shipping to over 20,000 pincodes across India.
                    </p>

                    <div className="grid grid-cols-2 gap-2.5 pt-2 text-[11px]">
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400 block">Inventory</span>
                        <span className="font-bold text-white text-xs">3,400+ Live SKUs</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400 block">Support</span>
                        <span className="font-bold text-cyan-400 text-xs">Direct WhatsApp RFQ</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href="https://wa.me/919428447698?text=Hello%20Innoelectronics,%20I%20would%20like%20to%20inquire%20about%20a%20component%20order"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-md"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Instant WhatsApp Helpdesk (+91 94284 47698)</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Banner */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block">Catalog SKUs</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {totalCatalogCount ? totalCatalogCount.toLocaleString() : '3,400+'} Parts
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Live inventory sync</span>
                </div>
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block">Categories</span>
                  <span className="text-lg font-bold text-white">18 Categories</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Connectors &amp; actives</span>
                </div>
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block">Datasheets</span>
                  <span className="text-lg font-bold text-emerald-400">Verified PDFs</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Manufacturer pinouts</span>
                </div>
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block">Dispatch Hub</span>
                  <span className="text-lg font-bold text-amber-400">Pan-India Delivery</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Express courier tracking</span>
                </div>
              </div>
            </div>
          </section>

          {/* Explore by Category Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Explore by Category</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Select a product line to browse available components and technical datasheets
                </p>
              </div>
              <button
                onClick={() => handleNavigateToCatalog()}
                className="inline-flex items-center text-xs sm:text-sm font-semibold text-cyan-700 hover:text-cyan-800 space-x-1"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat) => {
                const meta = CATEGORY_METADATA[cat.name];
                const catImg = getCategoryFallbackImage(cat.name, cat.sampleImage);
                return (
                  <button
                    key={cat.name}
                    onClick={() => handleSelectCategory(cat.name)}
                    className="bg-white rounded-xl border border-slate-200 hover:border-cyan-500 hover:shadow-lg transition-all text-left flex flex-col justify-between group overflow-hidden"
                  >
                    {/* Categorical Product Image Container */}
                    <div className="relative w-full h-32 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3 overflow-hidden group-hover:bg-cyan-50/20 transition-colors">
                      <img
                        src={catImg}
                        alt={`Innoelectronics ${cat.name} categorical product`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xs"
                      />
                      <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-[10px] text-white font-semibold px-2 py-0.5 rounded-full shadow-xs">
                        {cat.count} parts
                      </span>
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1">
                          {cat.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 font-normal">
                          {meta?.popularParts ? meta.popularParts.slice(0, 2).join(' • ') : `${cat.count} verified components`}
                        </p>
                      </div>
                      <span className="text-[11px] text-cyan-600 font-semibold inline-flex items-center space-x-1 mt-2.5 group-hover:translate-x-0.5 transition-transform">
                        <span>Browse parts</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => handleNavigateToCatalog()}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm inline-flex items-center space-x-2 shadow-sm transition-all"
              >
                <span>Open All 3,400+ Components in Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Value Propositions / Why Innoelectronics */}
          <section className="bg-white border-y border-slate-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Why Engineers &amp; Buyers Choose Innoelectronics
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Engineered supply chain designed for prototype developers, hardware startups, and volume electronics manufacturers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">100% Genuine Components</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Direct OEM sourcing with zero counterfeit tolerance. All connector contacts and plastics match original specs.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Technical Datasheets</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Direct access to official PDF specifications, mating connector pinouts, current ratings, and pitch diagrams.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Pan-India Express Dispatch</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Fast order processing directly from our inventory hub with reliable courier tracking to all Indian pincodes.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Custom RFQ &amp; BOM Kitting</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Send your complete Bill of Materials on WhatsApp for unified quoting, hard-to-find part sourcing, and volume pricing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Solutions & Product Series Showcase (Informative presentation, no product buy cards) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Component Solutions</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Precision electrical interconnects and hardware for robotics, power electronics, IoT, and embedded devices
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1 */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-cyan-500 hover:shadow-md transition-all group">
                <div className="h-36 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3 relative overflow-hidden">
                  <img 
                    src="https://res.cloudinary.com/dks3wmj5e/image/upload/v1744911281/Molex_KK_2.54mm_Connector_16-Pin_a49ilf.webp"
                    alt="Wire-to-Board Molex KK and JST connectors"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                  />
                  <span className="absolute top-2 right-2 bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    1,431+ SKUs
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1">Signal &amp; Wire</div>
                    <h3 className="font-bold text-base text-slate-900 mb-2">Wire-to-Board Connectors</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Molex KK 2.54mm, Micro-Fit 3.0, JST-XH, JST-PH, Dupont headers, IDC ribbon sockets, and crimp terminals.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectCategory('Connectors')}
                    className="inline-flex items-center text-xs font-bold text-cyan-700 hover:text-cyan-800 space-x-1"
                  >
                    <span>Browse Connectors ({categories.find(c => c.name === 'Connectors')?.count || '1,400+'} items)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-cyan-500 hover:shadow-md transition-all group">
                <div className="h-36 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3 relative overflow-hidden">
                  <img 
                    src="https://res.cloudinary.com/dks3wmj5e/image/upload/v1744911281/Molex_KK_2.54mm_Connector_16-Pin_a49ilf.webp"
                    alt="Anderson Powerpole and heavy-duty power connectors"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                  />
                  <span className="absolute top-2 right-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    High Current
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Power Electronics</div>
                    <h3 className="font-bold text-base text-slate-900 mb-2">Heavy-Duty Power Connectors</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Anderson Powerpole 45A, 75A, 175A, XT30/XT60/XT90 battery connectors, EC5, terminal rings, and battery lugs.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleFilterChange({ search: 'Anderson', page: 1 });
                      setCurrentView('catalog');
                    }}
                    className="inline-flex items-center text-xs font-bold text-cyan-700 hover:text-cyan-800 space-x-1"
                  >
                    <span>Browse Power Connectors &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-cyan-500 hover:shadow-md transition-all group">
                <div className="h-36 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3 relative overflow-hidden">
                  <img 
                    src="https://res.cloudinary.com/dks3wmj5e/image/upload/v1745262918/1_zq4net.jpg"
                    alt="Industrial Terminal Blocks and wiring modules"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                  />
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    456 SKUs
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Industrial &amp; Automation</div>
                    <h3 className="font-bold text-base text-slate-900 mb-2">Terminal Blocks &amp; Wiring</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Pluggable screw terminal connectors, barrier terminal strips, DIN rail junction modules, and spring-cage blocks.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectCategory('Terminal Blocks')}
                    className="inline-flex items-center text-xs font-bold text-cyan-700 hover:text-cyan-800 space-x-1"
                  >
                    <span>Browse Terminal Blocks &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-cyan-500 hover:shadow-md transition-all group">
                <div className="h-36 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=600&auto=format&fit=crop&q=80"
                    alt="Microcontrollers and Embedded Systems"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                  />
                  <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    1,152 SKUs
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Embedded Systems</div>
                    <h3 className="font-bold text-base text-slate-900 mb-2">Microcontrollers &amp; Tools</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Development boards, microcontrollers, soldering stations, precision crimping pliers, and electronic assembly kits.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectCategory('Microcontrollers')}
                    className="inline-flex items-center text-xs font-bold text-cyan-700 hover:text-cyan-800 space-x-1"
                  >
                    <span>Browse Microcontrollers &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SEO Technical Guide & FAQ Section Highlighting Innoelectronics */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14" aria-label="Technical Guide and FAQ">
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-10">
              <div className="max-w-3xl mb-8">
                <span className="text-cyan-700 font-bold text-xs uppercase tracking-wider">
                  Technical Knowledge Base &bull; Innoelectronics
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Frequently Asked Questions &amp; Electronic Hardware Guide
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Everything you need to know about component specifications, connector mating standards, and sourcing through Innoelectronics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
                <article className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black flex items-center justify-center shrink-0">1</span>
                    <span>What brands and connectors does Innoelectronics supply?</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Innoelectronics</strong> stocks a wide array of genuine interconnect solutions including <strong>Molex KK (2.54mm &amp; 3.96mm)</strong>, <strong>JST (XH, PH, SM, VH)</strong>, <strong>Dupont jumpers</strong>, <strong>Anderson Powerpole (45A, 75A, 175A)</strong>, <strong>DIN rail terminal blocks</strong>, <strong>Phoenix contact equivalents</strong>, audio XLR jacks, and industrial automotive connectors.
                  </p>
                </article>

                <article className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black flex items-center justify-center shrink-0">2</span>
                    <span>How can I view component datasheets and pinouts?</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every product in the Innoelectronics catalog includes a verified manufacturer datasheet link, technical specifications table (pitch, contact material, current/voltage limits), and pinout diagram to ensure compatibility with your PCB layout.
                  </p>
                </article>

                <article className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black flex items-center justify-center shrink-0">3</span>
                    <span>Does Innoelectronics deliver across all of India?</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Yes! We ship to over 20,000 pincodes across India via express couriers (BlueDart, DTDC, Delhivery, Speed Post). Orders placed before 2:00 PM are processed for same-day dispatch from our central distribution hub.
                  </p>
                </article>

                <article className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black flex items-center justify-center shrink-0">4</span>
                    <span>Can I submit a custom Bill of Materials (BOM) or request GST invoices?</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Absolutely. Innoelectronics caters to R&amp;D labs, colleges, and commercial OEMs. Send your BOM spreadsheet directly via WhatsApp or our RFQ portal. We issue official GST tax invoices for commercial input tax credit.
                  </p>
                </article>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* CATALOG & PRODUCTS VIEW (Product cards ONLY appear here) */}
      {currentView === 'catalog' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
          {/* Breadcrumb & Navigation Top Bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={handleGoHome}
                className="text-cyan-700 hover:text-cyan-800 font-bold flex items-center space-x-1 bg-cyan-50 hover:bg-cyan-100 px-2 py-1 rounded-md transition-colors"
                title="Return to Homepage"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
              <span className="text-slate-300">/</span>
              <button
                onClick={handleResetFilters}
                className={`text-slate-600 hover:text-slate-900 font-medium ${
                  !filters.category && !filters.search ? 'font-bold text-slate-900' : ''
                }`}
              >
                Catalog
              </button>
              {filters.category && (
                <>
                  <span className="text-slate-400">&gt;</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {filters.category}
                  </span>
                </>
              )}
              {filters.search && (
                <>
                  <span className="text-slate-400">&gt;</span>
                  <span className="text-slate-600 font-medium">
                    Search: &ldquo;{filters.search}&rdquo;
                  </span>
                </>
              )}
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">
                Showing {products.length} of {totalProducts} parts
              </span>
            </div>

            <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Refresh */}
            <button
              onClick={() => fetchProducts()}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh Products"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingProducts ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Categorical Products Showcase Banner */}
        {filters.category ? (
          (() => {
            const currentCatMeta = CATEGORY_METADATA[filters.category];
            const currentCatSummary = categories.find(c => c.name === filters.category);
            const catImage = getCategoryFallbackImage(filters.category, currentCatSummary?.sampleImage);
            return (
              <div className="mb-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="flex flex-col md:flex-row items-center">
                  {/* Left: Prominent Categorical Product Image */}
                  <div className="w-full md:w-64 h-48 sm:h-52 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-100 shrink-0 relative">
                    <img
                      src={catImage}
                      alt={`Innoelectronics ${filters.category} categorical product`}
                      className="max-h-full max-w-full object-contain drop-shadow-md transition-transform hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {currentCatMeta?.badge || 'OEM Verified'}
                    </span>
                  </div>

                  {/* Middle & Right: Category details & Popular products chips */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                          {filters.category}
                        </h2>
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                          {currentCatSummary?.count || totalProducts} Components Available
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mb-4">
                        {currentCatMeta?.description || `Explore genuine, tested ${filters.category} components sourced directly from verified manufacturers with full datasheets and batch traceability.`}
                      </p>
                    </div>

                    {/* Quick Popular Parts Filter Tags */}
                    {currentCatMeta?.popularParts && currentCatMeta.popularParts.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          Popular Categorical Products in {filters.category}:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentCatMeta.popularParts.map((part) => (
                            <button
                              key={part}
                              onClick={() => {
                                const searchTerm = part.split(' ')[0];
                                handleFilterChange({ search: searchTerm, page: 1 });
                              }}
                              className="text-xs bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors font-medium"
                            >
                              + {part}
                            </button>
                          ))}
                          <button
                            onClick={() => handleFilterChange({ search: '', page: 1 })}
                            className="text-xs text-slate-500 hover:text-slate-800 underline px-2 py-1"
                          >
                            View all in category
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          /* Visual Horizontal Strip of Categories with real product images */
          <div className="mb-6 bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Quick Browse Categories by Product Photo:</span>
              </span>
              <span className="text-[11px] text-slate-400">Click to filter</span>
            </div>
            <div className="flex items-center space-x-3 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
              {categories.map((cat) => {
                const img = getCategoryFallbackImage(cat.name, cat.sampleImage);
                return (
                  <button
                    key={cat.name}
                    onClick={() => handleFilterChange({ category: cat.name, page: 1 })}
                    className="shrink-0 flex items-center space-x-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 px-2.5 py-1.5 rounded-xl transition-all group text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={img}
                        alt={cat.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors whitespace-nowrap">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {cat.count} parts
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Filters Sidebar */}
          <FilterSidebar
            categories={categories}
            filterState={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            totalResults={totalProducts}
          />

          {/* Right Product Grid */}
          <div className="flex-1 w-full">
            {loadingProducts ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse"
                  >
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-36 bg-slate-100 rounded-lg"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    <div className="h-8 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty state */
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3 stroke-[1.2]" />
                <h3 className="text-base font-bold text-slate-800">No components match your query</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search terms, clearing brand filters, or switching to &ldquo;All Categories&rdquo;.
                </p>
                <div className="mt-5 space-x-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                  >
                    Request Custom Part (RFQ)
                  </button>
                </div>
              </div>
            ) : (
              /* Products Display */
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'flex flex-col space-y-3'
                }
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.sku}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onQuickView={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  Page <span className="font-bold text-slate-900">{filters.page}</span> of{' '}
                  <span className="font-bold text-slate-900">{totalPages}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      handleFilterChange({ page: Math.max(1, filters.page - 1) });
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    disabled={filters.page <= 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 flex items-center space-x-1 font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page numbers */}
                  <div className="hidden sm:flex items-center space-x-1 font-medium">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            handleFilterChange({ page: p });
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          className={`w-7 h-7 rounded-md text-xs font-semibold ${
                            filters.page === p
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}
                  </div>

                  <button
                    onClick={() => {
                      handleFilterChange({ page: Math.min(totalPages, filters.page + 1) });
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    disabled={filters.page >= totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 flex items-center space-x-1 font-medium"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      )}

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href="https://wa.me/919428447698?text=Hello%20Innoelectronics,%20I%20have%20an%20inquiry%20regarding%20components%20in%20your%20catalog"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-xl flex items-center space-x-2 transition-transform hover:scale-105"
        title="Direct WhatsApp Support"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline text-xs font-bold pr-1">WhatsApp (+91 94284 47698)</span>
      </a>

      {/* Footer */}
      <Footer
        categories={categories}
        onSelectCategory={handleSelectCategory}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onGoHome={handleGoHome}
        onNavigateToCatalog={() => handleNavigateToCatalog()}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderCompleted={() => {
          setCart([]);
        }}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenContact={() => {
          setIsAboutOpen(false);
          setIsContactOpen(true);
        }}
      />

      {/* Contact & RFQ Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}

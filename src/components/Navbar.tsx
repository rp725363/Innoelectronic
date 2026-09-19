import React, { useState } from 'react';
import { 
  Cpu, 
  Search, 
  ShoppingCart, 
  Phone, 
  Mail, 
  MessageSquare, 
  Menu, 
  X, 
  FileText,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { CategorySummary } from '../types';
import { Logo } from './Logo';
import { getCategoryFallbackImage } from '../data/categoryImages';

interface NavbarProps {
  categories: CategorySummary[];
  cartCount: number;
  onOpenCart: () => void;
  onSelectCategory: (cat: string) => void;
  activeCategory: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onHomeClick: () => void;
  currentView: 'home' | 'catalog';
  onNavigateToCatalog: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  cartCount,
  onOpenCart,
  onSelectCategory,
  activeCategory,
  searchQuery,
  onSearchChange,
  onOpenAbout,
  onOpenContact,
  onHomeClick,
  currentView,
  onNavigateToCatalog,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top utility bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Live Google Sheet Inventory
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              India&apos;s Trusted Components &amp; Connectors Supplier
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://wa.me/919428447698?text=Hello%20Innoelectronics,%20I%20have%20an%20inquiry%20regarding%20components"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center hover:text-emerald-400 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              WhatsApp: +91 94284 47698
            </a>
            <a
              href="mailto:sales.innoelectronics@gmail.com"
              className="hidden md:inline-flex items-center hover:text-cyan-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 mr-1 text-cyan-400" />
              sales.innoelectronics@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo Highlighting Innoelectronics */}
          <button
            onClick={onHomeClick}
            className="flex items-center text-left group focus:outline-hidden"
            id="brand-logo-btn"
            title="Innoelectronics - Back to Home"
          >
            <Logo size="md" variant="light" showSubtitle={true} allowCustomUpload={false} />
          </button>

          {/* Search bar in center */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search 3,400+ parts: Molex, JST, 250001, 16-Pin, MCU..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-900 placeholder:text-slate-400"
                id="header-search-input"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Quick Links */}
            <div className="hidden lg:flex items-center space-x-1 text-sm font-medium text-slate-700">
              <button
                onClick={onHomeClick}
                className={`px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors ${
                  currentView === 'home' ? 'text-cyan-700 font-bold bg-cyan-50/60' : 'text-slate-700'
                }`}
              >
                Home
              </button>
              <button
                onClick={onNavigateToCatalog}
                className={`px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors ${
                  currentView === 'catalog' ? 'text-cyan-700 font-bold bg-cyan-50/60' : 'text-slate-700'
                }`}
              >
                Catalog &amp; Products
              </button>
              <button
                onClick={onOpenAbout}
                className="px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
              >
                About Us
              </button>
              <button
                onClick={onOpenContact}
                className="px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-700"
              >
                Contact &amp; RFQ
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center space-x-2"
              id="cart-toggle-btn"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-cyan-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-3 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search SKU, Molex, JST, pins..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              id="header-mobile-search-input"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Horizontal Category quick bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 py-2 text-xs font-medium whitespace-nowrap">
          <button
            onClick={() => onSelectCategory('')}
            className={`px-3 py-1 rounded-full transition-colors ${
              activeCategory === ''
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {categories.slice(0, 10).map((cat) => {
            const catThumb = getCategoryFallbackImage(cat.name, cat.sampleImage);
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`px-2.5 py-1 rounded-full transition-colors flex items-center space-x-1.5 ${
                  activeCategory === cat.name
                    ? 'bg-cyan-700 text-white font-semibold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={catThumb} alt="" className="w-full h-full object-contain" />
                </span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75">({cat.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => {
                onHomeClick();
                setMobileMenuOpen(false);
              }}
              className={`p-2 text-left rounded-md font-medium ${
                currentView === 'home' ? 'bg-cyan-50 text-cyan-800 font-bold' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigateToCatalog();
                setMobileMenuOpen(false);
              }}
              className={`p-2 text-left rounded-md font-medium ${
                currentView === 'catalog' ? 'bg-cyan-50 text-cyan-800 font-bold' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              Catalog &amp; Products
            </button>
            <button
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="p-2 text-left rounded-md bg-slate-50 hover:bg-slate-100 font-medium text-slate-800"
            >
              About Innoelectronics
            </button>
            <button
              onClick={() => {
                onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="p-2 text-left rounded-md bg-slate-50 hover:bg-slate-100 font-medium text-slate-800"
            >
              Contact &amp; RFQ
            </button>
            <a
              href="https://wa.me/919428447698"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-left rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium flex items-center justify-between col-span-2"
            >
              <span>WhatsApp Chat (+91 94284 47698)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { Filter, RotateCcw, Check, Sparkles } from 'lucide-react';
import { CategorySummary, FilterState } from '../types';
import { POPULAR_BRANDS } from '../data/categories';
import { getCategoryFallbackImage } from '../data/categoryImages';

interface FilterSidebarProps {
  categories: CategorySummary[];
  filterState: FilterState;
  onChange: (newState: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  filterState,
  onChange,
  onReset,
  totalResults,
}) => {
  return (
    <aside className="w-full lg:w-64 bg-white rounded-xl border border-slate-200 p-4 divide-y divide-slate-100 text-xs text-slate-700">
      {/* Top Header */}
      <div className="pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-cyan-600" />
          <span>Filters</span>
          <span className="text-[11px] font-normal text-slate-500">({totalResults} parts)</span>
        </div>
        <button
          onClick={onReset}
          className="text-cyan-700 hover:text-cyan-800 flex items-center space-x-1 font-semibold"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Stock Availability Toggle */}
      <div className="py-3">
        <label className="flex items-center space-x-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterState.inStockOnly}
            onChange={(e) => onChange({ inStockOnly: e.target.checked, page: 1 })}
            className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
          />
          <span className="font-semibold text-slate-800">In Stock Items Only</span>
        </label>
      </div>

      {/* Category Filter */}
      <div className="py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider block">
            Category
          </span>
          {filterState.category && (
            <button
              onClick={() => onChange({ category: '', page: 1 })}
              className="text-[10px] text-cyan-600 hover:text-cyan-800 underline"
            >
              Clear
            </button>
          )}
        </div>
        <select
          value={filterState.category}
          onChange={(e) => onChange({ category: e.target.value, page: 1 })}
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">All Categories ({categories.reduce((a, c) => a + c.count, 0)})</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>

        {/* Quick Visual Category List with Product Images */}
        <div className="max-h-48 overflow-y-auto space-y-1 pt-1 pr-1 scrollbar-thin">
          {categories.slice(0, 8).map((c) => {
            const isSelected = filterState.category === c.name;
            const catImage = getCategoryFallbackImage(c.name, c.sampleImage);
            return (
              <button
                key={c.name}
                onClick={() => onChange({ category: isSelected ? '' : c.name, page: 1 })}
                className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-colors ${
                  isSelected 
                    ? 'bg-cyan-50 text-cyan-800 font-bold border border-cyan-300' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden p-0.5">
                    <img src={catImage} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="truncate text-xs">{c.name}</span>
                </div>
                <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded shrink-0 ml-1">
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="py-3 space-y-2">
        <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider block">
          Popular Brands &amp; Types
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onChange({ brand: '', page: 1 })}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              !filterState.brand
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {POPULAR_BRANDS.map((b) => {
            const isSelected = filterState.brand.toLowerCase() === b.toLowerCase();
            return (
              <button
                key={b}
                onClick={() => onChange({ brand: isSelected ? '' : b, page: 1 })}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pin Count Filter */}
      <div className="py-3 space-y-2">
        <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider block">
          Pin Configuration
        </span>
        <div className="grid grid-cols-4 gap-1.5 text-center font-medium">
          {[
            { label: 'All', val: '' },
            { label: '2-Pin', val: '2' },
            { label: '3-Pin', val: '3' },
            { label: '4+ Pin', val: '4+' },
          ].map((pin) => {
            const active = filterState.pins === pin.val;
            return (
              <button
                key={pin.label}
                onClick={() => onChange({ pins: pin.val, page: 1 })}
                className={`py-1 rounded text-[11px] transition-colors ${
                  active
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pin.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort selection */}
      <div className="py-3 space-y-2">
        <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider block">
          Sort Results By
        </span>
        <select
          value={filterState.sort}
          onChange={(e) => onChange({ sort: e.target.value, page: 1 })}
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Default Relevance</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
          <option value="newest">Recently Added</option>
        </select>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { 
  FileText, 
  ShoppingCart, 
  Check, 
  ExternalLink, 
  Eye, 
  MessageSquare,
  Cpu,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { getCategoryFallbackImage } from '../data/categoryImages';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const rawImage = product.image && product.image !== 'x' && product.image.trim().startsWith('http') 
    ? product.image.trim() 
    : '';
  const fallbackImage = getCategoryFallbackImage(product.category);
  const displayImage = (!imageError && rawImage) ? rawImage : fallbackImage;
  const hasDatasheet = product.datasheet && product.datasheet !== 'x' && product.datasheet.startsWith('http');

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = `Hello Innoelectronics, I would like to inquire about ${product.name} (SKU: ${product.sku}, Partcode: ${product.partcode}).`;
    window.open(`https://wa.me/919428447698?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div 
      className="group bg-white rounded-xl border border-slate-200 hover:border-cyan-500/80 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden text-left relative"
      id={`product-card-${product.sku}`}
    >
      {/* Top Bar with SKU & Stock status */}
      <div className="p-3 pb-2 flex items-center justify-between gap-2 text-xs border-b border-slate-100 bg-slate-50/50">
        <span className="font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
          SKU: {product.sku}
        </span>
        {product.inStock ? (
          <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[11px] border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            In Stock
          </span>
        ) : (
          <span className="inline-flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium text-[11px] border border-slate-200">
            Out of Stock
          </span>
        )}
      </div>

      {/* Image preview area */}
      <div 
        className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center p-3"
        onClick={() => onQuickView(product)}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              if (displayImage !== fallbackImage) {
                setImageError(true);
              }
            }}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
            <Cpu className="w-12 h-12 text-slate-300 stroke-[1.2]" />
            <span className="text-[11px] font-medium text-slate-400">{product.category}</span>
          </div>
        )}

        {/* Quick View overlay on hover */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs flex items-center space-x-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Product Content info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="text-cyan-700 font-medium truncate max-w-[150px]">
              {product.category}
            </span>
            {product.partcode && product.partcode !== 'x' && (
              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {product.partcode}
              </span>
            )}
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-cyan-700 cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              {product.parsedPrice !== null ? (
                <div className="flex items-baseline space-x-1">
                  <span className="text-xs font-medium text-slate-500">₹</span>
                  <span className="text-lg font-bold text-slate-900 tracking-tight">
                    {product.parsedPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  Quote on Request (RFQ)
                </span>
              )}
            </div>

            {hasDatasheet && (
              <a
                href={product.datasheet}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-0.5 rounded hover:bg-rose-50 transition-colors"
                title="View Technical Datasheet PDF"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-rose-500" />
                Datasheet
              </a>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAdd}
              disabled={addedAnimation}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
              id={`add-btn-${product.sku}`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleWhatsApp}
              className="py-2 px-2.5 rounded-lg text-xs font-semibold border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center justify-center"
              title="Inquire directly on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Inquire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

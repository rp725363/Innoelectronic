import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  FileText, 
  MessageSquare, 
  Check, 
  ShieldCheck, 
  Truck, 
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { getCategoryFallbackImage } from '../data/categoryImages';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onSelectProduct,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const hasDatasheet = product.datasheet && product.datasheet !== 'x' && product.datasheet.startsWith('http');
  const rawImage = product.image && product.image !== 'x' && product.image.trim().startsWith('http')
    ? product.image.trim()
    : '';
  const fallbackImage = getCategoryFallbackImage(product.category);
  const displayImage = (!imgError && rawImage) ? rawImage : fallbackImage;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWhatsApp = () => {
    const msg = `Hello Innoelectronics, I am interested in ordering:
Product: ${product.name}
SKU: ${product.sku}
Part Code: ${product.partcode}
Quantity: ${quantity}
Please share current pricing and availability.`;
    window.open(`https://wa.me/919428447698?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image preview */}
          <div className="bg-slate-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 relative min-h-[320px]">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={() => {
                  if (displayImage !== fallbackImage) {
                    setImgError(true);
                  }
                }}
                className="max-h-72 max-w-full object-contain drop-shadow-xs"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-400 space-y-2">
                <Cpu className="w-20 h-20 text-slate-300 stroke-[1]" />
                <span className="text-xs text-slate-500 font-medium">{product.category}</span>
              </div>
            )}

            <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              <span>100% Genuine Quality Guaranteed</span>
            </div>
          </div>

          {/* Right Column: Details & Order options */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & SKU Pill */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  {product.category}
                </span>
                <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  SKU: {product.sku}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Stock Status Badge */}
              <div className="mt-3 flex items-center space-x-3">
                {product.inStock ? (
                  <span className="inline-flex items-center text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5 animate-pulse"></span>
                    Available in Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium">
                    Out of Stock (Inquire for lead time)
                  </span>
                )}

                {product.partcode && product.partcode !== 'x' && (
                  <span className="text-xs text-slate-500 font-mono">
                    Part Code: <strong className="text-slate-700">{product.partcode}</strong>
                  </span>
                )}
              </div>

              {/* Pricing section */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wide block">Pricing</span>
                    {product.parsedPrice !== null ? (
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-sm font-semibold text-slate-600">₹</span>
                        <span className="text-2xl font-extrabold text-slate-900">
                          {product.parsedPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500">/ piece</span>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-cyan-800 mt-0.5">
                        Request Quote for Volume Pricing (RFQ)
                      </div>
                    )}
                  </div>

                  {hasDatasheet && (
                    <a
                      href={product.datasheet}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-1.5 text-rose-500" />
                      Datasheet PDF
                      <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Description &amp; Mount
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Key Specs Table */}
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Brand / Family</span>
                  <span className="font-medium text-slate-800">{product.name.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Catalog Category</span>
                  <span className="font-medium text-slate-800">{product.category}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-medium text-slate-800">Ready to dispatch from India</span>
                </div>
              </div>
            </div>

            {/* Actions & Quantity Selector */}
            <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-sm font-semibold text-slate-800 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                  }`}
                  id="modal-add-to-cart-btn"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Added {quantity} to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Direct WhatsApp Quote Button */}
              <button
                onClick={handleWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Inquire &amp; Order on WhatsApp (+91 94284 47698)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

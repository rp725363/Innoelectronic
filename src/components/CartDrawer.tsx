import React from 'react';
import { 
  X, 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  ShoppingBag,
  Cpu,
  MessageSquare
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (sku: string, delta: number) => void;
  onRemoveItem: (sku: string) => void;
  onClearCart: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate priced subtotal
  const totalPrice = items.reduce((sum, item) => {
    const p = item.product.parsedPrice;
    return p !== null ? sum + p * item.quantity : sum;
  }, 0);

  const hasUnpricedItems = items.some((item) => item.product.parsedPrice === null);

  const handleWhatsAppCart = () => {
    let msg = `*Innoelectronics Cart Inquiry:*\n\n`;
    items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.product.name} (SKU: ${item.product.sku}) - Qty: ${item.quantity}\n`;
    });
    if (totalPrice > 0) {
      msg += `\nPriced Total: ₹${totalPrice.toLocaleString('en-IN')}`;
    }
    msg += `\nPlease provide shipping details and invoice.`;
    window.open(`https://wa.me/919428447698?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-cyan-600" />
            <h2 className="font-bold text-slate-900 text-lg">Your Cart</h2>
            <span className="bg-cyan-100 text-cyan-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-16 h-16 stroke-[1.2] text-slate-300 mb-3" />
              <p className="font-medium text-slate-700 text-base">Your cart is empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Explore our catalog of 3,400+ electronic components and connectors.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            items.map((item) => {
              const p = item.product;
              return (
                <div key={p.sku} className="py-3.5 flex items-center space-x-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {p.image && p.image !== 'x' ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Cpu className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                      {p.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                      <span>SKU: {p.sku}</span>
                      {p.partcode && p.partcode !== 'x' && (
                        <span>&bull; {p.partcode}</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      {p.parsedPrice !== null ? (
                        <span className="text-xs font-bold text-slate-900">
                          ₹{(p.parsedPrice * item.quantity).toLocaleString('en-IN')}
                          {item.quantity > 1 && (
                            <span className="text-[10px] font-normal text-slate-500 ml-1">
                              (₹{p.parsedPrice} ea)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[11px] text-cyan-700 font-medium bg-cyan-50 px-1.5 py-0.5 rounded">
                          RFQ (Quote)
                        </span>
                      )}

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded bg-slate-50">
                        <button
                          onClick={() => onUpdateQuantity(p.sku, -1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-800 min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(p.sku, 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(p.sku)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Items</span>
                <span className="font-semibold text-slate-800">{totalItems} pcs</span>
              </div>
              {totalPrice > 0 && (
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-slate-800 font-semibold text-sm">Estimated Subtotal</span>
                  <span className="text-lg font-bold text-slate-900">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {hasUnpricedItems && (
                <p className="text-[11px] text-cyan-700 font-medium">
                  * Cart contains RFQ / customized items requiring official quote verification.
                </p>
              )}
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={onProceedCheckout}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center transition-colors shadow-xs"
                id="cart-proceed-checkout-btn"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>

              <button
                onClick={handleWhatsAppCart}
                className="w-full py-2 px-4 rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold text-xs flex items-center justify-center transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Quick Quote on WhatsApp (+91 94284 47698)
              </button>

              <div className="flex justify-between items-center text-xs pt-1 px-1">
                <button
                  onClick={onClearCart}
                  className="text-slate-500 hover:text-rose-600 underline"
                >
                  Clear Cart
                </button>
                <button
                  onClick={onClose}
                  className="text-cyan-700 font-medium hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

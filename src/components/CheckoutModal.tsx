import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  MessageSquare, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileCheck
} from 'lucide-react';
import { CartItem, CheckoutFormData, OrderConfirmation } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
}) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Gujarat',
    pincode: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const p = item.product.parsedPrice;
    return p !== null ? sum + p * item.quantity : sum;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Please fill in your name, email, and phone number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        notes: formData.notes,
        items: items.map((item) => ({
          sku: item.product.sku,
          name: item.product.name,
          category: item.product.category,
          partcode: item.product.partcode,
          quantity: item.quantity,
          price: item.product.parsedPrice ? `₹${item.product.parsedPrice}` : 'RFQ',
        })),
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setConfirmation({
          orderId: data.orderId,
          timestamp: data.timestamp,
          whatsappUrl: data.whatsappUrl,
          customerName: formData.name,
          items: [...items],
          totalPriceText: totalPrice > 0 ? `₹${totalPrice.toLocaleString('en-IN')}` : 'Quote on Request',
        });
        onOrderCompleted();
      } else {
        setErrorMsg(data.error || 'Failed to place order. Please contact via WhatsApp.');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback local order ID if offline
      const localId = `INNO-${Date.now().toString().slice(-6)}`;
      let waMsg = `*New Order Inquiry: ${localId}*\n\nCustomer: ${formData.name}\nPhone: ${formData.phone}\nAddress: ${formData.address}\n\nItems:\n`;
      items.forEach((it, idx) => {
        waMsg += `${idx + 1}. ${it.product.name} (SKU: ${it.product.sku}) x ${it.quantity}\n`;
      });
      const waUrl = `https://wa.me/919428447698?text=${encodeURIComponent(waMsg)}`;

      setConfirmation({
        orderId: localId,
        timestamp: new Date().toISOString(),
        whatsappUrl: waUrl,
        customerName: formData.name,
        items: [...items],
        totalPriceText: totalPrice > 0 ? `₹${totalPrice.toLocaleString('en-IN')}` : 'Quote on Request',
      });
      onOrderCompleted();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-cyan-600" />
            <h2 className="font-bold text-slate-900 text-lg">
              {confirmation ? 'Order Received' : 'Checkout & Order Inquiry'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {confirmation ? (
          /* Confirmation View */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono font-semibold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
                Order Ref: {confirmation.orderId}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                Thank you, {confirmation.customerName}!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Your order inquiry has been registered. Our dispatch and sales department will review stock availability and dispatch your invoice.
              </p>
            </div>

            {/* Itemized box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left max-h-48 overflow-y-auto divide-y divide-slate-200/60 text-xs">
              {confirmation.items.map((it) => (
                <div key={it.product.sku} className="py-2 flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">{it.product.name}</span>
                    <div className="text-[11px] text-slate-500 font-mono">
                      SKU: {it.product.sku} | Qty: {it.quantity}
                    </div>
                  </div>
                  <span className="font-bold text-slate-700">
                    {it.product.parsedPrice ? `₹${(it.product.parsedPrice * it.quantity).toLocaleString('en-IN')}` : 'RFQ'}
                  </span>
                </div>
              ))}
              <div className="pt-2 flex justify-between font-bold text-slate-900 text-sm">
                <span>Estimated Total</span>
                <span>{confirmation.totalPriceText}</span>
              </div>
            </div>

            {/* Big WhatsApp Dispatch confirmation button */}
            <div className="space-y-3 pt-2">
              <a
                href={confirmation.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Confirm &amp; Track on WhatsApp (+91 94284 47698)</span>
              </a>

              <p className="text-[11px] text-slate-500">
                A sales representative will confirm payment terms (UPI/NEFT/Cash on Delivery) and shipping details.
              </p>

              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
              >
                Done / Back to Catalog
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Cart summary preview */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Items in Order</span>
                <span className="font-bold text-slate-900">{totalItems} components selected</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Subtotal</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {totalPrice > 0 ? `₹${totalPrice.toLocaleString('en-IN')}` : 'Quote on Request'}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery / Shipping Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Plot/Flat no, Industrial Area / Street, Landmark"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Ahmedabad / Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="380001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GST Number / Order Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="24AAAAA0000A1Z5 or specific packing instructions"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Back to Cart
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Submit Order &amp; Generate WhatsApp Quotation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

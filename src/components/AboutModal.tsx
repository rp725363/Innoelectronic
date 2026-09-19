import React from 'react';
import { X, ShieldCheck, Truck, FileCheck, Users, Mail, Phone, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <Logo size="md" variant="light" showSubtitle={true} allowCustomUpload={false} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-600 text-sm leading-relaxed">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              Empowering Makers, R&amp;D Labs, &amp; Electronics Manufacturers
            </h3>
            <p>
              Innoelectronics is an authorized distributor and stockist specializing in high-reliability 
              connectors, microcontrollers, terminal blocks, passives, and hardware assembly tools. 
              Our catalog spans over 3,400+ active parts with real-time stock synchronization and 
              direct manufacturer technical datasheets.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>100% Genuine Components</span>
              </div>
              <p className="text-xs text-slate-500">
                Direct sourcing ensuring high electrical compliance, RoHS adherence, and verified pin tolerances.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
                <FileCheck className="w-4 h-4 text-rose-600" />
                <span>Datasheets &amp; Pinouts</span>
              </div>
              <p className="text-xs text-slate-500">
                Direct access to manufacturer specification sheets, mechanical drawings, and electrical ratings.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Rapid Pan-India Dispatch</span>
              </div>
              <p className="text-xs text-slate-500">
                Orders packaged in antistatic ESD packaging and dispatched across India via express couriers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Custom RFQ &amp; BOM Kitting</span>
              </div>
              <p className="text-xs text-slate-500">
                Share your Bill of Materials (BOM) for competitive volume tier quotes and scheduled deliveries.
              </p>
            </div>
          </div>

          {/* Contact summary */}
          <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-cyan-950 text-xs uppercase tracking-wide">
                Direct Sales &amp; Technical Inquiries
              </h4>
              <p className="text-xs text-cyan-900 mt-0.5">
                Phone / WhatsApp: +91 94284 47698 &bull; Email: sales.innoelectronics@gmail.com
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenContact();
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0"
            >
              Contact Us &bull; RFQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

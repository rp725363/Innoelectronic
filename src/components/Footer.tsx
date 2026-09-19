import React from 'react';
import { Cpu, Mail, Phone, MessageSquare, ShieldCheck, FileText, ExternalLink, Heart } from 'lucide-react';
import { CategorySummary } from '../types';
import { Logo } from './Logo';

interface FooterProps {
  categories: CategorySummary[];
  onSelectCategory: (cat: string) => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onGoHome?: () => void;
  onNavigateToCatalog?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  onSelectCategory,
  onOpenAbout,
  onOpenContact,
  onGoHome,
  onNavigateToCatalog,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      {/* Top feature banner */}
      <div className="border-b border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine Components</h4>
              <p className="text-slate-400 mt-1 text-xs">
                Sourced directly from verified OEM and authorized connector manufacturers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-emerald-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Technical Datasheets</h4>
              <p className="text-slate-400 mt-1 text-xs">
                Direct PDF specifications, mechanical pinouts, and electrical limits for engineers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-amber-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant WhatsApp Orders</h4>
              <p className="text-slate-400 mt-1 text-xs">
                Direct order quotes, invoice requests, and fast lead-time inquiries on +91 94284 47698.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-purple-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Live Inventory Sheet</h4>
              <p className="text-slate-400 mt-1 text-xs">
                Real-time synchronization with 3,400+ SKUs across connectors, MCUs, and tools.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info & Logo */}
          <div className="space-y-3">
            <div className="cursor-pointer" onClick={onGoHome}>
              <Logo size="md" variant="dark" showSubtitle={true} allowCustomUpload={true} />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              <strong>Innoelectronics</strong> is India&apos;s premier online distributor of authentic connectors, microcontrollers, terminal blocks, passive components, and testing tools.
            </p>
            <div className="pt-2 text-xs space-y-1.5 text-slate-300">
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>+91 94284 47698</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>sales.innoelectronics@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Popular Categories
            </h4>
            <ul className="space-y-1.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.name}>
                  <button
                    onClick={() => onSelectCategory(cat.name)}
                    className="hover:text-cyan-400 transition-colors text-left"
                  >
                    {cat.name} ({cat.count})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More Categories */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Hardware &amp; Tools
            </h4>
            <ul className="space-y-1.5">
              {categories.slice(6, 12).map((cat) => (
                <li key={cat.name}>
                  <button
                    onClick={() => onSelectCategory(cat.name)}
                    className="hover:text-cyan-400 transition-colors text-left"
                  >
                    {cat.name} ({cat.count})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Support & Pages */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Customer Support
            </h4>
            <ul className="space-y-2">
              {onGoHome && (
                <li>
                  <button
                    onClick={onGoHome}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Home Page
                  </button>
                </li>
              )}
              {onNavigateToCatalog && (
                <li>
                  <button
                    onClick={onNavigateToCatalog}
                    className="hover:text-cyan-400 transition-colors font-semibold text-cyan-400"
                  >
                    Browse Catalog (3,400+ SKUs)
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-cyan-400 transition-colors"
                >
                  About Innoelectronics
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Contact Form &bull; RFQ
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/919428447698"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-emerald-400 hover:text-emerald-300"
                >
                  <span>WhatsApp Helpdesk</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li className="text-slate-400 pt-2">
                Order processing hours:<br />
                Mon - Sat: 9:30 AM - 7:00 PM IST
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>&copy; {new Date().getFullYear()} Innoelectronics. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Serving electronics engineers, makers, and industries across India</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

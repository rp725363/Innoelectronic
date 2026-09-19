export interface CategoryMeta {
  name: string;
  image: string;
  popularParts: string[];
  description: string;
  badge?: string;
}

export const CATEGORY_METADATA: Record<string, CategoryMeta> = {
  Connectors: {
    name: 'Connectors',
    image: 'https://res.cloudinary.com/dks3wmj5e/image/upload/v1744911281/Molex_KK_2.54mm_Connector_16-Pin_a49ilf.webp',
    popularParts: ['Molex KK 2.54mm', 'JST-XH / JST-PH', 'Anderson 175A', 'Dupont Jumpers', 'XLR Audio'],
    description: 'Wire-to-board, wire-to-wire, power and audio interconnects with verified pinouts.',
    badge: '1,431+ SKUs',
  },
  'Terminal Blocks': {
    name: 'Terminal Blocks',
    image: 'https://res.cloudinary.com/dks3wmj5e/image/upload/v1745262918/1_zq4net.jpg',
    popularParts: ['Screw Terminal 5.08mm', 'DIN Rail Modules', 'Pluggable PCB Blocks', 'Barrier Strips'],
    description: 'Industrial high-current wiring blocks, spring-clamp terminals, and PCB screw connectors.',
    badge: '456 SKUs',
  },
  Microcontrollers: {
    name: 'Microcontrollers',
    image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=600&auto=format&fit=crop&q=80',
    popularParts: ['8-Bit Microcontrollers', '32-Bit ARM MCU', 'Development Boards', 'Programmers'],
    description: 'Core embedded processing units, microprocessors, and evaluation hardware.',
    badge: '1,152 SKUs',
  },
  Diode: {
    name: 'Diode',
    image: 'https://res.cloudinary.com/dks3wmj5e/image/upload/v1745675621/1N4001_akblst.jpg',
    popularParts: ['1N4001 Rectifier', 'Schottky Diodes', 'Zener Regulators', 'Fast Recovery'],
    description: 'General purpose rectification, voltage regulation, and transient suppression diodes.',
    badge: '39 SKUs',
  },
  'Testing Tools': {
    name: 'Testing Tools',
    image: 'https://res.cloudinary.com/dks3wmj5e/image/upload/v1765724737/UNI-T_UT33D_Digital_Multimeter_wh4xlb.webp',
    popularParts: ['UNI-T Digital Multimeter', 'Metravi 250TR Analogue', 'LCR Capacitance Meter', 'Test Leads'],
    description: 'Precision multimeters, signal testers, and digital diagnostic measurement equipment.',
    badge: 'Verified Testing',
  },
  'Soldering Tools': {
    name: 'Soldering Tools',
    image: 'https://res.cloudinary.com/dks3wmj5e/image/upload/v1769226120/Soldering_Iron_60W_adezik.jpg',
    popularParts: ['Soldron 878D Hot Air Station', '60W Soldering Iron', 'Solder Wire 50g', 'Desoldering Pumps'],
    description: 'Temperature-controlled rework stations, soldering irons, tips, and flux accessories.',
    badge: 'Rework & Repair',
  },
  'ESD Equipment': {
    name: 'ESD Equipment',
    image: 'https://res.cloudinary.com/dks3wmj5e/image/upload/v1761156989/ESD_Wrist_Strap_cqsftq.webp',
    popularParts: ['ESD Anti-Static Wrist Strap', 'Conductive Table Mats', 'Anti-Static Gloves', 'Grounding Cords'],
    description: 'Certified electrostatic discharge protection gear for cleanrooms and assembly benches.',
    badge: 'ESD Safe',
  },
  'Cleaning Tools': {
    name: 'Cleaning Tools',
    image: 'https://res.cloudinary.com/dks3wmj5e/image/upload/v1777709737/Isopropyl_Alcohol_IPA_f3laoo.jpg',
    popularParts: ['Isopropyl Alcohol 99.9% IPA', 'Anti-Static PCB Brushes', 'Microfiber Lint-Free Cloth'],
    description: 'High-purity chemical solvents, flux removers, and precision electronics cleaning tools.',
    badge: 'Lab Grade',
  },
  Storage: {
    name: 'Storage',
    image: 'https://res.cloudinary.com/dks3wmj5e/image/upload/v1761157439/Ahamo_20-Gid_Transparent_Jewelry_Organizer_Box_do8meh.webp',
    popularParts: ['Transparent 20-Grid Box', 'Taparia PTB16 Tool Box', 'Magnetic Parts Tray 100mm'],
    description: 'Component sorting bins, hardware organizers, and rugged workshop storage kits.',
    badge: 'SMD & Hardware',
  },
  Resistor: {
    name: 'Resistor',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
    popularParts: ['Carbon Composition 1/4W', 'Metal Film 1% Tolerance', 'Power Wirewound', 'SMD 0805/1206'],
    description: 'Passive resistive components for circuit biasing, current limiting, and voltage dividing.',
    badge: '150 SKUs',
  },
  Capacitor: {
    name: 'Capacitor',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    popularParts: ['Ceramic Disc High-Voltage', 'Electrolytic Radial', 'Tantalum SMD', 'NP0/C0G Film'],
    description: 'Filtering, decoupling, and energy storage capacitors across all standard values.',
    badge: '41 SKUs',
  },
  IGBT: {
    name: 'IGBT',
    image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=600&auto=format&fit=crop&q=80',
    popularParts: ['1MBK50D-060S Soft-Switch', 'IRGP50B60PD1-EP TO-247', '6MBP15XSF 6-Pack DIL Module'],
    description: 'Insulated-gate bipolar transistors for high-power inverters, VFD drives, and SMPS circuits.',
    badge: 'Power Semis',
  },
  'Heat Sinks': {
    name: 'Heat Sinks',
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80',
    popularParts: ['Auvidea 70696-B', 'Advanced Thermal Solutions ATS', 'DFRobot FIT1029', 'TO-220 Aluminum'],
    description: 'Extruded aluminum and copper thermal dissipation sinks for semiconductors and ICs.',
    badge: 'Thermal Mgmt',
  },
  'Hand Tools': {
    name: 'Hand Tools',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    popularParts: ['Precision Screwdriver Set', 'ESD-Safe Tweezers', 'Automatic Wire Strippers', 'Crimping Pliers'],
    description: 'Ergonomic hand tools for electronics prototyping, wire termination, and PCB assembly.',
    badge: 'Workshop',
  },
  'Power Tools': {
    name: 'Power Tools',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
    popularParts: ['DC Power Supply 30V/5A', 'Digital USB Voltage Tester', 'Precision Mini Electric Drill'],
    description: 'Bench power supplies, rotary PCB drilling tools, and powered diagnostic equipment.',
    badge: 'Bench Power',
  },
  Mosfet: {
    name: 'Mosfet',
    image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=600&auto=format&fit=crop&q=80',
    popularParts: ['N-Channel Power Mosfet', 'P-Channel Switching', 'Logic-Level Gate FETs'],
    description: 'Fast-switching power MOSFETs for motor controllers, DC-DC buck converters, and relays.',
    badge: 'Active Semi',
  },
  Inductors: {
    name: 'Inductors',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    popularParts: ['Toroidal Chokes', 'Power Shielded SMD Inductors', 'Ferrite Beads'],
    description: 'Magnetic energy storage inductors, EMI noise suppression filters, and RF chokes.',
    badge: 'Passives',
  },
  transistors: {
    name: 'transistors',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
    popularParts: ['BC547 / BC557 BJT', '2N2222 General Purpose', 'TIP120 Darlington Pair'],
    description: 'Bipolar junction transistors (BJT), signal amplifiers, and switching devices.',
    badge: 'Discretes',
  },
};

export function getCategoryFallbackImage(categoryName: string, sampleImage?: string): string {
  if (sampleImage && sampleImage !== 'x' && sampleImage.trim().startsWith('http')) {
    return sampleImage.trim();
  }
  const meta = CATEGORY_METADATA[categoryName];
  if (meta && meta.image) {
    return meta.image;
  }
  return 'https://res.cloudinary.com/dks3wmj5e/image/upload/v1744911281/Molex_KK_2.54mm_Connector_16-Pin_a49ilf.webp';
}

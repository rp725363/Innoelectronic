export interface CategoryMeta {
  name: string;
  shortDesc: string;
  iconName: string;
  accentColor: string;
}

export const KNOWN_CATEGORIES: Record<string, CategoryMeta> = {
  'Connectors': {
    name: 'Connectors',
    shortDesc: 'Molex, JST, Dupont, Anderson, XLR, XT60/90, and wire-to-board connectors.',
    iconName: 'Cable',
    accentColor: 'blue',
  },
  'Terminal Blocks': {
    name: 'Terminal Blocks',
    shortDesc: 'DIN-rail, pluggable, PCB screw & spring terminal block modules.',
    iconName: 'Layers',
    accentColor: 'amber',
  },
  'Microcontrollers': {
    name: 'Microcontrollers',
    shortDesc: 'MCUs, development boards, sensors, and embedded interface kits.',
    iconName: 'Cpu',
    accentColor: 'indigo',
  },
  'Diode': {
    name: 'Diode',
    shortDesc: 'Schottky, Zener, Rectifier, and Fast Recovery semiconductor diodes.',
    iconName: 'Zap',
    accentColor: 'rose',
  },
  'Soldering Tools': {
    name: 'Soldering Tools',
    shortDesc: 'Soldering irons, stations, fluxes, desoldering pumps, and tips.',
    iconName: 'Flame',
    accentColor: 'orange',
  },
  'Testing Tools': {
    name: 'Testing Tools',
    shortDesc: 'Multimeters, logic analyzers, probes, and component testers.',
    iconName: 'Activity',
    accentColor: 'emerald',
  },
  'Hand Tools': {
    name: 'Hand Tools',
    shortDesc: 'Precision wire strippers, crimpers, pliers, and tweezers.',
    iconName: 'Wrench',
    accentColor: 'cyan',
  },
  'Power Tools': {
    name: 'Power Tools',
    shortDesc: 'PCB drills, electric screwdrivers, and cutting equipment.',
    iconName: 'Power',
    accentColor: 'purple',
  },
  'Cleaning Tools': {
    name: 'Cleaning Tools',
    shortDesc: 'IPA sprays, antistatic brushes, ultrasonic solutions, and wipes.',
    iconName: 'Sparkles',
    accentColor: 'teal',
  },
  'ESD Equipment': {
    name: 'ESD Equipment',
    shortDesc: 'Antistatic mats, wristbands, grounding plugs, and ESD shielding bags.',
    iconName: 'ShieldAlert',
    accentColor: 'sky',
  },
  'Storage': {
    name: 'Storage',
    shortDesc: 'Component organizer boxes, SMD sample books, and reel racks.',
    iconName: 'Box',
    accentColor: 'slate',
  },
  'Resistor': {
    name: 'Resistor',
    shortDesc: 'SMD & Through-hole fixed resistors, potentiometers, and arrays.',
    iconName: 'Binary',
    accentColor: 'violet',
  },
  'Capacitor': {
    name: 'Capacitor',
    shortDesc: 'Ceramic, electrolytic, tantalum, and film capacitor collections.',
    iconName: 'Disc',
    accentColor: 'emerald',
  },
  'IGBT': {
    name: 'IGBT',
    shortDesc: 'High-efficiency insulated gate bipolar transistors & inverter power packs.',
    iconName: 'Radio',
    accentColor: 'red',
  },
  'Heat Sinks': {
    name: 'Heat Sinks',
    shortDesc: 'Extruded aluminum heat sinks, thermal pads, and mounting hardware.',
    iconName: 'Sun',
    accentColor: 'yellow',
  },
  'Mosfet': {
    name: 'Mosfet',
    shortDesc: 'N-Channel and P-Channel power MOSFETs for switching and drives.',
    iconName: 'Cpu',
    accentColor: 'indigo',
  },
  'Inductors': {
    name: 'Inductors',
    shortDesc: 'Chokes, power inductors, and EMI suppression ferrite beads.',
    iconName: 'Orbit',
    accentColor: 'blue',
  },
  'transistors': {
    name: 'transistors',
    shortDesc: 'Bipolar junction transistors (BJT), signal amplifiers, and switching pairs.',
    iconName: 'Radio',
    accentColor: 'stone',
  },
};

export const POPULAR_BRANDS = [
  'Molex',
  'JST',
  'Dupont',
  'Anderson',
  'Tamiya',
  'CAMTREE',
  'Cablecc',
  'YACSEJAO',
  'IDC',
  'Phoenix',
  'Wago',
];

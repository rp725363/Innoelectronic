export interface Product {
  sku: string;
  name: string;
  category: string;
  description: string;
  price: string;
  parsedPrice: number | null;
  stock: number;
  inStock: boolean;
  image: string;
  partcode: string;
  datasheet: string;
  sheetIndex?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CategorySummary {
  name: string;
  count: number;
  sampleImage?: string;
}

export interface FilterState {
  search: string;
  category: string;
  brand: string;
  type: string;
  pins: string;
  sort: string;
  inStockOnly: boolean;
  page: number;
  limit: number;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

export interface OrderConfirmation {
  orderId: string;
  timestamp: string;
  whatsappUrl: string;
  customerName: string;
  items: CartItem[];
  totalPriceText: string;
}

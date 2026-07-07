export interface SaleLineItem {
  productId: string;
  quantity: number;
}

export interface SaleItem {
  product: string;
  name: string;
  sku: string;
  quantity: number;
  priceAtSale: number;
  lineTotal: number;
}

export interface Sale {
  _id: string;
  totalAmount: number;
  items: SaleItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

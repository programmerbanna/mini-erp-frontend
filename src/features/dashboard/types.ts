export interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  category: string;
  stockQuantity: number;
  image: string;
  purchasePrice: number;
  sellingPrice: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  lowStockProducts: LowStockProduct[];
  lowStockCount: number;
}

export interface LaundryUtilization {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  restaurantId: string;
  productName: string;
  outQuantity: null;
  inQuantity: null;
  outNoOfProducts: number;
  inNoOfProducts: null;
  vendorName: string;
  outDate: string;
  inDate: null;
  productPrice: number;
  status: string;
  isDamaged: boolean;
  productId: string;
  laundryPrice: string;
  vendorId: string;
}

export interface LaundryPrice {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  vendorName: string;
  productName: string;
  price: number;
  vendorUniqueId: string;
  productUniqueId: string;
}

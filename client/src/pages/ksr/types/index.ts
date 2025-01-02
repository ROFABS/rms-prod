import { Restaurant, Table, Tax } from "../config/types";

export interface KsrMainCategory {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  name: string;
  status: string;
  categoryItems: KsrCategoryItem[];
}

export interface KsrCategoryItem {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  restaurantId: string;
  dishMainCategoryName: string;
  productName: string;
  quantity: number;
  price: number;
  status: string;
  dishMainCategory: string;
  tax: Tax;
}

export interface KsrOrder {
  createdAt: number;
  updatedAt: number;
  id: number;
  orderId: string;
  billId?: string;
  uniqueId: string;
  restaurantId: string;
  subTotal: number;
  totalPrice: number;
  typeOfSale: string;
  deliveryPartner: string;
  discounts: boolean;
  discountAmount: number;
  discountType: string;
  table: Table;
  restaurant: Restaurant;
  user: string;
  role: string;
  taxAmount: number;
  products: KsrProduct[];
}

export interface KsrProduct {
  createdAt: number;
  updatedAt: number;
  id: number;
  uniqueId: string;
  productName: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
}

export interface KsrPayment {
  createdAt: number;
  updatedAt: number;
  id: number;
  paymentId: string;
  amount: number;
  paymentMethod: string;
  sessionId: string;
}

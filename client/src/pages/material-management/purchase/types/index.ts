export interface DamageItem {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  restaurantId: string;
  productId: string;
  productName: string;
  mainCategoryName: string;
  subCategoryName: string;
  damageQuantity: number;
  damageDescription: string;
  damageNoOfProducts: number;
  additionalInfo: string;
  damageFrom: string;
  receivedQuantity: number;
  receivedNoOfProducts: number;
  missingQuantity: number;
  missingNoOfProducts: number;
  refundStatus: boolean;
  purchasedDamageItemStatus: string;
  inHouseDamageItemStatus: string;
  laundryDamageItemStatus: string;
  vendorName: string;
  price: number;
  laundryId: string;
  mainCategoryId: string;
  subCategoryId: string;
  purchaseOrderId: string;
  vendorUniqueId: string;
}

export interface PurchaseItem {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  restaurantId: string;
  mainCategoryName: string;
  subCategoryName: string;
  productName: string;
  quantity: number;
  unit: string;
  noOfProducts: number;
  vendorName: string;
  incomingDate: string;
  expiryDate: string;
  price: number;
  status: string;
  isReceived: boolean;
  productId: string;
  mainCategoryId: string;
  subCategoryId: string;
  vendorId: string;
  damagedItems?: DamageItem[];
}

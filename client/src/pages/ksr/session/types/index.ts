import { Restaurant, Table } from "../../config/types";
import { KsrOrder } from "../../types";

export interface KsrSession {
  orders: KsrOrder[];
  createdAt: number;
  updatedAt: number;
  id: number;
  billId: string;
  totalPaid: number;
  billAmount: number;
  discount: number;
  discountType: string;
  discountAmount: number;
  typeOfSale: string;
  deliveryPartner: string;
  sessionId: string;
  restaurantId: string;
  restaurant: string | Restaurant;
  status: string;
  table: Table;
}

import { KsrCategoryItem } from "../../types";

export interface Restaurant {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  restaurantName: string;
  restaurantType: string;
  status: string;
  tables: Table[];
  startTime: string;
  endTime: string;
  groupId: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  countryCode: string;
  timezone: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  description: string;
  currency: string;
  coverImage: string;
}

export interface Table {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  tableNumber: number;
  seatCounts: number;
  status: "occupied" | "available" | "reserved";
  restaurantUniqueId: string;
}

export interface Tax {
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  restaurantId: string;
  name: string;
  CGST: number;
  SGST: number;
  CESS: number;
  SERVICE: number;
  status: string;
  products: KsrCategoryItem[];
}

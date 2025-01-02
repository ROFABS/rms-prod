import { MainCategory } from "../../categories/types";

export interface Vendor {
  vendorCategories: MainCategory[];
  createdAt: string;
  updatedAt: string;
  id: number;
  uniqueId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhoneNumber: string;
  vendorAddress: string;
  selfVending: string;
  vendorStatus: string;
}

import { KsrSession } from "../../session/types";

interface Sessions {
  activeSessionsCount: number;
  activeSessions: KsrSession[];
}

interface Sales {
  salesAmount: number;
  salesCount: number;
}

export interface IDayCloseStats {
  success: boolean;
  sales: Sales;
  sessions: Sessions;
}

export interface IDayClose {
  id: number;
  uniqueId: string;
  restaurant: number;
  date: string;
  totalSessions: number;
  totalBillAmount: number;
  totalDiscountAmount: number;
  totalPaidAmount: number;
  status: string;
  startTime: number;
  endTime: number;
  user: number;
  createdAt: number;
  updatedAt: number;
}
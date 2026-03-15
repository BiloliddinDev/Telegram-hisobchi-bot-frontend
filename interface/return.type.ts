export type ReturnType = "cash" | "debt";

export interface ReturnItem {
  saleId: string;
  quantity: number;
}

export interface ReturnPayload {
  orderId: string;
  returnType: ReturnType;
  items?: ReturnItem[];
}

export interface ReturnResponse {
  message: string;
  customerType: "noname" | "customer";
  returnType: ReturnType;
  cashBack: number;
  debtReduced: number;
}

import { Product } from "./products.type";

export interface SellerStock {
	_id: string;
	product: Product;
	quantity: number;
	lastTransferDate: string;
}

export interface StockResponse {
	stocks: SellerStock[];
	summary: {
		totalProducts: number;
		totalQuantity: number;
		totalStockValue: number;
	};
}

export interface SaleEntry {
	_id: string;
	productId: Product;
	quantity: number;
	price: number;
	totalAmount: number;
	customerName: string;
	customerPhone: string;
	notes: string;
	timestamp: string;
}

export interface CreateSalePayload {
	productId: string;
	quantity: number;
	price: number;
	customerName: string;
	customerPhone: string;
	notes?: string;
}
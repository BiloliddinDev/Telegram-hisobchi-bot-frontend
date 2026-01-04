import { Seller } from "./seller.type";
import { Product } from "./products.type";

export interface Transfer {
	_id: string;
	seller: Seller;
	product: Product;
	quantity: number;
	type: "transfer" | "return";
	status: "completed" | "cancelled";
	transferDate: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTransferData {
	sellerId: string;
	items: {
		productId: string;
		quantity: number;
	}[];
}

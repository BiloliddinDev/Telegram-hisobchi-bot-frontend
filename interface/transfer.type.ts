import { User } from "@/interface/User.type";
import { Product } from "./products.type";

export interface Transfer {
	_id: string;
	seller: User;
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

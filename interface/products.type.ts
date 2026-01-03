import { Category } from "./category.type";

export interface Product {
	_id: string;
	name: string;
	description: string;
	price: number;
	costPrice: number;
	category: Category;
	sku: string;
	color: string;
	count: number;
	image: string;
	assignedSellers: string[];
	sellerStocks: sellerStocksType[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface sellerStocksType {
	sellerId: string;
	quantity: number;
}

export interface ProductCreateInput {
	name: string;
	description?: string;
	price: number;
	costPrice: number;
	category: string; // Category ID as string
	sku?: string;
	color?: string;
	stock: number; // Maps to count in Product
	image?: string;
}

export interface ProductUpdateInput {
	name?: string;
	description?: string;
	price?: number;
	costPrice?: number;
	category?: string; // Category ID as string
	sku?: string;
	color?: string;
	count?: number;
	image?: string;
	assignedSellers?: string[];
	isActive?: boolean;
}

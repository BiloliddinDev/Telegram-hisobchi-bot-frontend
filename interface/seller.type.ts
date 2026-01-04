import { User } from "./User.type";

export interface Seller extends User {
	role: "seller";
}

export interface SellerAnalytics {
	_id: string;
	username: string;
	firstName: string;
	lastName: string;
	telegramId: string;
	totalValue: number;
	productCount: number;
}

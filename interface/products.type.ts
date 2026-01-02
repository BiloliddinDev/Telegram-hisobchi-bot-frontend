export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    costPrice: number;
    category: string;
    sku: string;
    color: string;
    stock: number;
    image: string;
    assignedSellers: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
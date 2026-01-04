"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { CreateProductDialog } from "./CreateProductDialog";
import { useProducts } from "@/hooks/useProducts";
import { ProductTable } from "./ProductTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function TabsProducts() {
	const { data: products = [], isLoading: productsLoading } = useProducts();

	return (
		<TabsContent value="products" className="mt-4">
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div>
							<CardTitle>Mahsulotlar</CardTitle>
							<CardDescription>Barcha mahsulotlarni boshqaring</CardDescription>
						</div>
						<div className="flex gap-2 w-full md:w-auto">
							<CreateCategoryDialog />
							<CreateProductDialog />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{productsLoading ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between border-b pb-4">
								<Skeleton className="h-8 w-[150px]" />
								<Skeleton className="h-8 w-[100px]" />
								<Skeleton className="h-8 w-[100px]" />
								<Skeleton className="h-8 w-[80px]" />
							</div>

							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className="flex items-center justify-between py-2 border-b last:border-0"
								>
									<Skeleton className="h-12 w-[180px]" />
									<Skeleton className="h-12 w-[120px]" />
									<Skeleton className="h-12 w-[120px]" />
									<Skeleton className="h-10 w-10 rounded-full" />
								</div>
							))}
						</div>
					) : (
						<ProductTable products={products} />
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

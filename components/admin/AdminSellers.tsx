"use client";

import { useSellers } from "@/hooks/useAdminData";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { CreateSellerDialog } from "./CreateSellerDialog";
import { SellerCard } from "@/components/SellerCard";
import { Seller } from "@/interface/seller.type";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSellers() {
	const { data: sellers = [], isLoading: sellersLoading } = useSellers();

	return (
		<TabsContent value="sellers" className="mt-4">
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Sotuvchilar</CardTitle>
							<CardDescription>Barcha sotuvchilarni boshqaring</CardDescription>
						</div>
						<CreateSellerDialog />
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 grid-cols-1 md:grid-cols-2">
						{sellersLoading
							? // 4 ta sotuvchi kartochkasi uchun skeletonlar
								[...Array(4)].map((_, i) => (
									<div
										key={i}
										className="flex flex-col space-y-3 p-4 border rounded-xl"
									>
										<div className="flex items-center space-x-4">
											{/* Avatar uchun aylana */}
											<Skeleton className="h-12 w-12 rounded-full" />
											<div className="space-y-2">
												{/* Ism va username uchun qatorlar */}
												<Skeleton className="h-4 w-[150px]" />
												<Skeleton className="h-4 w-[100px]" />
											</div>
										</div>
										<div className="space-y-2 pt-2">
											{/* Pastki qo'shimcha ma'lumotlar uchun */}
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-[80%]" />
										</div>
									</div>
								))
							: sellers.map((seller: Seller) => (
									<SellerCard key={seller._id} seller={seller} />
								))}
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

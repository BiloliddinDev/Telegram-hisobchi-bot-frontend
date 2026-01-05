"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { CreateProductDialog } from "./CreateProductDialog";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { ProductTable } from "./ProductTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search, Filter, LayoutGrid, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/interface/category.type";
import { Product } from "@/interface/products.type";

export default function TabsProducts() {
	const [search, setSearch] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [page, setPage] = useState<number>(1);
	const limit = 10;

	const { data: productData, isLoading: productsLoading } = useProducts({
		name: search,
		category: selectedCategory,
		page: page,
		limit: limit
	});

	const { data: categories = [], isLoading: categoriesLoading } = useCategories();

	const products: Product[] = productData?.docs || [];
	const totalPages: number = productData?.totalPages || 1;

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		setPage(1);
	};

	return (
		<TabsContent value="products" className="mt-0 border-none p-0 outline-none">
			<Tabs defaultValue="list" className="w-full">

				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 border rounded-sm shadow-sm">
					<TabsList className="grid grid-cols-2 w-full sm:w-[400px] h-10 bg-slate-100 p-1 rounded-sm">
						<TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm font-bold text-[11px] uppercase tracking-wider gap-2">
							<Package size={14} className="text-primary" /> Mahsulotlar
						</TabsTrigger>
						<TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm font-bold text-[11px] uppercase tracking-wider gap-2">
							<LayoutGrid size={14} className="text-primary" /> Kategoriyalar
						</TabsTrigger>
					</TabsList>

					<div className="flex items-center gap-2 w-full sm:w-auto">
						<CreateCategoryDialog />
						<CreateProductDialog />
					</div>
				</div>
				<TabsContent value="list" className="mt-0 outline-none">
					<Card className="rounded-sm border-gray-200 shadow-none overflow-hidden">
						<CardHeader className="bg-gray-50/50 border-b space-y-4">
							<div className="flex flex-col md:flex-row gap-3">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
									<Input
										placeholder="Mahsulot nomi bo'yicha qidirish..."
										value={search}
										onChange={handleSearchChange}
										className="pl-10 rounded-sm border-gray-200 h-10 bg-white shadow-none focus-visible:ring-primary"
									/>
								</div>
								<div className="flex gap-2">
									<Select
										value={selectedCategory}
										onValueChange={(val) => {
											setSelectedCategory(val);
											setPage(1);
										}}
									>
										<SelectTrigger className="w-[220px] rounded-sm border-gray-200 h-10 bg-white">
											<Filter className="w-3.5 h-3.5 mr-2 text-gray-400" />
											<SelectValue placeholder="Kategoriya: Barchasi" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Barcha kategoriyalar</SelectItem>
											{categories.map((cat: Category) => (
												<SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							{productsLoading ? (
								<TableSkeleton rows={limit} cols={6} />
							) : (
								<>
									<ProductTable products={products} />
									<div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/30">
										<div className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
											Sahifa {page} / {totalPages} — Jami {productData?.totalDocs || 0} mahsulot
										</div>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												className="h-8 rounded-sm text-[10px] font-bold uppercase"
												onClick={() => setPage(p => Math.max(1, p - 1))}
												disabled={page === 1}
											>
												<ChevronLeft size={14} className="mr-1" /> Oldingi
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="h-8 rounded-sm text-[10px] font-bold uppercase"
												onClick={() => setPage(p => Math.min(totalPages, p + 1))}
												disabled={page >= totalPages}
											>
												Keyingi <ChevronRight size={14} className="ml-1" />
											</Button>
										</div>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="categories" className="mt-0 outline-none">
					<Card className="rounded-sm border-gray-200 shadow-none">
						<CardHeader className="border-b bg-gray-50/50">
							<div className="flex justify-between items-center">
								<div>
									<CardTitle className="text-sm font-black uppercase tracking-widest text-gray-800">Kategoriyalar jadvallari</CardTitle>
									<CardDescription className="text-[10px] font-bold text-gray-400 uppercase mt-1">
										{`Tizimdagi barcha mahsulot turlarini boshqarish`}
									</CardDescription>
								</div>
								<Badge className="bg-white border text-primary font-bold">
									{categoriesLoading ? <Skeleton className="h-3 w-8" /> : `${categories.length} ta`}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							{categoriesLoading ? (
								<TableSkeleton rows={5} cols={3} />
							) : (
								<div className="w-full overflow-x-auto">
									<table className="w-full text-sm text-left border-collapse">
										<thead className="bg-gray-50/80 text-gray-500 font-bold text-[10px] uppercase border-b">
										<tr>
											<th className="px-6 py-4 w-24">Tartib</th>
											<th className="px-6 py-4">Kategoriya nomi</th>
											<th className="px-6 py-4 text-right">Amallar</th>
										</tr>
										</thead>
										<tbody className="divide-y divide-gray-100 bg-white text-gray-600">
										{categories.map((cat: Category, index: number) => (
											<tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
												<td className="px-6 py-4 text-xs font-bold text-gray-400">#{index + 1}</td>
												<td className="px-6 py-4 font-black text-gray-900 text-xs uppercase">{cat.name}</td>
												<td className="px-6 py-4 text-right">
													<button className="text-[10px] font-bold text-primary hover:underline uppercase">Tahrirlash</button>
												</td>
											</tr>
										))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</TabsContent>
	);
}


function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
	return (
		<div className="w-full p-4 space-y-4">
			<div className="flex gap-4 border-b pb-4">
				{[...Array(cols)].map((_, i) => (
					<Skeleton key={i} className="h-4 flex-1" />
				))}
			</div>
			{[...Array(rows)].map((_, i) => (
				<div key={i} className="flex gap-4 items-center border-b pb-4 last:border-0 pt-2">
					{[...Array(cols)].map((_, j) => (
						<Skeleton
							key={j}
							className={`h-8 flex-1 ${j === cols - 1 ? 'max-w-[100px] ml-auto' : ''}`}
						/>
					))}
				</div>
			))}
		</div>
	);
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${className}`}>
            {children}
        </span>
	);
}
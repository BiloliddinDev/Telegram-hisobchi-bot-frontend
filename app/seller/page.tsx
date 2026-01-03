"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import {
	useSellerProducts,
	useSellerSales,
	useSellerReports,
} from "@/hooks/useSellerData";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/interface/products.type";
import { Sale } from "@/interface/sale.type";
import { useCreateSale } from "@/hooks/useSales";
import {
	ShoppingCart,
	CheckCircle2,
	Search,
	Trash2,
	Minus,
	Plus,
} from "lucide-react";
import axios from "axios";
import { getTelegramData } from "@/lib/api";

interface CartItem {
	product: Product;
	quantity: number;
}

export default function SellerPage() {
	const router = useRouter();
	const { user } = useAuthStore();
	const { ToastComponent, showToast } = useToast();

	const {
		data: products = [],
		isLoading: productsLoading,
		refetch: refetchProducts,
		error: productsError,
	} = useSellerProducts();
	const {
		data: sales = [],
		isLoading: salesLoading,
		refetch: refetchSales,
		error: salesError,
	} = useSellerSales();
	const {
		data: reports,
		isLoading: reportsLoading,
		refetch: refetchReports,
		error: reportsError,
	} = useSellerReports();
	const { mutateAsync: createSale } = useCreateSale();

	const [activeTab, setActiveTab] = useState("products");
	const [searchTerm, setSearchTerm] = useState("");
	const [cart, setCart] = useState<Record<string, CartItem>>({});
	const [isProcessing, setIsProcessing] = useState(false);

	const filteredProducts = products.filter(
		(p) =>
			p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	useEffect(() => {
		if (user && user.role !== "seller") {
			router.push("/");
		}
	}, [user, router]);

	const handleAddToCart = (product: Product) => {
		if (product.stock <= 0) {
			showToast("Mahsulot qolmagan", "error");
			return;
		}

		setCart((prev) => {
			const currentQty = prev[product?._id]?.quantity || 0;
			if (currentQty >= product.stock) {
				showToast("Ombordagi miqdordan ko'p sotib bo'lmaydi", "error");
				return prev;
			}
			return {
				...prev,
				[product._id]: {
					product,
					quantity: currentQty + 1,
				},
			};
		});
	};

	const updateCartQuantity = (productId: string, delta: number) => {
		setCart((prev) => {
			const item = prev[productId];
			if (!item) return prev;

			const newQty = item.quantity + delta;
			if (newQty <= 0) {
				const nextCart = { ...prev };
				delete nextCart[productId];
				return nextCart;
			}

			if (newQty > item.product.stock) {
				showToast("Ombordagi miqdordan ko'p sotib bo'lmaydi", "error");
				return prev;
			}

			return {
				...prev,
				[productId]: { ...item, quantity: newQty },
			};
		});
	};

	const cartTotal = useMemo(
		() =>
			Object.values(cart).reduce(
				(sum, item) => sum + item.product.price * item.quantity,
				0,
			),
		[cart],
	);

	const cartItemsCount = useMemo(
		() => Object.values(cart).reduce((sum, item) => sum + item.quantity, 0),
		[cart],
	);

	const handleCheckout = useCallback(async () => {
		const items = Object.values(cart);
		if (items.length === 0) return;

		setIsProcessing(true);
		const tg = getTelegramData();
		tg?.MainButton.showProgress(false);

		try {
			for (const item of items) {
				await createSale({
					productId: item.product._id,
					quantity: item.quantity,
					price: item.product.price,
				});
			}

			showToast("Sotuv muvaffaqiyatli amalga oshirildi", "success");
			setCart({});
			refetchProducts();
			refetchSales();
			refetchReports();
		} catch (error: unknown) {
			let errorMessage = "Xatolik yuz berdi";
			if (axios.isAxiosError(error)) {
				errorMessage = error.response?.data?.error || error.message;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}
			showToast(errorMessage, "error");
		} finally {
			setIsProcessing(false);
			tg?.MainButton.hideProgress();
		}
	}, [
		cart,
		createSale,
		refetchProducts,
		refetchSales,
		refetchReports,
		showToast,
	]);

	// Telegram MainButton integration
	useEffect(() => {
		const tg = getTelegramData();
		if (!tg) return;

		if (cartItemsCount > 0 && activeTab === "products") {
			tg.MainButton.setParams({
				text: `Sotishni tasdiqlash (${cartTotal.toLocaleString()} so'm)`,
				color: "#10b981", // green-500
				is_visible: true,
				is_active: !isProcessing,
			});
			tg.MainButton.onClick(handleCheckout);
		} else {
			tg.MainButton.hide();
		}

		return () => {
			tg.MainButton.offClick(handleCheckout);
		};
	}, [cartItemsCount, cartTotal, activeTab, handleCheckout, isProcessing]);

	if (productsLoading || salesLoading || reportsLoading) {
		return (
			<div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	const isUnauthorized =
		(axios.isAxiosError(productsError) &&
			productsError.response?.status === 401) ||
		(axios.isAxiosError(salesError) && salesError.response?.status === 401) ||
		(axios.isAxiosError(reportsError) && reportsError.response?.status === 401);

	if (isUnauthorized) {
		return (
			<div className="min-h-screen bg-[#f4f4f4] text-zinc-900 flex flex-col items-center justify-center p-4 text-center">
				<h2 className="text-2xl font-bold text-red-500 mb-2">Ruxsat yo'q</h2>
				<p className="text-zinc-500 mb-6">
					Sizda ushbu sahifani ko'rish uchun ruxsat yo'q yoki sessiya muddati
					tugagan.
				</p>
				<Button onClick={() => router.push("/")} className="bg-primary">
					Bosh sahifaga qaytish
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f4f4f4] text-zinc-900 pb-20">
			<ToastComponent />

			<div className="p-4 flex justify-between items-center bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-sm">
				<div>
					<h1 className="text-xl font-bold text-zinc-900">Sotuvchi</h1>
					<p className="text-[10px] text-zinc-500 font-medium">
						{user?.firstName || user?.username} •{" "}
						{new Date().toLocaleDateString("uz-UZ")}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-auto"
					>
						<TabsList className="bg-zinc-100 border-zinc-200 h-9">
							<TabsTrigger
								value="products"
								className="text-xs px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
							>
								Do&apos;kon
							</TabsTrigger>
							<TabsTrigger
								value="sales"
								className="text-xs px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
							>
								Tarix
							</TabsTrigger>
							<TabsTrigger
								value="reports"
								className="text-xs px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
							>
								Stat
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			<div className="max-w-7xl mx-auto p-4">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsContent value="products" className="mt-0 outline-none">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Mahsulotlar ro'yxati */}
							<div className="lg:col-span-2 space-y-4">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
									<Input
										placeholder="Mahsulot qidirish..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-11 pl-10 rounded-xl shadow-sm focus:ring-primary"
									/>
								</div>

								<div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
									{filteredProducts.length === 0 ? (
										<div className="bg-white rounded-xl border border-zinc-200 p-10 col-span-full text-center">
											<p className="text-zinc-500">Mahsulot topilmadi</p>
										</div>
									) : (
										filteredProducts.map((product: Product) => (
											<ProductCard
												key={product._id}
												product={product}
												onSelect={handleAddToCart}
												selectedCount={cart[product._id]?.quantity}
											/>
										))
									)}
								</div>
							</div>

							{/* Savat (Cart) */}
							<div className="lg:col-span-1">
								<Card className="bg-white border-zinc-200 shadow-sm rounded-xl sticky top-24">
									<CardHeader className="p-4 border-b border-zinc-100">
										<div className="flex items-center justify-between">
											<CardTitle className="text-lg flex items-center gap-2">
												<ShoppingCart className="w-5 h-5 text-primary" />
												Savat
											</CardTitle>
											{cartItemsCount > 0 && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setCart({})}
													className="text-zinc-400 hover:text-red-500 h-8"
												>
													<Trash2 className="w-4 h-4 mr-1" />
													Tozalash
												</Button>
											)}
										</div>
									</CardHeader>
									<CardContent className="p-0">
										{cartItemsCount === 0 ? (
											<div className="p-10 text-center space-y-2">
												<div className="bg-zinc-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-zinc-300">
													<ShoppingCart className="w-6 h-6" />
												</div>
												<p className="text-sm text-zinc-400">
													Savat bo&apos;sh
												</p>
											</div>
										) : (
											<>
												<div className="max-h-[50vh] overflow-y-auto divide-y divide-zinc-100">
													{Object.values(cart).map((item) => (
														<div
															key={item.product._id}
															className="p-4 flex items-center gap-3"
														>
															<div className="w-12 h-12 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0 relative">
																{item.product.image ? (
																	// eslint-disable-next-line @next/next/no-img-element
																	<img
																		src={item.product.image}
																		alt={item.product.name}
																		className="w-full h-full object-cover"
																	/>
																) : (
																	<div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
																		Rasm
																	</div>
																)}
															</div>
															<div className="flex-1 min-w-0">
																<h4 className="text-sm font-semibold text-zinc-900 truncate">
																	{item.product.name}
																</h4>
																<p className="text-xs text-primary font-bold">
																	{item.product.price.toLocaleString()}{" "}
																	so&apos;m
																</p>
															</div>
															<div className="flex items-center gap-2">
																<Button
																	variant="outline"
																	size="icon"
																	className="h-7 w-7 rounded-full border-zinc-200"
																	onClick={() =>
																		updateCartQuantity(item.product._id, -1)
																	}
																>
																	<Minus className="w-3 h-3" />
																</Button>
																<span className="text-sm font-bold w-4 text-center">
																	{item.quantity}
																</span>
																<Button
																	variant="outline"
																	size="icon"
																	className="h-7 w-7 rounded-full border-zinc-200"
																	onClick={() =>
																		updateCartQuantity(item.product._id, 1)
																	}
																>
																	<Plus className="w-3 h-3" />
																</Button>
															</div>
														</div>
													))}
												</div>
												<div className="p-4 bg-zinc-50 rounded-b-xl border-t border-zinc-100 space-y-4">
													<div className="flex justify-between items-end">
														<span className="text-zinc-500 text-sm">Jami:</span>
														<span className="text-xl font-black text-zinc-900">
															{cartTotal.toLocaleString()} so&apos;m
														</span>
													</div>

													{/* Desktopda sotish tugmasi (Telegram MainButton ham bor, lekin bu qulaylik uchun) */}
													<Button
														className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl hidden lg:flex"
														onClick={handleCheckout}
														disabled={isProcessing}
													>
														{isProcessing ? (
															<div className="flex items-center gap-2">
																<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
																Sotilmoqda...
															</div>
														) : (
															<div className="flex items-center gap-2 text-base">
																<CheckCircle2 className="w-5 h-5" />
																Sotishni tasdiqlash
															</div>
														)}
													</Button>
												</div>
											</>
										)}
									</CardContent>
								</Card>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="sales" className="mt-0 outline-none">
						<div className="space-y-3">
							{sales.length === 0 ? (
								<div className="bg-white rounded-xl border border-zinc-200 p-20 text-center">
									<p className="text-zinc-400">Hali sotuvlar yo&apos;q</p>
								</div>
							) : (
								sales.map((sale: Sale) => (
									<Card
										key={sale._id}
										className="bg-white border-zinc-200 text-zinc-900 overflow-hidden shadow-sm hover:border-primary/30 transition-colors"
									>
										<CardContent className="p-3">
											<div className="flex justify-between items-start">
												<div className="flex gap-3">
													<div className="w-10 h-10 bg-zinc-100 rounded flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-200 overflow-hidden">
														{sale.product?.image ? (
															// eslint-disable-next-line @next/next/no-img-element
															<img
																src={sale.product.image}
																alt={sale.product?.name}
																className="w-full h-full object-cover"
															/>
														) : (
															sale.product?.name?.charAt(0)
														)}
													</div>
													<div>
														<h3 className="font-semibold text-sm leading-tight text-zinc-900">
															{sale.product?.name}
														</h3>
														<p className="text-[10px] text-zinc-500 mt-1 font-medium">
															{sale.quantity} ta x{" "}
															{(sale.price || 0).toLocaleString()} so&apos;m
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-sm font-bold text-primary">
														{(sale.totalPrice || 0).toLocaleString()}
													</p>
													<span className="text-[9px] text-zinc-400 font-medium">
														{new Date(sale.createdAt).toLocaleTimeString(
															"uz-UZ",
															{ hour: "2-digit", minute: "2-digit" },
														)}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								))
							)}
						</div>
					</TabsContent>

					<TabsContent value="reports" className="mt-0 outline-none">
						{reports && (
							<div className="grid grid-cols-1 gap-4">
								<Card className="bg-white border-zinc-200 shadow-sm rounded-xl overflow-hidden">
									<div className="h-2 bg-primary"></div>
									<CardHeader className="p-5 pb-2">
										<CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
											Bugungi daromad
										</CardTitle>
									</CardHeader>
									<CardContent className="p-5 pt-0">
										<p className="text-3xl font-black text-zinc-900">
											{(reports?.summary?.totalRevenue || 0).toLocaleString()}{" "}
											<span className="text-sm font-normal text-zinc-400">
												so&apos;m
											</span>
										</p>
									</CardContent>
								</Card>
								<div className="grid grid-cols-2 gap-4">
									<Card className="bg-white border-zinc-200 shadow-sm rounded-xl">
										<CardHeader className="p-4 pb-1">
											<CardTitle className="text-[10px] font-bold text-zinc-400 uppercase">
												Sotuvlar
											</CardTitle>
										</CardHeader>
										<CardContent className="p-4 pt-0">
											<p className="text-xl font-black text-zinc-900">
												{reports.summary.totalSales}{" "}
												<span className="text-xs font-normal text-zinc-400">
													ta
												</span>
											</p>
										</CardContent>
									</Card>
									<Card className="bg-white border-zinc-200 shadow-sm rounded-xl">
										<CardHeader className="p-4 pb-1">
											<CardTitle className="text-[10px] font-bold text-zinc-400 uppercase">
												Mahsulotlar
											</CardTitle>
										</CardHeader>
										<CardContent className="p-4 pt-0">
											<p className="text-xl font-black text-zinc-900">
												{reports.summary.totalQuantity}{" "}
												<span className="text-xs font-normal text-zinc-400">
													ta
												</span>
											</p>
										</CardContent>
									</Card>
								</div>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

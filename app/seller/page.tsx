"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import {
	useSellerProducts,
	useSellerSales,
	useSellerReports,
} from "@/hooks/useSellerData";
import { Product } from "@/interface/products.type";
import { Sale } from "@/interface/sale.type";
import { useCreateSale } from "@/hooks/useSales";
import {
	ShoppingCart, CheckCircle2, Search, Trash2,
	Minus, Plus, Store, History, BarChart3,
	ShoppingBag, Package, Wallet
} from "lucide-react";
import axios from "axios";
import { getTelegramData } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface CartItem {
	product: Product;
	quantity: number;
}

export default function SellerPage() {
	const router = useRouter();
	const { user } = useAuthStore();
	const { showToast } = useToast();

	// Hooklar
	const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useSellerProducts();
	const { data: sales = [], isLoading: salesLoading, refetch: refetchSales } = useSellerSales();
	const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useSellerReports();
	const { mutateAsync: createSale } = useCreateSale();

	const [activeTab, setActiveTab] = useState("products");
	const [searchTerm, setSearchTerm] = useState("");
	const [cart, setCart] = useState<Record<string, CartItem>>({});
	const [isProcessing, setIsProcessing] = useState(false);

	// Filterlangan mahsulotlar
	const filteredProducts = useMemo(() =>
		products.filter((p) =>
			p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
		), [products, searchTerm]);

	// Role check
	useEffect(() => {
		if (user && user.role !== "seller") router.push("/");
	}, [user, router]);

	// Cart logics
	const handleAddToCart = (product: Product) => {
		if (product.count <= 0) {
			showToast("Mahsulot qolmagan", "error");
			return;
		}
		setCart((prev) => {
			const currentQty = prev[product._id]?.quantity || 0;
			if (currentQty >= product.count) {
				showToast("Zaxiradan ortiq sotib bo'lmaydi", "error");
				return prev;
			}
			return { ...prev, [product._id]: { product, quantity: currentQty + 1 } };
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
			if (newQty > item.product.count) return prev;
			return { ...prev, [productId]: { ...item, quantity: newQty } };
		});
	};

	const cartTotal = useMemo(() =>
		Object.values(cart).reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);

	const cartItemsCount = useMemo(() =>
		Object.values(cart).reduce((sum, item) => sum + item.quantity, 0), [cart]);

	// Checkout
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
			showToast("Savdo muvaffaqiyatli yakunlandi!", "success");
			setCart({});
			refetchProducts();
			refetchSales();
			refetchReports();
		} catch (error: any) {
			showToast(error.response?.data?.error || "Xatolik yuz berdi", "error");
		} finally {
			setIsProcessing(false);
			tg?.MainButton.hideProgress();
		}
	}, [cart, createSale, refetchProducts, refetchSales, refetchReports, showToast]);

	// Telegram integration
	useEffect(() => {
		const tg = getTelegramData();
		if (!tg) return;
		if (cartItemsCount > 0 && activeTab === "products") {
			tg.MainButton.setParams({
				text: `TASDIQLASH (${cartTotal.toLocaleString()} so'm)`,
				color: "#2563eb",
				is_visible: true,
				is_active: !isProcessing,
			});
			tg.MainButton.onClick(handleCheckout);
		} else {
			tg.MainButton.hide();
		}
		return () => tg.MainButton.offClick(handleCheckout);
	}, [cartItemsCount, cartTotal, activeTab, handleCheckout, isProcessing]);

	if (productsLoading || salesLoading || reportsLoading) {
		return <div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
		</div>;
	}

	return (
		<div className="min-h-screen bg-[#F8FAFC] pb-24">
			{/* Header */}
			<header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-sm">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<div>
						<h1 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
							<ShoppingBag className="w-5 h-5 text-blue-600" /> SHOP VENTURE
						</h1>
						<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
							{user?.firstName} • {new Date().toLocaleDateString('uz-UZ')}
						</p>
					</div>
					<Tabs value={activeTab} onValueChange={setActiveTab} className="bg-gray-100 p-1 rounded-xl">
						<TabsList className="bg-transparent h-8 gap-1">
							<TabsTrigger value="products" className="rounded-lg px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
								<Store className="w-3.5 h-3.5 mr-1" /> Do'kon
							</TabsTrigger>
							<TabsTrigger value="sales" className="rounded-lg px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
								<History className="w-3.5 h-3.5 mr-1" /> Tarix
							</TabsTrigger>
							<TabsTrigger value="reports" className="rounded-lg px-3 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
								<BarChart3 className="w-3.5 h-3.5 mr-1" /> Stat
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</header>

			<main className="max-w-7xl mx-auto p-4">
				<Tabs value={activeTab}>

					{/* 1. DO'KON TAB */}
					<TabsContent value="products" className="mt-0 outline-none space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

							{/* Mahsulotlar Ro'yxati */}
							<div className="lg:col-span-2 space-y-4">
								<div className="relative group">
									<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
									<Input
										placeholder="Mahsulot nomi yoki SKU..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="h-12 pl-12 rounded-2xl border-none shadow-md bg-white focus-visible:ring-2 focus-visible:ring-blue-500"
									/>
								</div>

								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									{filteredProducts.map((product) => (
										<div key={product._id}
											 onClick={() => handleAddToCart(product)}
											 className="group relative bg-white rounded-3xl border border-gray-100 p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
										>
											<div className="aspect-square rounded-2xl bg-gray-50 mb-3 overflow-hidden relative">
												{product.image ? (
													<img src={product.image} className="w-full h-full object-cover" alt="" />
												) : (
													<div className="w-full h-full flex items-center justify-center text-gray-300"><Package /></div>
												)}
												{cart[product._id] && (
													<div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px] flex items-center justify-center">
														<Badge className="bg-blue-600 text-white border-none h-8 w-8 rounded-full flex items-center justify-center text-sm">
															{cart[product._id].quantity}
														</Badge>
													</div>
												)}
												{product.count <= 5 && product.count > 0 && (
													<span className="absolute top-2 right-2 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">Kam qoldi</span>
												)}
											</div>
											<h3 className="text-xs font-bold text-gray-800 line-clamp-1">{product.name}</h3>
											<div className="flex justify-between items-center mt-1">
												<p className="text-[11px] font-black text-blue-600">{product.price.toLocaleString()} so'm</p>
												<p className="text-[9px] font-bold text-gray-400">{product.count} ta</p>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* SAVAT (DESKTOP) */}
							<div className="hidden lg:block">
								<Card className="border-none shadow-2xl rounded-[32px] sticky top-24 overflow-hidden">
									<CardHeader className="bg-gray-900 text-white p-6">
										<div className="flex justify-between items-center">
											<CardTitle className="text-xl flex items-center gap-2">
												<ShoppingCart className="w-6 h-6" /> Savat
											</CardTitle>
											<Button variant="ghost" size="sm" onClick={() => setCart({})} className="text-gray-400 hover:text-white">
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</CardHeader>
									<CardContent className="p-0">
										{cartItemsCount === 0 ? (
											<div className="py-20 text-center text-gray-400">
												<ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-10" />
												<p className="text-sm font-medium">Savat hali bo'sh</p>
											</div>
										) : (
											<div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
												{Object.values(cart).map((item) => (
													<div key={item.product._id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
														<div className="w-10 h-10 rounded-lg bg-white border flex-shrink-0">
															<img src={item.product.image} className="w-full h-full object-cover rounded-lg" alt="" />
														</div>
														<div className="flex-1">
															<p className="text-[11px] font-bold truncate">{item.product.name}</p>
															<p className="text-[10px] text-blue-600 font-bold">{(item.product.price * item.quantity).toLocaleString()} so'm</p>
														</div>
														<div className="flex items-center gap-2">
															<Button size="icon" variant="outline" className="h-6 w-6 rounded-md" onClick={() => updateCartQuantity(item.product._id, -1)}><Minus className="w-3 h-3"/></Button>
															<span className="text-xs font-black">{item.quantity}</span>
															<Button size="icon" variant="outline" className="h-6 w-6 rounded-md" onClick={() => updateCartQuantity(item.product._id, 1)}><Plus className="w-3 h-3"/></Button>
														</div>
													</div>
												))}
											</div>
										)}
										<div className="p-6 bg-gray-50 border-t border-gray-100">
											<div className="flex justify-between items-center mb-4">
												<span className="text-gray-500 font-bold text-sm uppercase">Jami summan:</span>
												<span className="text-2xl font-black text-gray-900">{cartTotal.toLocaleString()} <span className="text-xs font-normal">so'm</span></span>
											</div>
											<Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl text-lg font-black shadow-lg shadow-blue-100"
													disabled={isProcessing || cartItemsCount === 0} onClick={handleCheckout}>
												{isProcessing ? "YUBORILMOQDA..." : "SOTUVNI TASDIQLASH"}
											</Button>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</TabsContent>

					{/* 2. TARIX TAB */}
					<TabsContent value="sales" className="mt-0 outline-none space-y-3">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-black text-gray-800 italic">Oxirgi savdolaringiz</h2>
							<Badge variant="outline" className="rounded-lg">{sales.length} ta</Badge>
						</div>
						{sales.map((sale: Sale) => (
							<div key={sale._id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
										<CheckCircle2 className="w-6 h-6" />
									</div>
									<div>
										<h4 className="font-bold text-sm text-gray-900">{sale.product?.name}</h4>
										<p className="text-[10px] font-bold text-gray-400">
											{sale.quantity} ta x {sale.price?.toLocaleString()}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-black text-gray-900">{(sale.totalPrice || 0).toLocaleString()} <span className="text-[10px]">so'm</span></p>
									<p className="text-[10px] font-bold text-gray-300">{new Date(sale.createdAt).toLocaleTimeString('uz-UZ')}</p>
								</div>
							</div>
						))}
					</TabsContent>

					{/* 3. STATISTIKA TAB */}
					<TabsContent value="reports" className="mt-0 outline-none">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card className="bg-blue-600 text-white rounded-[32px] border-none shadow-xl shadow-blue-100 relative overflow-hidden group">
								<div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><Wallet size={120} /></div>
								<CardContent className="p-8">
									<p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-2">Bugungi tushum</p>
									<h2 className="text-4xl font-black tabular-nums">
										{(reports?.summary?.totalRevenue || 0).toLocaleString()} <span className="text-sm font-normal">so'm</span>
									</h2>
								</CardContent>
							</Card>

							<div className="grid grid-cols-2 gap-4">
								<StatCard title="Savdolar soni" value={reports?.summary?.totalSales || 0} unit="ta" icon={<ShoppingCart className="text-blue-500" />} />
								<StatCard title="Mahsulotlar" value={reports?.summary?.totalQuantity || 0} unit="ta" icon={<Package className="text-emerald-500" />} />
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</main>

			{cartItemsCount > 0 && activeTab === "products" && (
				<div className="fixed bottom-6 left-4 right-4 lg:hidden z-50">
					<div className="bg-gray-900 text-white p-4 rounded-3xl shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom-10">
						<div>
							<p className="text-[10px] font-bold text-gray-400 uppercase">Savatda {cartItemsCount} ta tovar</p>
							<p className="text-lg font-black">{cartTotal.toLocaleString()} so'm</p>
						</div>
						<Button onClick={handleCheckout} className="bg-blue-600 rounded-2xl h-12 px-6 font-black active:scale-95 transition-transform">
							SOTISH
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

// Yordamchi StatCard
function StatCard({ title, value, unit, icon }: any) {
	return (
		<Card className="border-none shadow-md rounded-[24px] bg-white group hover:bg-gray-50 transition-colors">
			<CardContent className="p-5">
				<div className="bg-gray-50 p-2 w-fit rounded-xl mb-3 group-hover:bg-white transition-colors">{icon}</div>
				<p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">{title}</p>
				<h4 className="text-xl font-black text-gray-900">{value} <span className="text-xs font-normal text-gray-400">{unit}</span></h4>
			</CardContent>
		</Card>
	);
}
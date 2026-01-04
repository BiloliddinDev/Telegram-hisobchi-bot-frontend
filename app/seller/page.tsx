"use client";

import { useState, useMemo } from "react";
import { useSellerStocks, useSellerSalesHistory, useProcessSale } from "@/hooks/useSellerData";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import { Search, ShoppingCart, Plus, Minus, ShoppingBag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaleEntry, SellerStock } from "@/interface/seller.type";
import { StockSkeleton, HistorySkeleton } from "@/components/seller/SellerSkeleton";
import {Skeleton} from "@/components/ui/skeleton";

interface ApiError {
	response?: {
		data?: {
			message?: string;
		};
	};
	message: string;
}

export default function SellerPage() {
	const { user } = useAuthStore();
	const { showToast } = useToast();

	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { data: stockData, isLoading: stockLoading } = useSellerStocks();
	const { data: salesData, isLoading: salesLoading } = useSellerSalesHistory();
	const { mutateAsync: processSale, isPending: isSelling } = useProcessSale();

	const [cart, setCart] = useState<Record<string, { stock: SellerStock; qty: number; price: number }>>({});
	const [customer, setCustomer] = useState({ name: "", phone: "", notes: "" });

	const filteredStocks = useMemo(() =>
		stockData?.stocks.filter(s =>
			s.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
		) || [], [stockData, searchTerm]);

	const handleAddToCart = (stock: SellerStock) => {
		const current = cart[stock.product._id];
		const currentQty = current?.qty || 0;

		if (currentQty >= stock.quantity) {
			showToast("Ombordagi miqdordan ko'p sotib bo'lmaydi", "error");
			return;
		}

		setCart(prev => ({
			...prev,
			[stock.product._id]: {
				stock,
				qty: currentQty + 1,
				price: stock.product.price
			}
		}));
	};

	const updateQty = (id: string, delta: number) => {
		setCart(prev => {
			const item = prev[id];
			if (!item) return prev;
			const newQty = item.qty + delta;
			if (newQty <= 0) {
				const newState = { ...prev };
				delete newState[id];
				return newState;
			}
			if (newQty > item.stock.quantity) return prev;
			return { ...prev, [id]: { ...item, qty: newQty } };
		});
	};

	const updatePrice = (id: string, newPrice: number) => {
		setCart(prev => ({
			...prev,
			[id]: { ...prev[id], price: newPrice }
		}));
	};

	const totalCartAmount = Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);

	const onCheckout = () => {
		if (Object.keys(cart).length === 0) return;
		setIsModalOpen(true);
	};

	const handleFinalSubmit = async () => {
		try {
			// Promise.all orqali barcha sotuvlarni parallel yuboramiz (tezroq bo'ladi)
			await Promise.all(
				Object.values(cart).map(item =>
					processSale({
						productId: item.stock.product._id,
						quantity: item.qty,
						price: item.price,
						customerName: customer.name,
						customerPhone: customer.phone,
						notes: customer.notes
					})
				)
			);

			showToast("Sotuv muvaffaqiyatli yakunlandi", "success");
			setCart({});
			setCustomer({ name: "", phone: "", notes: "" });
			setIsModalOpen(false);
		} catch (error) {
			const apiErr = error as ApiError;
			const message = apiErr.response?.data?.message || "Sotuvda xatolik yuz berdi";
			showToast(message, "error");
		}
	};

	return (
		<div className="min-h-screen bg-[#f8f9fa] pb-20">
			<header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 shadow-sm flex justify-between items-center">
				<div>
					<h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
						<ShoppingBag className="text-primary w-6 h-6" /> Sotuv Paneli
					</h1>
					<p className="text-xs text-muted-foreground font-medium">
						Sotuvchi: {user?.firstName || user?.username || "Admin"}
					</p>
				</div>
				<div className="flex items-center gap-3 text-sm font-semibold">
					<span className="text-gray-400">Jami qoldiq:</span>
					{stockLoading ? <Skeleton className="h-5 w-12" /> : (
						<Badge variant="outline" className="border-gray-300">{stockData?.summary.totalQuantity} ta</Badge>
					)}
				</div>
			</header>

			<main className="max-w-7xl mx-auto p-4 md:p-6">
				<Tabs defaultValue="products" className="space-y-6">
					<TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-8">
						<TabsTrigger value="products" className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3 bg-transparent shadow-none font-bold text-sm transition-all uppercase">
							Mahsulotlar
						</TabsTrigger>
						<TabsTrigger value="history" className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 py-3 bg-transparent shadow-none font-bold text-sm transition-all uppercase">
							Sotuv Tarixi
						</TabsTrigger>
					</TabsList>

					<TabsContent value="products" className="mt-0 outline-none">
						<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
							<div className="lg:col-span-3 space-y-4">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Nomi yoki SKU bo'yicha qidirish..."
										className="pl-10 h-11 bg-white border-gray-200 rounded-md focus-visible:ring-primary"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>

								{stockLoading ? (
									<StockSkeleton />
								) : (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
										{filteredStocks.map((stock : SellerStock) => (
											<Card
												key={stock._id}
												onClick={() => handleAddToCart(stock)}
												className="cursor-pointer hover:border-primary transition-colors border-gray-200 shadow-none rounded-sm"
											>
												<CardContent className="p-4 space-y-3">
													<div className="flex justify-between items-start">
														<h3 className="font-bold text-sm text-gray-900 line-clamp-2">{stock.product.name}</h3>
														{cart[stock.product._id] && (
															<Badge className="bg-primary text-white ml-2">{cart[stock.product._id].qty}</Badge>
														)}
													</div>
													<div className="flex justify-between items-end">
														<div>
															<p className="text-xs text-gray-400 font-medium italic">Narxi:</p>
															<p className="font-bold text-primary">{stock.product.price.toLocaleString()} {`so'm`}</p>
														</div>
														<Badge variant="secondary" className="text-[10px] font-bold bg-gray-100">{stock.quantity} ta mavjud</Badge>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}
							</div>

							<div className="lg:col-span-1">
								<Card className="border-gray-200 shadow-sm rounded-sm sticky top-24">
									<CardHeader className="p-4 border-b bg-gray-50/50">
										<CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
											<ShoppingCart size={18} /> Savat
										</CardTitle>
									</CardHeader>
									<CardContent className="p-0">
										<div className="max-h-[400px] overflow-y-auto divide-y">
											{Object.values(cart).length === 0 ? (
												<div className="p-10 text-center text-gray-400 text-xs font-medium">{`Savat bo'sh`}</div>
											) : (
												Object.values(cart).map((item) => (
													<div key={item.stock._id} className="p-3 space-y-3">
														<div className="flex justify-between">
															<p className="text-[11px] font-bold line-clamp-1 flex-1 uppercase">{item.stock.product.name}</p>
															<button className="text-gray-400 hover:text-red-500" onClick={() => updateQty(item.stock.product._id, -item.qty)}>✕</button>
														</div>
														<div className="flex items-center gap-2">
															<span className="text-[10px] text-gray-400 font-bold uppercase">Sotuv Narxi:</span>
															<Input
																type="number"
																className="h-7 text-xs font-bold border-gray-300 rounded-none w-24"
																value={item.price}
																onChange={(e) => updatePrice(item.stock.product._id, Number(e.target.value))}
															/>
														</div>
														<div className="flex items-center justify-between">
															<div className="flex items-center border rounded-md bg-white">
																<Button variant="ghost" size="icon" className="h-6 w-6 rounded-none border-r p-0" onClick={() => updateQty(item.stock.product._id, -1)}><Minus size={10}/></Button>
																<span className="text-xs font-bold w-8 text-center">{item.qty}</span>
																<Button variant="ghost" size="icon" className="h-6 w-6 rounded-none border-l p-0" onClick={() => updateQty(item.stock.product._id, 1)}><Plus size={10}/></Button>
															</div>
															<p className="text-xs font-bold text-gray-900">{(item.price * item.qty).toLocaleString()}{`so'm`}</p>
														</div>
													</div>
												))
											)}
										</div>
										<div className="p-4 bg-gray-100/50 border-t border-gray-200">
											<div className="flex justify-between items-center mb-4">
												<span className="text-xs font-bold text-gray-500 uppercase">Umumiy:</span>
												<span className="text-lg font-black">{totalCartAmount.toLocaleString()} {`so'm`}</span>
											</div>
											<Button
												className="w-full bg-primary hover:bg-primary/90 font-bold h-11 rounded-sm uppercase text-xs tracking-widest shadow-md"
												disabled={Object.keys(cart).length === 0}
												onClick={onCheckout}
											>
												Sotuvni yakunlash
											</Button>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="history" className="mt-0 outline-none">
						{salesLoading ? (
							<HistorySkeleton />
						) : (
							<div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
								<table className="w-full text-sm text-left">
									<thead className="bg-gray-50 text-gray-500 font-bold text-[10px] uppercase border-b">
									<tr>
										<th className="px-4 py-3">Mahsulot nomi</th>
										<th className="px-4 py-3">{`Mijoz ma'lumotlari`}</th>
										<th className="px-4 py-3 text-center">Miqdor</th>
										<th className="px-4 py-3 text-right">Umumiy summa</th>
										<th className="px-4 py-3 text-right">Sana / Vaqt</th>
									</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
									{salesData?.map((sale: SaleEntry) => (
										<tr key={sale._id} className="hover:bg-gray-50/50 transition-colors">
											<td className="px-4 py-4 font-bold text-gray-900 uppercase text-[11px]">{sale.productId.name}</td>
											<td className="px-4 py-4">
												<p className="font-bold text-gray-700">{sale.customerName}</p>
												<p className="text-[10px] text-gray-400 font-medium italic">{sale.customerPhone}</p>
											</td>
											<td className="px-4 py-4 text-center font-bold">{sale.quantity} ta</td>
											<td className="px-4 py-4 text-right font-black text-primary">{sale.totalAmount.toLocaleString()}{`so'm`}</td>
											<td className="px-4 py-4 text-right text-gray-400 text-[10px] font-bold">
												{new Date(sale.timestamp).toLocaleDateString()} <br />
												{new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
											</td>
										</tr>
									))}
									</tbody>
								</table>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</main>

			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="sm:max-w-[400px] rounded-none p-0 overflow-hidden border-none shadow-2xl">
					<DialogHeader className="p-5 bg-gray-900 text-white rounded-none">
						<DialogTitle className="text-sm font-bold uppercase tracking-[2px]">{`Mijozni ro'yxatga olish`}</DialogTitle>
					</DialogHeader>
					<div className="p-6 space-y-4 bg-white">
						<div className="grid gap-1.5">
							<label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{`Mijoz to'liq ismi`}</label>
							<Input value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} placeholder="Masalan: Ali Valiyev" className="rounded-none border-gray-300 focus:ring-primary" />
						</div>
						<div className="grid gap-1.5">
							<label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Telefon raqami</label>
							<Input value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} placeholder="+998 __ ___ __ __" className="rounded-none border-gray-300" />
						</div>
						<div className="grid gap-1.5">
							<label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Sotuv uchun izoh</label>
							<Input value={customer.notes} onChange={(e) => setCustomer({...customer, notes: e.target.value})} placeholder="Ixtiyoriy..." className="rounded-none border-gray-300" />
						</div>
						<div className="pt-4 border-t border-dashed mt-4 flex justify-between items-center">
							<p className="text-[10px] font-black text-gray-400 uppercase italic">{`To'lov miqdori:`}</p>
							<p className="text-xl font-black text-primary">{totalCartAmount.toLocaleString()}{`so'm`}</p>
						</div>
						<Button className="w-full h-12 bg-primary hover:bg-primary/90 font-bold rounded-none text-xs uppercase tracking-widest" disabled={isSelling} onClick={handleFinalSubmit}>
							{isSelling ? "Yuborilmoqda..." : "Tasdiqlash va Sotish"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
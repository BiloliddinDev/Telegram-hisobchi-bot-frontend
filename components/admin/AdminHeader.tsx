import { TabsList, TabsTrigger } from "../ui/tabs";

export default function AdminHeader() {
	return (
		<TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 h-auto">
			<TabsTrigger value="products">Mahsulotlar</TabsTrigger>
			<TabsTrigger value="sellers">Sotuvchilar</TabsTrigger>
			<TabsTrigger value="reports">Hisobotlar</TabsTrigger>
			<TabsTrigger value="cash">Kassa</TabsTrigger>
			<TabsTrigger value="assign">Biriktirish</TabsTrigger>
		</TabsList>
	);
}

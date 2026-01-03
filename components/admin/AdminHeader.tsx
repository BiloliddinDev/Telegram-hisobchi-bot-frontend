import { TabsList, TabsTrigger } from "../ui/tabs";

export default function AdminHeader() {
	return (
		<TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 h-auto">
			<TabsTrigger value="products">Mahsulotlar</TabsTrigger>
			<TabsTrigger value="sellers">Sotuvchilar</TabsTrigger>
			<TabsTrigger value="reports">Hisobotlar</TabsTrigger>
			<TabsTrigger value="assign">Biriktirish</TabsTrigger>
		</TabsList>
	);
}

import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/interface/products.type";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  selectedCount?: number;
}

export function ProductCard({
  product,
  onSelect,
  selectedCount,
}: ProductCardProps) {
  const isOutOfStock = product.warehouseQuantity <= 0;

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all active:scale-95 ${
        selectedCount
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/50"
      } bg-white text-zinc-900 border-zinc-200 ${isOutOfStock ? "opacity-60 grayscale-[0.5] cursor-not-allowed active:scale-100" : ""}`}
      onClick={() => !isOutOfStock && onSelect?.(product)}
    >
      <div className="relative h-40 w-full bg-zinc-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400 text-xs">
            Rasm yo&apos;q
          </div>
        )}
        {selectedCount && selectedCount > 0 && (
          <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
            {selectedCount}
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-destructive text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
              Tugagan
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
        <div className="flex justify-between items-end mt-2">
          <div>
            <p className="text-primary font-bold text-base">
              {(product.price || 0).toLocaleString()} so&apos;m
            </p>
            <p
              className={`text-[10px] ${isOutOfStock ? "text-red-500 font-bold" : "text-zinc-500"}`}
            >
              Qoldiq: {product.warehouseQuantity} ta
            </p>
          </div>
          <span className="text-[10px] bg-zinc-100 px-2 py-1 rounded text-zinc-600 border border-zinc-200">
            {product.category.name}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

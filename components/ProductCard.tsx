import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/interface/products.type";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  selectedCount?: number;
}

export function ProductCard({ product, onSelect, selectedCount }: ProductCardProps) {
  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all active:scale-95 ${
        selectedCount ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
      } bg-[#242424] text-white border-zinc-800`}
      onClick={() => onSelect?.(product)}
    >
      <div className="relative h-40 w-full bg-zinc-900">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-700">
            Rasm yo&apos;q
          </div>
        )}
        {selectedCount && selectedCount > 0 && (
          <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
            {selectedCount}
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
        <div className="flex justify-between items-end mt-2">
          <div>
            <p className="text-primary font-bold text-base">
              {(product.price || 0).toLocaleString()} so&apos;m
            </p>
            <p className="text-[10px] text-zinc-400">
              Qoldiq: {product.stock} ta
            </p>
          </div>
          <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-400">
            {product.category}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

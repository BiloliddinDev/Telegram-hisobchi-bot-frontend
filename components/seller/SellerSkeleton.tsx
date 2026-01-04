import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function StockSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-gray-200 shadow-none rounded-sm">
                    <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex justify-between items-end pt-2">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-10" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function HistorySkeleton() {
    return (
        <div className="border rounded-md overflow-hidden bg-white">
            <div className="h-10 bg-gray-50 border-b" />
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex p-4 border-b gap-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                </div>
            ))}
        </div>
    );
}
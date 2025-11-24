import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <Skeleton className="h-8 w-[350px]" />
                <Skeleton className="h-10 w-[180px]" />
            </div>

            {/* Metrics Cards - Simplified */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-6">
                        <Skeleton className="h-20 w-full" />
                    </Card>
                ))}
            </div>

            {/* Main Content Card - Simplified */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    {/* Filters area */}
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full max-w-md" />
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>

                    {/* Table rows - Reduced to 3 */}
                    <div className="space-y-3 pt-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-9 w-64" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

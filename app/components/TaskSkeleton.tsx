import { Card, CardContent } from '@/components/ui/card';


export function TaskCardSkeleton() {
  return (
    <Card className="border-gray-800/50 bg-gray-900/30 backdrop-blur-sm overflow-hidden relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-800/50 animate-pulse" />
              <div className="h-4 w-32 bg-gray-800/50 rounded animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-800/50 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-800/50 rounded animate-pulse" />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 bg-gray-800/50 rounded-full animate-pulse" />
              <div className="h-3 w-16 bg-gray-800/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </CardContent>
      
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-700/20 to-transparent" />
    </Card>
  );
}

export function TaskCardSkeletonWithShimmer() {
  return (
    <Card className="border-gray-800/50 bg-gray-900/30 backdrop-blur-sm overflow-hidden relative group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            {/* URL Line with Globe Icon */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-gray-800/70 to-gray-800/30">
                <div className="w-full h-full bg-gradient-to-br from-gray-700/50 to-transparent rounded animate-pulse" />
              </div>
              <div className="h-4 w-32 bg-gradient-to-r from-gray-800/70 to-gray-800/30 rounded overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent animate-shimmer-fast" />
              </div>
            </div>
            
            {/* Question Lines */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-gradient-to-r from-gray-800/70 to-gray-800/30 rounded overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent animate-shimmer-fast" />
              </div>
              <div className="h-3 w-3/4 bg-gradient-to-r from-gray-800/70 to-gray-800/30 rounded overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent animate-shimmer-fast" />
              </div>
            </div>
            
            {/* Status Badge and Time */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 bg-gradient-to-r from-gray-800/70 to-gray-800/30 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent animate-shimmer-fast" />
              </div>
              <div className="h-3 w-16 bg-gradient-to-r from-gray-800/70 to-gray-800/30 rounded overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent animate-shimmer-fast" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-700/5 to-transparent" />
    </Card>
  );
}

export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeletonWithShimmer key={index} />
      ))}
    </div>
  );
}
export function ServicesSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
          
          {/* Recherche skeleton */}
          <div className="space-y-2 mb-6">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>
          
          {/* Tri skeleton */}
          <div className="space-y-2 mb-6">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>
          
          {/* Filtres skeleton */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="mb-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-3"></div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Services grid skeleton */}
      <div className="lg:col-span-3">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-6"></div>
                
                {/* Features skeleton */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center mb-2">
                    <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </div>
                ))}
                
                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                  <div className="h-9 w-28 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
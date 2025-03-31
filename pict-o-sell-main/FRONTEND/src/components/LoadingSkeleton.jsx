import React from 'react';

export const ProductSkeleton = () => (
  <div className="rounded-xl shadow-lg overflow-hidden bg-white animate-pulse">
    <div className="w-full h-56 bg-gray-200" />
    <div className="p-5 space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  </div>
);

export const CategorySkeleton = () => (
  <div className="flex justify-between items-center animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3" />
    <div className="h-8 bg-gray-200 rounded-full w-32" />
  </div>
);

export const ActivitySkeleton = () => (
  <div className="flex items-center justify-between p-3 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-16" />
  </div>
);

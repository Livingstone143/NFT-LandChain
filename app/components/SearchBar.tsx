'use client';

import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full py-2 pl-10 pr-4 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Search records, survey numbers..."
      />
    </div>
  );
} 
'use client';

import React from 'react';
import { SearchBar } from './SearchBar';
import ConnectWallet from './ConnectWallet';
import { Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white border-b">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 flex items-center">
          {title && (
            <h1 className="text-xl font-semibold text-gray-800 mr-4">{title}</h1>
          )}
          <SearchBar />
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="p-2 text-gray-400 rounded-full hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <ConnectWallet />
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium">
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 
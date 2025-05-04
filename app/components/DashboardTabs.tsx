'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface TabItem {
  name: string;
  href: string;
}

export function DashboardTabs() {
  const pathname = usePathname();
  
  const tabs: TabItem[] = [
    { name: 'Records', href: '/dashboard' },
    { name: 'Map View', href: '/dashboard/map' },
    { name: 'Survey', href: '/dashboard/survey' },
    { name: 'Transactions', href: '/dashboard/transactions' },
    { name: 'Analytics', href: '/dashboard/analytics' },
  ];

  // Check if current route is a dashboard route
  const isTabActive = (tab: TabItem) => {
    if (tab.href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    if (tab.href !== '/dashboard' && pathname.startsWith(tab.href)) {
      return true;
    }
    return false;
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              isTabActive(tab)
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
            aria-current={isTabActive(tab) ? 'page' : undefined}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  );
} 
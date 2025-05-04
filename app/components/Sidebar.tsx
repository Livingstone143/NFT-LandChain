'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Map,
  FileText,
  ArrowLeftRight,
  BarChart2,
  Settings,
  MapPin,
  Repeat
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const pathname = usePathname();

  const sidebarItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Land Map',
      href: '/dashboard/land-map',
      icon: <Map className="h-5 w-5" />,
    },
    {
      name: 'Survey Mapping',
      href: '/dashboard/survey',
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      name: 'Records',
      href: '/dashboard/records',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: 'Transactions',
      href: '/dashboard/transactions',
      icon: <Repeat className="h-5 w-5" />,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-white border-r w-60">
      <div className="p-4 border-b">
        <Link href="/dashboard">
          <div className="flex items-center font-semibold text-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 mr-2 text-indigo-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>LandChain</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 
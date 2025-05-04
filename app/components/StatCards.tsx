'use client';

import React from 'react';
import { FileText, Wallet, ArrowUpDown, MapPin } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500 truncate">
              {title}
            </div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {value}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {description}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-md text-indigo-600">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardsProps {
  totalLandAssets?: number;
  walletBalance?: number;
  pendingTransfers?: number;
  totalArea?: number;
}

export function StatCards({ 
  totalLandAssets = 0, 
  walletBalance = 0, 
  pendingTransfers = 0, 
  totalArea = 0 
}: StatCardsProps) {
  const stats = [
    {
      title: 'Total Land Assets',
      value: totalLandAssets.toString(),
      description: `${totalLandAssets === 1 ? '1 property' : `${totalLandAssets} properties`}`,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Wallet Balance',
      value: `${walletBalance.toFixed(4)} ETH`,
      description: 'Current portfolio value',
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      title: 'Pending Transfers',
      value: pendingTransfers.toString(),
      description: `${pendingTransfers === 1 ? 'Needs approval' : 'Need approval'}`,
      icon: <ArrowUpDown className="h-5 w-5" />,
    },
    {
      title: 'Total Area',
      value: `${totalArea.toLocaleString()} sq.m`,
      description: 'Total land area owned',
      icon: <MapPin className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
} 
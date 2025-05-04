'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { StatCards } from '../components/StatCards'
import { DashboardTabs } from '../components/DashboardTabs'
import { LandRecordsTable } from '../components/LandRecordsTable'

interface LandAsset {
  id: string
  surveyNumber: string
  location: { latitude: number; longitude: number }
  area: number
  value: number
  status: 'Verified' | 'Pending' | 'PendingTransfer'
  lastUpdated: string
}

interface DashboardStats {
  totalAssets: number;
  totalArea: number;
  totalValue: number;
  pendingTransfers: number;
}

export default function Dashboard() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalAssets: 0,
    totalArea: 0,
    totalValue: 0,
    pendingTransfers: 0
  })
  const [landRecords, setLandRecords] = useState([])
  const [dataLastUpdated, setDataLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch real-time data
  const fetchDashboardData = async () => {
    if (!isConnected) return;
    
    try {
      const response = await fetch('/api/land-records');
      
      if (!response.ok) {
        throw new Error('Failed to fetch land records');
      }
      
      const data = await response.json();
      const records = data.records || [];
      
      // Calculate dashboard statistics
      const userRecords = address 
        ? records.filter((record: any) => record.ownerAddress === address)
        : records;
      
      const pendingTransferCount = userRecords.filter(
        (record: any) => record.status === 'PendingTransfer'
      ).length;
      
      const totalArea = userRecords.reduce(
        (sum: number, record: any) => sum + (record.area || 0), 
        0
      );
      
      const totalValue = userRecords.reduce(
        (sum: number, record: any) => sum + (record.value || 0), 
        0
      );
      
      setDashboardData({
        totalAssets: userRecords.length,
        totalArea,
        totalValue,
        pendingTransfers: pendingTransferCount
      });
      
      setLandRecords(userRecords);
      setDataLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch the latest data. Will retry automatically.');
    }
  };

  useEffect(() => {
    // Check localStorage for wallet connection on first render
    const checkConnection = () => {
      if (typeof window !== 'undefined') {
        const walletAddress = localStorage.getItem('walletAddress')
        if (walletAddress) {
          setIsConnected(true)
          setAddress(walletAddress)
        } else if (!isLoading) {
          // Only redirect if we've finished the initial loading and no wallet is connected
          router.push('/')
        }
        setIsLoading(false)
      }
    }
    
    checkConnection()
    
    // Set up a listener for storage changes (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'walletAddress') {
        if (e.newValue) {
          setIsConnected(true)
          setAddress(e.newValue)
        } else {
          setIsConnected(false)
          setAddress(null)
          router.push('/')
        }
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [router, isLoading])

  // Set up real-time data fetching
  useEffect(() => {
    if (isConnected && !isLoading) {
      // Fetch data immediately on connection
      fetchDashboardData();
      
      // Then set up interval to refresh data every 15 seconds
      const intervalId = setInterval(fetchDashboardData, 15000);
      
      return () => clearInterval(intervalId);
    }
  }, [isConnected, isLoading, address]);

  // Don't show anything while checking connection status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Land Record Management</h1>
              
              {dataLastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {dataLastUpdated.toLocaleTimeString()}
                  <button 
                    onClick={fetchDashboardData} 
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                    title="Refresh data"
                  >
                    ↻
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-6">Manage your land assets on the blockchain</p>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <StatCards 
              totalLandAssets={dashboardData.totalAssets}
              walletBalance={dashboardData.totalValue}
              pendingTransfers={dashboardData.pendingTransfers}
              totalArea={dashboardData.totalArea}
            />
            
            <div className="mt-8">
              <DashboardTabs />
            </div>
            
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <LandRecordsTable records={landRecords} onDataChange={fetchDashboardData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 
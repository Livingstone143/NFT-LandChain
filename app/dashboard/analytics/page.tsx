'use client'
import React, { useEffect, useState } from 'react'
import { Sidebar } from '../../components/Sidebar'
import { Header } from '../../components/Header'
import { BarChart3, PieChart, LineChart, TrendingUp, Activity, DollarSign } from 'lucide-react'

interface AnalyticsSummary {
  totalVerifiedLands: number;
  totalArea: number;
  totalValue: number;
  transferCount: number;
  verificationCount: number;
  pendingRequests: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalVerifiedLands: 0,
    totalArea: 0,
    totalValue: 0,
    transferCount: 0,
    verificationCount: 0,
    pendingRequests: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Example chart data (in real app this would be calculated from actual data)
  const [landsByStatus, setLandsByStatus] = useState<ChartData>({
    labels: ['Verified', 'Pending', 'PendingTransfer'],
    datasets: [{
      label: 'Land Records by Status',
      data: [0, 0, 0],
      backgroundColor: ['#10B981', '#F59E0B', '#3B82F6']
    }]
  })

  const [transfersOverTime, setTransfersOverTime] = useState<ChartData>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Land Transfers',
      data: [0, 0, 0, 0, 0, 0],
      borderColor: '#10B981',
      borderWidth: 2,
      fill: false
    }]
  })

  const [landAreaDistribution, setLandAreaDistribution] = useState<ChartData>({
    labels: ['< 1000 sq.m', '1000-5000 sq.m', '5000-10000 sq.m', '> 10000 sq.m'],
    datasets: [{
      label: 'Land Area Distribution',
      data: [0, 0, 0, 0],
      backgroundColor: ['#F87171', '#FBBF24', '#60A5FA', '#34D399']
    }]
  })

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // In a real app, you would have dedicated analytics endpoints
        // Here we're using the land-records endpoint to derive analytics
        const response = await fetch('/api/land-records')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }

        const data = await response.json()
        const records = data.records || []
        
        // Calculate summary statistics
        const verifiedLands = records.filter((record: any) => record.status === 'Verified')
        const pendingLands = records.filter((record: any) => record.status === 'Pending')
        const pendingTransfers = records.filter((record: any) => record.status === 'PendingTransfer')
        
        // Count transactions (from previous owners arrays)
        let transferCount = 0
        records.forEach((record: any) => {
          transferCount += (record.previousOwners?.length || 0)
        })
        
        // Calculate total area and value
        const totalArea = records.reduce((sum: number, record: any) => sum + (record.area || 0), 0)
        const totalValue = records.reduce((sum: number, record: any) => sum + (record.value || 0), 0)
        
        setSummary({
          totalVerifiedLands: verifiedLands.length,
          totalArea: totalArea,
          totalValue: totalValue,
          transferCount: transferCount,
          verificationCount: verifiedLands.length,
          pendingRequests: pendingTransfers.length
        })
        
        // Update chart data
        setLandsByStatus({
          labels: ['Verified', 'Pending', 'PendingTransfer'],
          datasets: [{
            label: 'Land Records by Status',
            data: [verifiedLands.length, pendingLands.length, pendingTransfers.length],
            backgroundColor: ['#10B981', '#F59E0B', '#3B82F6']
          }]
        })
        
        // Generate mock transfers over time data (in real app, this would be from actual data)
        setTransfersOverTime({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Land Transfers',
            data: [
              Math.floor(Math.random() * 10),
              Math.floor(Math.random() * 10),
              Math.floor(Math.random() * 10),
              Math.floor(Math.random() * 10),
              Math.floor(Math.random() * 10),
              transferCount
            ],
            borderColor: '#10B981',
            borderWidth: 2,
            fill: false
          }]
        })
        
        // Calculate area distribution
        const areaSmall = records.filter((r: any) => r.area < 1000).length
        const areaMedium = records.filter((r: any) => r.area >= 1000 && r.area < 5000).length
        const areaLarge = records.filter((r: any) => r.area >= 5000 && r.area < 10000).length
        const areaVeryLarge = records.filter((r: any) => r.area >= 10000).length
        
        setLandAreaDistribution({
          labels: ['< 1000 sq.m', '1000-5000 sq.m', '5000-10000 sq.m', '> 10000 sq.m'],
          datasets: [{
            label: 'Land Area Distribution',
            data: [areaSmall, areaMedium, areaLarge, areaVeryLarge],
            backgroundColor: ['#F87171', '#FBBF24', '#60A5FA', '#34D399']
          }]
        })
      } catch (err) {
        console.error('Error fetching analytics data:', err)
        setError('Failed to load analytics data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()

    // Update analytics data every 30 seconds for real-time
    const intervalId = setInterval(fetchAnalyticsData, 30000)
    
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Analytics" />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Land Records Analytics</h1>
            
            {isLoading && (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}

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

            {!isLoading && !error && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                        <BarChart3 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium text-gray-900">Land Records</h3>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">{summary.totalVerifiedLands}</p>
                          <p className="ml-2 text-sm font-medium text-gray-500">verified properties</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium text-gray-900">Area Covered</h3>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">{summary.totalArea.toLocaleString()}</p>
                          <p className="ml-2 text-sm font-medium text-gray-500">sq.m</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                        <DollarSign className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium text-gray-900">Total Value</h3>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">{summary.totalValue.toLocaleString()}</p>
                          <p className="ml-2 text-sm font-medium text-gray-500">ETH</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
                        <TrendingUp className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium text-gray-900">Transfers</h3>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">{summary.transferCount}</p>
                          <p className="ml-2 text-sm font-medium text-gray-500">completed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                        <PieChart className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium text-gray-900">Verifications</h3>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">{summary.verificationCount}</p>
                          <p className="ml-2 text-sm font-medium text-gray-500">records verified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                        <LineChart className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium text-gray-900">Pending</h3>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">{summary.pendingRequests}</p>
                          <p className="ml-2 text-sm font-medium text-gray-500">transfer requests</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chart placeholders - in a real app, these would be actual charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Land Records by Status</h3>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <PieChart className="h-16 w-16 mx-auto mb-2 text-indigo-500" />
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {landsByStatus.labels.map((label, index) => (
                            <div key={label} className="flex flex-col items-center">
                              <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: landsByStatus.datasets[0].backgroundColor?.[index] }}></div>
                              <p className="text-xs font-medium">{label}</p>
                              <p className="text-lg font-semibold">{landsByStatus.datasets[0].data[index]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Land Transfers Over Time</h3>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <LineChart className="h-16 w-16 mx-auto mb-2 text-green-500" />
                        <div className="w-full h-32 flex items-end justify-between px-6">
                          {transfersOverTime.datasets[0].data.map((value, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <div className="bg-green-500" style={{ height: `${value * 5}px`, width: '20px' }}></div>
                              <p className="text-xs mt-1">{transfersOverTime.labels[index]}</p>
                              <p className="text-xs font-semibold">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Land Area Distribution</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500 w-full">
                      <BarChart3 className="h-16 w-16 mx-auto mb-2 text-blue-500" />
                      <div className="w-full h-32 flex items-end justify-between px-6">
                        {landAreaDistribution.datasets[0].data.map((value, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div className="rounded-t" 
                              style={{ 
                                height: `${value * 10 + 10}px`, 
                                width: '40px',
                                backgroundColor: landAreaDistribution.datasets[0].backgroundColor?.[index]
                              }}
                            ></div>
                            <p className="text-xs mt-1 max-w-[60px] truncate">{landAreaDistribution.labels[index]}</p>
                            <p className="text-xs font-semibold">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Insights</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      • {summary.totalVerifiedLands} verified land records are registered on the blockchain.
                    </p>
                    <p className="text-sm text-gray-600">
                      • The total area of all properties is {summary.totalArea.toLocaleString()} sq.m.
                    </p>
                    <p className="text-sm text-gray-600">
                      • There have been {summary.transferCount} completed land transfers.
                    </p>
                    <p className="text-sm text-gray-600">
                      • {summary.pendingRequests} transfer requests are currently pending approval.
                    </p>
                    {transfersOverTime.datasets[0].data[5] > transfersOverTime.datasets[0].data[4] && (
                      <p className="text-sm text-green-600">
                        • Land transfers increased compared to last month.
                      </p>
                    )}
                    {landsByStatus.datasets[0].data[0] > (landsByStatus.datasets[0].data[1] + landsByStatus.datasets[0].data[2]) && (
                      <p className="text-sm text-green-600">
                        • Most land records are verified and ready for transfer.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 
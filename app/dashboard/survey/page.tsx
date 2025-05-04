'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ConnectWallet from '../../components/ConnectWallet'
import dynamic from 'next/dynamic'

// Dynamically import the Map component with Leaflet CSS
const MapWithNoSSR = dynamic(
  () => import('../../components/Map'), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-[600px] rounded-lg border-4 border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
)

interface LandRecord {
  id: string
  surveyNumber: string
  location: { latitude: number, longitude: number }
  area: number
  status: string
}

export default function SurveyPage() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [landRecords, setLandRecords] = useState<LandRecord[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

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
    
    // Set map as loaded immediately to avoid flickering
    setMapLoaded(true)
    
    // Fetch land records
    const fetchLandRecords = async () => {
      try {
        const response = await fetch('/api/land-records')
        if (response.ok) {
          const data = await response.json()
          setLandRecords(data.records || [])
        }
      } catch (error) {
        console.error('Error fetching land records:', error)
      }
    }
    
    if (isConnected) {
      fetchLandRecords()
    }

    // Cleanup function
    return () => {
      // Any cleanup if needed
    }
  }, [isConnected, router, isLoading])

  const handleConnect = (connectedAddress: string) => {
    setIsConnected(true)
    setAddress(connectedAddress)
  }

  // Don't show anything while checking connection status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">LandChain</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="/dashboard/survey" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Survey Mapping
                </a>
                <a href="/dashboard/records" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Records
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ConnectWallet onConnect={handleConnect} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-semibold mb-4">Land Survey Map</h2>
          
          {mapLoaded ? (
            <div className="h-[600px] rounded-lg border-4 border-gray-200 overflow-hidden">
              <MapWithNoSSR />
            </div>
          ) : (
            <div className="h-[600px] rounded-lg border-4 border-gray-200 flex items-center justify-center">
              <div className="text-gray-500">Loading map...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
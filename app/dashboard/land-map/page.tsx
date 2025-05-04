'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Sidebar } from '../../components/Sidebar'
import { Header } from '../../components/Header'

// Dynamically import Map to avoid SSR issues with Leaflet
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
  _id: string;
  surveyNumber: string;
  ownerName: string;
  location: { latitude: number; longitude: number };
  area: number;
  status: string;
}

export default function LandMapPage() {
  const [landRecords, setLandRecords] = useState<LandRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLandRecords = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/land-records')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch records: ${response.statusText}`)
        }

        const data = await response.json()
        // Only show verified records on the map
        const verifiedRecords = data.records?.filter(
          (record: LandRecord) => record.status === 'Verified'
        ) || []
        
        setLandRecords(verifiedRecords)
      } catch (err) {
        console.error('Error fetching land records:', err)
        setError('Failed to load land records. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLandRecords()

    // Set up real-time updates every 30 seconds
    const intervalId = setInterval(fetchLandRecords, 30000)
    
    return () => clearInterval(intervalId)
  }, [])

  // Convert land records to map markers
  const markers = landRecords.map(record => ({
    position: [
      record.location?.latitude || 0,
      record.location?.longitude || 0
    ] as [number, number],
    title: `Land #${record.surveyNumber}`,
    surveyNumber: record.surveyNumber,
    owner: record.ownerName,
    area: `${record.area} sq.m`
  }))

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Land Map" />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Land Properties Map</h1>
            <p className="text-gray-600 mb-6">
              This map shows all verified land properties registered on the blockchain.
            </p>

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

            <div className="h-[600px] rounded-lg border-4 border-gray-200 overflow-hidden">
              <MapWithNoSSR markers={markers} zoom={12} />
            </div>

            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-3">Map Legend</h2>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full mr-2"></div>
                  <span>Verified Land Property</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Click on any marker to view more details about the land property.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 
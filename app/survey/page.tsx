'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamically import the Map component with Leaflet CSS
const MapWithNoSSR = dynamic(
  () => import('../components/Map'), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-[600px] rounded-lg border-4 border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
)

export default function SurveyPage() {
  const searchParams = useSearchParams()
  const [mapLoaded, setMapLoaded] = useState(false)
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]) // Default to Bangalore
  const [landRecords, setLandRecords] = useState([])

  useEffect(() => {
    // Get lat and lng from URL query parameters
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    
    if (lat && lng) {
      try {
        const latNum = parseFloat(lat)
        const lngNum = parseFloat(lng)
        if (!isNaN(latNum) && !isNaN(lngNum)) {
          setCenter([latNum, lngNum])
        }
      } catch (error) {
        console.error('Error parsing coordinates:', error)
      }
    }
    
    // Set map as loaded
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
    
    fetchLandRecords()
  }, [searchParams])

  // Convert land records to map markers
  const markers = landRecords.map((record: any) => ({
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold">LandChain</Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </Link>
                <Link href="/survey" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Survey Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-semibold mb-4">Land Survey Map</h2>
          <p className="text-gray-600 mb-4">
            Viewing map at coordinates: {center[0].toFixed(4)}, {center[1].toFixed(4)}
          </p>
          
          {mapLoaded ? (
            <div className="h-[600px] rounded-lg border-4 border-gray-200 overflow-hidden">
              <MapWithNoSSR center={center} markers={markers} zoom={14} />
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
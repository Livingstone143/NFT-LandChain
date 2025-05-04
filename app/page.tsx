'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ConnectWallet from './components/ConnectWallet'
import Link from 'next/link'

interface LandRecord {
  _id: string;
  surveyNumber: string;
  ownerName: string;
  ownerAddress: string;
  area: number;
  location: { latitude: number; longitude: number };
  value: number;
  status: string;
  deedImage?: string;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [landRecords, setLandRecords] = useState<LandRecord[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check localStorage for wallet connection on first render
    const checkConnection = () => {
      if (typeof window !== 'undefined') {
        const walletAddress = localStorage.getItem('walletAddress')
        if (walletAddress) {
          setIsConnected(true)
          // Only redirect if we've confirmed there is a connected wallet
          router.push('/dashboard')
        }
        setIsLoading(false)
      }
    }
    
    checkConnection()
    
    // Fetch recent land records for public view
    const fetchRecentRecords = async () => {
      try {
        const response = await fetch('/api/land-records')
        if (response.ok) {
          const data = await response.json()
          // Show only verified records on the homepage
          const verifiedRecords = data.records?.filter(
            (record: LandRecord) => record.status === 'Verified'
          ) || []
          // Sort by newest first and take first 6
          const recentRecords = verifiedRecords.slice(0, 6)
          setLandRecords(recentRecords)
        }
      } catch (error) {
        console.error('Error fetching land records:', error)
      }
    }
    
    fetchRecentRecords()
  }, [router])

  // Only redirect to dashboard after a new connection is established
  const handleConnect = (address: string) => {
    setIsConnected(true)
    router.push('/dashboard')
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">
            Welcome to LandChain
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Secure and transparent land record management powered by blockchain technology
          </p>
          
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                To access the dashboard and manage your land records, please connect your Ethereum wallet.
              </p>
              <div className="flex justify-center">
                <ConnectWallet onConnect={handleConnect} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                title="Secure"
                description="Your land records are secured by blockchain technology"
              />
              <FeatureCard
                title="Transparent"
                description="All transactions are publicly verifiable on the blockchain"
              />
              <FeatureCard
                title="Efficient"
                description="Quick and easy land record management"
              />
            </div>
            
            {/* Recent Land Records */}
            <div className="mt-16">
              <h2 className="text-3xl font-semibold mb-8 text-center">Recent Land Records</h2>
              
              {landRecords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {landRecords.map((record) => (
                    <div key={record._id} className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="font-semibold text-lg mb-2">Survey #{record.surveyNumber}</h3>
                      <p className="text-gray-600 mb-1"><span className="font-medium">Owner:</span> {record.ownerName}</p>
                      <p className="text-gray-600 mb-1"><span className="font-medium">Area:</span> {record.area} sq.m</p>
                      <p className="text-gray-600 mb-1"><span className="font-medium">Value:</span> {record.value} ETH</p>
                      <div className="mt-4">
                        <Link 
                          href={`/survey?lat=${record.location.latitude}&lng=${record.location.longitude}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View on Map →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>No verified land records available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
} 
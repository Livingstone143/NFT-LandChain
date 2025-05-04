'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface LandRecord {
  _id: string
  surveyNumber: string
  location: { latitude: number; longitude: number }
  area: number
  value: number
  ownerAddress: string
  status: 'Verified' | 'Pending' | 'PendingTransfer'
  lastUpdated: string
  ownerName: string
  ownerPhone: string
  deedImage?: string
  description?: string
  previousOwners?: Array<{
    address: string;
    transferDate: string;
    transactionHash: string;
  }>;
  transferRequest?: {
    newOwnerAddress: string;
    requestedAt: string;
    status: 'Pending' | 'Completed' | 'Rejected';
    reason?: string;
  };
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [records, setRecords] = useState<LandRecord[]>([])
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)
  const [newLandRecord, setNewLandRecord] = useState({
    surveyNumber: '',
    ownerName: '',
    ownerAddress: '',
    ownerPhone: '',
    latitude: '',
    longitude: '',
    area: '',
    value: '',
    deedImage: '',
    description: ''
  })
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would be an API call to verify credentials
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      fetchRecords()
    } else {
      alert('Invalid credentials')
    }
  }

  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    
    if (useMockData) {
      // Use mock data if database connection fails
      setRecords(getMockRecords())
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/land-records')
      const data = await response.json()
      // Ensure records is always initialized as an array
      setRecords(data.records || [])
      
      // Fetch notifications when authenticated
      if (isAuthenticated) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to fetch records:', error)
      // Initialize with empty array on error
      setRecords([])
      setError('Failed to connect to database. Check your connection or use mock data.')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setNotificationCount(data.notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }

  const handleVerify = async (id: string) => {
    if (useMockData) {
      // Update mock data locally
      setRecords(records.map(record => 
        record._id === id ? { ...record, status: 'Verified' } : record
      ));
      return;
    }

    try {
      await fetch('/api/land-records', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: 'Verified',
        }),
      })
      fetchRecords()
    } catch (error) {
      console.error('Failed to verify record:', error)
    }
  }

  const handleApproveTransfer = async (record: LandRecord) => {
    if (!record.transferRequest?.newOwnerAddress) {
      alert('No wallet address provided for transfer');
      return;
    }

    if (!confirm(`Are you sure you want to transfer this land record to ${record.transferRequest.newOwnerAddress}?`)) {
      return;
    }

    if (useMockData) {
      // Update mock data locally
      setRecords(records.map(r => 
        r._id === record._id ? {
          ...r,
          status: 'Verified',
          ownerAddress: r.transferRequest.newOwnerAddress,
          previousOwners: [
            ...(r.previousOwners || []),
            {
              address: r.ownerAddress,
              transferDate: new Date().toISOString(),
              transactionHash: 'MOCK_TX_' + Date.now()
            }
          ],
          transferRequest: {
            ...r.transferRequest,
            status: 'Completed'
          }
        } : r
      ));
      alert(`Successfully transferred record to ${record.transferRequest.newOwnerAddress}`);
      return;
    }
    
    try {
      // Use a simpler database-only approach without blockchain
      const response = await fetch('/api/land-records', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: record._id,
          status: 'Verified',
          ownerAddress: record.transferRequest.newOwnerAddress,
          previousOwners: [
            ...(record.previousOwners || []),
            {
              address: record.ownerAddress,
              transferDate: new Date(),
              transactionHash: 'DB_TRANSFER_' + Date.now() // Database-only identifier
            }
          ],
          transferRequest: {
            ...record.transferRequest,
            status: 'Completed'
          }
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }
      
      alert(`Successfully transferred record to ${record.transferRequest.newOwnerAddress}`);
      fetchRecords();
    } catch (error) {
      console.error('Failed to transfer record:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transfer failed. Please try again.';
      alert(`Transfer failed: ${errorMessage}`);
    }
  }

  const handleRejectTransfer = async (id: string) => {
    if (useMockData) {
      // Update mock data locally
      setRecords(records.map(record => 
        record._id === id ? { 
          ...record, 
          status: 'Verified',
          transferRequest: { 
            ...record.transferRequest, 
            status: 'Rejected' 
          } 
        } : record
      ));
      return;
    }

    try {
      await fetch('/api/land-records', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: 'Verified', // Reset to verified
          transferRequest: null, // Clear the transfer request
        }),
      })
      fetchRecords()
    } catch (error) {
      console.error('Failed to reject transfer:', error)
    }
  }

  const handleRegisterLand = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Make sure we have valid coordinates
      const lat = parseFloat(newLandRecord.latitude);
      const lng = parseFloat(newLandRecord.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        alert('Please enter valid latitude and longitude values');
        return;
      }
      
      // Create the request body
      const requestBody = {
        surveyNumber: newLandRecord.surveyNumber,
        ownerName: newLandRecord.ownerName,
        ownerAddress: newLandRecord.ownerAddress,
        ownerPhone: newLandRecord.ownerPhone,
        location: {
          latitude: lat,
          longitude: lng
        },
        area: parseFloat(newLandRecord.area),
        value: parseFloat(newLandRecord.value),
        deedImage: newLandRecord.deedImage || '/deed-images/default-deed.jpg',
        description: newLandRecord.description || '',
      };
      
      if (useMockData) {
        // Add to mock data locally
        const newRecord: LandRecord = {
          _id: 'mock_' + Date.now(),
          surveyNumber: requestBody.surveyNumber,
          ownerName: requestBody.ownerName,
          ownerAddress: requestBody.ownerAddress,
          ownerPhone: requestBody.ownerPhone,
          location: requestBody.location,
          area: requestBody.area,
          value: requestBody.value,
          status: 'Pending',
          lastUpdated: new Date().toISOString(),
          deedImage: requestBody.deedImage,
          description: requestBody.description
        };
        
        setRecords([newRecord, ...records]);
        
        alert('Land record registered successfully (Mock Mode)');
        setNewLandRecord({
          surveyNumber: '',
          ownerName: '',
          ownerAddress: '',
          ownerPhone: '',
          latitude: '',
          longitude: '',
          area: '',
          value: '',
          deedImage: '',
          description: ''
        });
        
        return;
      }
      
      console.log('Sending registration data:', requestBody);
      
      const response = await fetch('/api/land-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      alert('Land record registered successfully');
      setNewLandRecord({
        surveyNumber: '',
        ownerName: '',
        ownerAddress: '',
        ownerPhone: '',
        latitude: '',
        longitude: '',
        area: '',
        value: '',
        deedImage: '',
        description: ''
      });
      
      fetchRecords();
    } catch (error) {
      console.error('Failed to register land:', error);
      if (error instanceof Error) {
        alert(`Registration failed: ${error.message}`);
      } else {
        alert('Registration failed. Please try again.');
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewLandRecord({
      ...newLandRecord,
      [name]: value
    })
  }

  // Mock data for development and demo purposes
  const getMockRecords = (): LandRecord[] => {
    return [
      {
        _id: 'mock1',
        surveyNumber: 'MOCK-001',
        ownerName: 'John Doe',
        ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
        ownerPhone: '+1 123-456-7890',
        location: { latitude: 12.9716, longitude: 77.5946 },
        area: 5000,
        value: 5,
        status: 'Pending',
        lastUpdated: new Date().toISOString(),
        deedImage: '/deed-images/default-deed.jpg',
        description: 'Mock land record for demonstration'
      },
      {
        _id: 'mock2',
        surveyNumber: 'MOCK-002',
        ownerName: 'Jane Smith',
        ownerAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        ownerPhone: '+1 234-567-8901',
        location: { latitude: 12.9815, longitude: 77.6073 },
        area: 7500,
        value: 7.5,
        status: 'Verified',
        lastUpdated: new Date().toISOString(),
        deedImage: '/deed-images/default-deed.jpg',
        description: 'Verified mock land record'
      },
      {
        _id: 'mock3',
        surveyNumber: 'MOCK-003',
        ownerName: 'Alice Johnson',
        ownerAddress: '0x2345678901abcdef2345678901abcdef23456789',
        ownerPhone: '+1 345-678-9012',
        location: { latitude: 12.9352, longitude: 77.6245 },
        area: 3200,
        value: 4.2,
        status: 'PendingTransfer',
        lastUpdated: new Date().toISOString(),
        deedImage: '/deed-images/default-deed.jpg',
        description: 'Mock record awaiting transfer approval',
        transferRequest: {
          newOwnerAddress: '0x3456789012abcdef3456789012abcdef34567890',
          requestedAt: new Date().toISOString(),
          status: 'Pending'
        }
      }
    ];
  }

  // Toggle mock data mode
  const toggleMockData = () => {
    setUseMockData(!useMockData);
    if (!useMockData) {
      setRecords(getMockRecords());
      setError(null);
    } else {
      fetchRecords();
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username (admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Filter records based on active tab
  const filteredRecords = records.filter(record => {
    if (activeTab === 'pending') return record.status === 'Pending'
    if (activeTab === 'transfers') return record.status === 'PendingTransfer'
    if (activeTab === 'verified') return record.status === 'Verified'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">LandChain Administration</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center mr-4">
                <input
                  id="mock-data-toggle"
                  type="checkbox"
                  checked={useMockData}
                  onChange={toggleMockData}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="mock-data-toggle" className="ml-2 block text-sm text-gray-900">
                  Use Mock Data
                </label>
              </div>
              <div className="relative">
                <button 
                  className="text-gray-600 hover:text-gray-800"
                  onClick={fetchNotifications}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>

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
                <div className="ml-auto">
                  <button
                    onClick={() => fetchRecords()}
                    className="text-sm text-red-700 hover:text-red-800 font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {/* Tabs for different sections */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('pending')}
                className={`${
                  activeTab === 'pending'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Pending Verification
              </button>
              <button
                onClick={() => setActiveTab('transfers')}
                className={`${
                  activeTab === 'transfers'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Pending Transfers
              </button>
              <button
                onClick={() => setActiveTab('verified')}
                className={`${
                  activeTab === 'verified'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Verified Records
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`${
                  activeTab === 'register'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Register New Land
              </button>
            </nav>
          </div>

          {/* Register new land form */}
          {activeTab === 'register' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Register New Land Record</h3>
              <form onSubmit={handleRegisterLand} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="surveyNumber" className="block text-sm font-medium text-gray-700">Survey Number</label>
                    <input
                      type="text"
                      id="surveyNumber"
                      name="surveyNumber"
                      required
                      value={newLandRecord.surveyNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">Owner Name</label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      required
                      value={newLandRecord.ownerName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="ownerAddress" className="block text-sm font-medium text-gray-700">Owner Wallet Address</label>
                    <input
                      type="text"
                      id="ownerAddress"
                      name="ownerAddress"
                      required
                      value={newLandRecord.ownerAddress}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-700">Owner Phone</label>
                    <input
                      type="text"
                      id="ownerPhone"
                      name="ownerPhone"
                      required
                      value={newLandRecord.ownerPhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="text"
                      id="latitude"
                      name="latitude"
                      required
                      value={newLandRecord.latitude}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="text"
                      id="longitude"
                      name="longitude"
                      required
                      value={newLandRecord.longitude}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-gray-700">Area (in sq. meters)</label>
                    <input
                      type="number"
                      id="area"
                      name="area"
                      required
                      value={newLandRecord.area}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value (in ETH)</label>
                    <input
                      type="number"
                      id="value"
                      name="value"
                      required
                      value={newLandRecord.value}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="deedImage" className="block text-sm font-medium text-gray-700">Deed Image URL</label>
                    <input
                      type="text"
                      id="deedImage"
                      name="deedImage"
                      value={newLandRecord.deedImage}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={newLandRecord.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Register Land
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Records List */}
          {activeTab !== 'register' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredRecords && filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <li key={record._id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              Survey Number: {record.surveyNumber}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Location: {typeof record.location === 'object' 
                                ? `${record.location.latitude}, ${record.location.longitude}` 
                                : JSON.stringify(record.location)}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Area: {record.area} | Value: {record.value} ETH
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Owner: {record.ownerAddress}
                            </p>
                            {record.status === 'PendingTransfer' && (
                              <div className="border-t border-gray-200 mt-2 pt-2">
                                <p className="mt-1 text-sm text-gray-500">
                                  <strong>Transfer To:</strong> {record.transferRequest.newOwnerAddress}
                                </p>
                                {record.transferRequest.reason && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    <strong>Reason:</strong> {record.transferRequest.reason}
                                  </p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                  <strong>Requested On:</strong> {new Date(record.transferRequest.requestedAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex">
                            {record.status === 'Pending' && (
                              <button
                                onClick={() => handleVerify(record._id)}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                Verify
                              </button>
                            )}
                            {record.status === 'PendingTransfer' && (
                              <>
                                <button
                                  onClick={() => handleApproveTransfer(record)}
                                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 mr-2"
                                >
                                  Complete Transfer
                                </button>
                                <button
                                  onClick={() => handleRejectTransfer(record._id)}
                                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {record.status === 'Verified' && (
                              <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No {activeTab} records found.
                  </li>
                )}
              </ul>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Pending Land Records:</strong> These records need to be verified before they can be transferred. Verification confirms the legitimacy of the land claim.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Pending Transfers:</strong> These verified records are awaiting approval for ownership transfer. Approving will update the ownership records in the database.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
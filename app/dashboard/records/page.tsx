'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConnectWallet from '../../components/ConnectWallet';

interface LandRecord {
  _id: string;
  surveyNumber: string;
  ownerName: string;
  area: number;
  value: number;
  status: string;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  deedImage: string;
  walletAddress: string;
  transferRequest?: {
    newOwnerAddress: string;
    requestedAt: string;
    status: 'Pending' | 'Completed' | 'Rejected';
    reason?: string;
  };
}

export default function RecordsPage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [landRecords, setLandRecords] = useState<LandRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [showDeedModal, setShowDeedModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LandRecord | null>(null);
  const [transferAddress, setTransferAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferReason, setTransferReason] = useState('');

  useEffect(() => {
    // Check localStorage for wallet connection on first render
    const checkConnection = () => {
      if (typeof window !== 'undefined') {
        const walletAddress = localStorage.getItem('walletAddress');
        if (walletAddress) {
          setIsConnected(true);
          setAddress(walletAddress);
        } else if (!isLoading) {
          // Only redirect if we've finished the initial loading and no wallet is connected
          router.push('/');
        }
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, [router, isLoading]);

  useEffect(() => {
    if (isConnected) {
      fetchLandRecords();
    }
  }, [isConnected]);

  const fetchLandRecords = async () => {
    try {
      setIsLoadingRecords(true);
      const response = await fetch('/api/land-records');
      if (response.ok) {
        const data = await response.json();
        setLandRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching land records:', error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleConnect = (connectedAddress: string) => {
    setIsConnected(true);
    setAddress(connectedAddress);
  };

  const handleViewDeed = (record: LandRecord) => {
    setSelectedRecord(record);
    setShowDeedModal(true);
  };

  const handleTransfer = (record: LandRecord) => {
    if (record.status.toLowerCase() !== 'verified') {
      alert('This land record must be verified by an admin before it can be transferred. Please contact the administrator.');
      return;
    }
    setSelectedRecord(record);
    setShowTransferModal(true);
  };

  const executeTransfer = async () => {
    if (!selectedRecord || !transferAddress) return;
    
    try {
      setIsTransferring(true);
      
      // Validate the record can be transferred
      if (selectedRecord.status.toLowerCase() !== 'verified') {
        throw new Error('Only verified records can be transferred. Please contact the administrator.');
      }

      if (selectedRecord.transferRequest?.status === 'Pending') {
        throw new Error('A transfer request is already pending for this record. Please wait for admin approval.');
      }
      
      // Call the API to request transfer
      const response = await fetch('/api/land-records/request-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId: selectedRecord._id,
          newOwnerAddress: transferAddress,
          transferReason: transferReason
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Transfer request failed');
      }
      
      setIsTransferring(false);
      setShowTransferModal(false);
      setTransferAddress('');
      setTransferReason('');
      
      // Show a more detailed success notification
      alert(`IMPORTANT: Your transfer request has been submitted but NOT completed yet.\n\nAn administrator must review and approve your transfer request before ownership of ${selectedRecord.surveyNumber} will be transferred to ${transferAddress}.\n\nYou can check the status of your request in your dashboard.`);
      
      // Refresh the records list
      fetchLandRecords();
    } catch (error) {
      console.error('Transfer request failed:', error);
      setIsTransferring(false);
      alert(error instanceof Error ? error.message : 'Transfer request failed. Please try again.');
    }
  };

  // Don't show anything while checking connection status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Verified</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'pendingtransfer':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Pending Transfer</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

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
                <a href="/dashboard/survey" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Survey Mapping
                </a>
                <a href="/dashboard/records" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900">Land Records</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">A list of all land records in the system.</p>
              </div>
              <button 
                onClick={() => fetchLandRecords()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Refresh
              </button>
            </div>
            
            {/* Information banner */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mx-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Important:</strong> Land records must be verified by an administrator before they can be transferred. After requesting a transfer, an administrator will review and approve the transfer on the blockchain.
                  </p>
                </div>
              </div>
            </div>
            
            {isLoadingRecords ? (
              <div className="text-center py-10">
                <div className="text-gray-500">Loading records...</div>
              </div>
            ) : landRecords.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No land records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Survey Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area (sqm)
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value (ETH)
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {landRecords.map((record) => (
                      <tr key={record._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.surveyNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.ownerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.area}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getStatusBadge(record.status)}
                          {record.status.toLowerCase() === 'pendingtransfer' && (
                            <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-md">
                              <p className="text-sm text-orange-700 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Transfer Pending Approval
                              </p>
                              <p className="text-xs text-orange-600 mt-1">
                                This record is awaiting approval from an administrator to complete the transfer.
                              </p>
                              {record.transferRequest?.newOwnerAddress && (
                                <p className="text-xs text-orange-600 mt-1">
                                  New Owner: {record.transferRequest.newOwnerAddress}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            onClick={() => handleViewDeed(record)}
                          >
                            View Deed
                          </button>
                          
                          {record.status.toLowerCase() === 'verified' && (
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => handleTransfer(record)}
                              title="Request transfer approval for this land record"
                            >
                              Request Transfer
                            </button>
                          )}
                          
                          {record.status.toLowerCase() === 'pendingtransfer' && (
                            <button 
                              className="text-orange-600 hover:text-orange-900"
                              onClick={() => alert(`Transfer is pending approval by an administrator.\nRequested on: ${new Date(record.transferRequest?.requestedAt || '').toLocaleString()}\nTransfer to: ${record.transferRequest?.newOwnerAddress || 'Unknown'}`)}
                              title="Check the status of this transfer request"
                            >
                              Check Status
                            </button>
                          )}
                          
                          {record.status.toLowerCase() === 'pending' && (
                            <button 
                              className="text-yellow-600 hover:text-yellow-900 cursor-default"
                              title="This record is pending verification by an administrator"
                              disabled
                            >
                              Awaiting Verification
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <p className="mt-1 text-sm text-gray-500">
                            Location: {typeof record.location === 'object' 
                              ? `${record.location.latitude}, ${record.location.longitude}` 
                              : record.location}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Deed Image Modal */}
      {showDeedModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Deed for {selectedRecord.surveyNumber}</h3>
              <button 
                onClick={() => setShowDeedModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <img 
                src={selectedRecord.deedImage || '/deed-images/default-deed.jpg'} 
                alt={`Deed for ${selectedRecord.surveyNumber}`}
                className="w-full h-auto rounded-md border border-gray-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <p><strong>Survey Number:</strong> {selectedRecord.surveyNumber}</p>
                <p><strong>Area:</strong> {selectedRecord.area} sq. m</p>
              </div>
              <div>
                <p><strong>Value:</strong> {selectedRecord.value} ETH</p>
                <p><strong>Status:</strong> {selectedRecord.status}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Current Owner:</strong> {selectedRecord.walletAddress || 'Unknown'}
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowDeedModal(false);
                  router.push(`/dashboard/survey?lat=${selectedRecord.location.latitude}&lng=${selectedRecord.location.longitude}`);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                View on Map
              </button>
              <button
                onClick={() => {
                  setShowDeedModal(false);
                  if (selectedRecord.status.toLowerCase() === 'verified') {
                    handleTransfer(selectedRecord);
                  } else {
                    alert('This land record must be verified by an admin before it can be transferred.');
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedRecord.status.toLowerCase() === 'verified' 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={selectedRecord.status.toLowerCase() !== 'verified'}
              >
                Request Transfer Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Request Transfer for {selectedRecord.surveyNumber}</h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Current Owner: {selectedRecord.walletAddress || 'Unknown'}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Owner Address
              </label>
              <input
                type="text"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                placeholder="0x..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Transfer (optional)
              </label>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Why are you transferring this land?"
                rows={3}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={executeTransfer}
                disabled={!transferAddress || isTransferring}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {isTransferring ? 'Processing...' : 'Request Transfer Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
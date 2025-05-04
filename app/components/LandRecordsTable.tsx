'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';

interface LandRecord {
  _id: string;
  tokenId: string;
  location: { latitude: number; longitude: number };
  area: string | number;
  value: string | number;
  status: 'Verified' | 'Pending' | 'PendingTransfer';
  lastUpdated: string;
  deedImage: string;
  ownerAddress: string;
  surveyNumber: string;
  transferRequest?: {
    newOwnerAddress: string;
    requestedAt: string;
    status: 'Pending' | 'Completed' | 'Rejected';
  };
}

interface LandRecordsTableProps {
  records?: LandRecord[];
  onDataChange?: () => void;
}

export function LandRecordsTable({ 
  records = [], 
  onDataChange 
}: LandRecordsTableProps) {
  const router = useRouter();
  const [showDeedModal, setShowDeedModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LandRecord | null>(null);
  const [transferAddress, setTransferAddress] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  
  // Use mock data only if no records are provided
  const displayRecords = records.length > 0 ? records : [
    {
      _id: '1',
      tokenId: 'NFT-001',
      surveyNumber: 'SRV001',
      location: { latitude: 37.7749, longitude: -122.4194 }, // San Francisco coordinates
      area: '2.5 acres',
      value: '45.5 ETH',
      status: 'Verified',
      lastUpdated: '2023-04-15',
      deedImage: '/deed-images/deed1.jpg',
      ownerAddress: '0x1234...5678'
    },
    {
      _id: '2',
      tokenId: 'NFT-002',
      surveyNumber: 'SRV002',
      location: { latitude: 40.7128, longitude: -74.0060 }, // New York coordinates
      area: '1.8 acres',
      value: '32.2 ETH',
      status: 'Pending',
      lastUpdated: '2023-04-10',
      deedImage: '/deed-images/deed2.jpg',
      ownerAddress: '0x2345...6789'
    },
    {
      _id: '3',
      tokenId: 'NFT-003',
      surveyNumber: 'SRV003',
      location: { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles coordinates
      area: '3.2 acres',
      value: '58.7 ETH',
      status: 'Verified',
      lastUpdated: '2023-04-05',
      deedImage: '/deed-images/deed3.jpg',
      ownerAddress: '0x3456...7890'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'PendingTransfer':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Pending Transfer</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const handleViewDeed = (record: LandRecord) => {
    setSelectedRecord(record);
    setShowDeedModal(true);
  };

  const handleTransfer = (record: LandRecord) => {
    if (record.status !== 'Verified') {
      alert('This land record must be verified by an admin before it can be transferred. Please contact the administrator.');
      return;
    }
    setSelectedRecord(record);
    setShowTransferModal(true);
  };

  const handleViewMap = (record: LandRecord) => {
    if (typeof record.location === 'object' && 
        record.location.latitude !== undefined && 
        record.location.longitude !== undefined) {
      // Navigate to survey page with coordinates
      router.push(`/survey?lat=${record.location.latitude}&lng=${record.location.longitude}`);
    } else {
      alert("Location coordinates not available for this land record.");
    }
  };

  const executeTransfer = async () => {
    if (!selectedRecord) return;
    
    if (!transferAddress.trim()) {
      alert("Please enter a valid wallet address");
      return;
    }
    
    try {
      setIsTransferring(true);
      const response = await fetch('/api/land-records/request-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId: selectedRecord._id,
          newOwnerAddress: transferAddress
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Transfer request submitted successfully!");
        setShowTransferModal(false);
        setTransferAddress('');
        setTransferReason('');
        // Call onDataChange to refresh data
        if (onDataChange) onDataChange();
      } else {
        throw new Error(data.message || 'Failed to submit transfer request');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert(error instanceof Error ? error.message : "Failed to submit transfer request");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <>
      <div className="land-records-table">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Land Records</h3>
          <p className="text-sm text-gray-500">Manage your tokenized land assets</p>
        </div>
        
        {/* Alert about transfer process */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
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
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NFT ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.tokenId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof record.location === 'object' 
                      ? `${record.location.latitude}, ${record.location.longitude}` 
                      : record.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.area}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                    {record.status === 'PendingTransfer' && (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.lastUpdated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => handleViewDeed(record)}
                    >
                      View Deed
                    </button>
                    
                    {record.status === 'Verified' && (
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => handleTransfer(record)}
                        title="Request transfer approval for this land record"
                      >
                        Request Transfer
                      </button>
                    )}
                    
                    {record.status === 'PendingTransfer' && (
                      <button 
                        className="text-orange-600 hover:text-orange-900 mr-3"
                        onClick={() => alert(`Transfer is pending approval by an administrator.\nRequested on: ${new Date(record.transferRequest?.requestedAt || '').toLocaleString()}\nTransfer to: ${record.transferRequest?.newOwnerAddress || 'Unknown'}`)}
                        title="Check the status of this transfer request"
                      >
                        Check Status
                      </button>
                    )}
                    
                    {record.status === 'Pending' && (
                      <button 
                        className="text-yellow-600 hover:text-yellow-900 mr-3 cursor-default"
                        title="This record is pending verification by an administrator"
                        disabled
                      >
                        Awaiting Verification
                      </button>
                    )}
                    
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleViewMap(record)}
                    >
                      View Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>
              Page 1 of 1
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-2 py-1 border border-gray-300 rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Previous
              </button>
              <button className="px-2 py-1 border border-gray-300 rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deed Image Modal */}
      {showDeedModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Deed for {selectedRecord.tokenId}</h3>
              <button 
                onClick={() => setShowDeedModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <img 
                src={selectedRecord.deedImage} 
                alt={`Deed for ${selectedRecord.tokenId}`}
                className="w-full h-auto rounded-md border border-gray-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <p><strong>NFT ID:</strong> {selectedRecord.tokenId}</p>
                <p><strong>Area:</strong> {selectedRecord.area}</p>
              </div>
              <div>
                <p><strong>Value:</strong> {selectedRecord.value}</p>
                <p><strong>Status:</strong> {selectedRecord.status}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Current Owner:</strong> {selectedRecord.ownerAddress}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowDeedModal(false);
                  if (selectedRecord.status === 'Verified') {
                    handleTransfer(selectedRecord);
                  } else {
                    alert('This land record must be verified by an admin before it can be transferred.');
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedRecord.status === 'Verified' 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={selectedRecord.status !== 'Verified'}
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
              <h3 className="text-lg font-medium">Transfer {selectedRecord.tokenId}</h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Current Owner: {selectedRecord.ownerAddress}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Owner Address
              </label>
              <input
                type="text"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="0x..."
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
    </>
  );
} 
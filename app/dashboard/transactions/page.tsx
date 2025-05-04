'use client'
import React, { useEffect, useState } from 'react'
import { Sidebar } from '../../components/Sidebar'
import { Header } from '../../components/Header'
import { ArrowRight, ArrowDownUp, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

interface Transaction {
  _id: string;
  type: 'transfer' | 'verification' | 'request';
  fromAddress?: string;
  toAddress?: string;
  surveyNumber: string;
  propertyId: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  transactionHash?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // In a real app, this would be a call to a specific transactions API
        const response = await fetch('/api/land-records')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Simulate transactions from land records for demo
        // In a real app, you would have a dedicated transactions API
        const mockTransactions: Transaction[] = []
        
        // Convert land records with previousOwners to transactions
        data.records?.forEach((record: any) => {
          if (record.previousOwners && record.previousOwners.length > 0) {
            record.previousOwners.forEach((prev: any) => {
              mockTransactions.push({
                _id: `${record._id}-${prev.transferDate}`,
                type: 'transfer',
                fromAddress: prev.address,
                toAddress: record.ownerAddress,
                surveyNumber: record.surveyNumber,
                propertyId: record._id,
                timestamp: prev.transferDate,
                status: 'completed',
                transactionHash: prev.transactionHash
              })
            })
          }
          
          // Add verification transaction for verified records
          if (record.status === 'Verified') {
            mockTransactions.push({
              _id: `verify-${record._id}`,
              type: 'verification',
              surveyNumber: record.surveyNumber,
              propertyId: record._id,
              timestamp: record.updatedAt || record.createdAt,
              status: 'completed'
            })
          }
          
          // Add pending transfer requests
          if (record.status === 'PendingTransfer' && record.transferRequest) {
            mockTransactions.push({
              _id: `request-${record._id}`,
              type: 'request',
              fromAddress: record.ownerAddress,
              toAddress: record.transferRequest.newOwnerAddress,
              surveyNumber: record.surveyNumber,
              propertyId: record._id,
              timestamp: record.transferRequest.requestedAt,
              status: 'pending'
            })
          }
        })
        
        // Sort by timestamp (newest first)
        mockTransactions.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        
        setTransactions(mockTransactions)
      } catch (err) {
        console.error('Error fetching transactions:', err)
        setError('Failed to load transactions. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()

    // Setup real-time updates every 30 seconds
    const intervalId = setInterval(fetchTransactions, 30000)
    
    return () => clearInterval(intervalId)
  }, [])

  // Function to get appropriate icon for transaction type
  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock className="h-5 w-5 text-yellow-500" />
    if (status === 'failed') return <AlertTriangle className="h-5 w-5 text-red-500" />
    
    switch(type) {
      case 'transfer':
        return <ArrowRight className="h-5 w-5 text-green-500" />
      case 'verification':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />
      case 'request':
        return <ArrowDownUp className="h-5 w-5 text-purple-500" />
      default:
        return <ArrowRight className="h-5 w-5 text-gray-500" />
    }
  }

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '-'
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Transactions" />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Transaction History</h1>
              <div className="flex space-x-2">
                <select 
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                  defaultValue="all"
                >
                  <option value="all">All Types</option>
                  <option value="transfer">Transfers</option>
                  <option value="verification">Verifications</option>
                  <option value="request">Requests</option>
                </select>
                <select 
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                  defaultValue="all"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

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

            {!isLoading && !error && transactions.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}

            {!isLoading && !error && transactions.length > 0 && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Survey Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTransactionIcon(tx.type, tx.status)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {tx.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.surveyNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.fromAddress ? formatAddress(tx.fromAddress) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.toAddress ? formatAddress(tx.toAddress) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Previous
                    </a>
                    <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Next
                    </a>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                        <span className="font-medium">{transactions.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                        <a href="#" aria-current="page" className="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                          1
                        </a>
                        <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 
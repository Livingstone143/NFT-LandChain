import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { ethers } from 'ethers'
import mongoose from 'mongoose'

export async function POST(request: Request) {
  try {
    const { recordId, newOwnerAddress, transferReason } = await request.json()

    if (!recordId || !newOwnerAddress) {
      return NextResponse.json(
        { error: 'Record ID and new owner address are required' },
        { status: 400 }
      )
    }

    // Validate Ethereum address format
    if (!ethers.utils.isAddress(newOwnerAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    try {
      const { db } = await connectToDatabase()
      
      // Handle MongoDB ObjectId if needed
      const query = typeof recordId === 'string' && recordId.length === 24 
        ? { _id: new mongoose.Types.ObjectId(recordId) } 
        : { _id: recordId };
      
      const record = await db.collection('landrecords').findOne(query)

      if (!record) {
        return NextResponse.json(
          { error: 'Land record not found' },
          { status: 404 }
        )
      }

      if (record.status !== 'Verified') {
        return NextResponse.json(
          { error: 'Only verified records can be transferred' },
          { status: 400 }
        )
      }

      // Check if there's already a pending transfer
      if (record.transferRequest && record.transferRequest.status === 'Pending') {
        return NextResponse.json(
          { error: 'A transfer request is already pending for this record' },
          { status: 400 }
        )
      }

      // Create a transfer request with detailed information
      const transferRequest = {
        newOwnerAddress,
        requestedAt: new Date(),
        requestedBy: record.ownerAddress,
        reason: transferReason || 'Not specified',
        status: 'Pending',
        history: [{
          status: 'Requested',
          timestamp: new Date(),
          note: `Transfer requested from ${record.ownerAddress} to ${newOwnerAddress}`
        }]
      };

      const result = await db.collection('landrecords').updateOne(
        query,
        {
          $set: {
            status: 'PendingTransfer',
            transferRequest,
            updatedAt: new Date()
          }
        }
      )

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { error: 'Failed to update land record' },
          { status: 500 }
        )
      }

      // Add entry to admin notifications collection
      await db.collection('adminNotifications').insertOne({
        type: 'TransferRequest',
        recordId: recordId,
        surveyNumber: record.surveyNumber,
        fromOwner: record.ownerAddress,
        toOwner: newOwnerAddress,
        timestamp: new Date(),
        read: false,
        message: `Transfer request for survey number ${record.surveyNumber} is pending approval`
      });

      return NextResponse.json({ 
        success: true,
        message: 'Transfer request submitted successfully. An admin will review your request.',
        requestId: recordId
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error requesting transfer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
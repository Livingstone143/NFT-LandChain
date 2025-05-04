import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import LandRecord from '../../../models/LandRecord'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recordId, newWalletAddress } = body

    // Validation
    if (!recordId || !newWalletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find the record
    const record = await LandRecord.findById(recordId)
    
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }

    // Store the previous owner
    const previousOwner = {
      address: record.walletAddress,
      transferDate: new Date(),
      transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...` // Mock transaction hash
    }

    // Update the record
    record.previousOwners.push(previousOwner)
    record.walletAddress = newWalletAddress
    record.updatedAt = new Date()
    
    await record.save()

    return NextResponse.json(
      { 
        success: true, 
        record,
        message: `Successfully transferred land record to ${newWalletAddress}`
      }
    )
  } catch (error) {
    console.error('Error transferring land record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to transfer land record' },
      { status: 500 }
    )
  }
} 
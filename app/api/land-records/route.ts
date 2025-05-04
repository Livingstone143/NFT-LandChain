import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'
import { ethers } from 'ethers'

// Mock data for when MongoDB is unavailable
const MOCK_RECORDS = [
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
    deedImage: '/deed-images/default-deed.jpg',
    description: 'Mock record awaiting transfer approval',
    transferRequest: {
      newOwnerAddress: '0x3456789012abcdef3456789012abcdef34567890',
      requestedAt: new Date(),
      status: 'Pending'
    }
  }
];

// Environment check
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

export async function GET() {
  // Use mock data if explicitly set by environment or during development without proper DB config
  if (USE_MOCK_DATA || IS_DEVELOPMENT) {
    try {
      // Try to connect to database first
      const dbConnection = await connectToDatabase();
      
      // If we get here, DB connection works, so use real data
      const records = await dbConnection.db.collection('landrecords').find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ success: true, records });
    } catch (dbError) {
      // Log the error but don't fail - use mock data instead
      console.warn('Database connection failed, using mock data:', dbError);
      return NextResponse.json({ 
        success: true, 
        records: MOCK_RECORDS,
        _isMockData: true,
        _dbError: process.env.NODE_ENV === 'development' ? dbError.toString() : undefined
      });
    }
  }
  
  // Standard implementation for production
  try {
    const { db } = await connectToDatabase();
    const records = await db.collection('landrecords').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Error fetching land records:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch land records',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received registration data:', body);
    
    const {
      surveyNumber,
      ownerName,
      ownerAddress,
      ownerPhone,
      area,
      location,
      value,
      deedImage,
      description,
    } = body;

    console.log('Extracted fields:', {
      surveyNumber,
      ownerName,
      ownerAddress,
      ownerPhone,
      area,
      location,
      value,
      deedImage,
      description
    });

    // Validation
    if (!surveyNumber || !ownerName || area === undefined || !location || value === undefined || !ownerAddress) {
      console.log('Missing required fields. Validation failed for:', {
        surveyNumber: !!surveyNumber,
        ownerName: !!ownerName,
        area: area !== undefined,
        location: !!location,
        value: value !== undefined,
        ownerAddress: !!ownerAddress
      });
      
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    try {
      if (!ethers.utils.isAddress(ownerAddress)) {
        return NextResponse.json(
          { success: false, error: 'Invalid Ethereum wallet address format' },
          { status: 400 }
        );
      }
    } catch (ethersError) {
      console.error('Error validating address:', ethersError);
      // Continue without address validation if ethers fails
    }

    // Mock data mode - just pretend we added it
    if (USE_MOCK_DATA || IS_DEVELOPMENT) {
      try {
        await connectToDatabase();
        // If we get here, DB connection works, so proceed with normal flow
      } catch (dbError) {
        // DB connection failed, return mock success
        console.warn('Database connection failed, using mock response:', dbError);
        
        const mockId = 'mock_' + Date.now();
        const newRecord = {
          _id: mockId,
          surveyNumber,
          ownerName,
          ownerAddress,
          ownerPhone,
          area: Number(area),
          location,
          value: Number(value),
          deedImage: deedImage || 'default-deed.jpg',
          description: description || '',
          status: 'Pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return NextResponse.json(
          { 
            success: true, 
            record: newRecord,
            _isMockData: true
          },
          { status: 201 }
        );
      }
    }

    try {
      const { db } = await connectToDatabase()

      // Check if survey number already exists
      const existingRecord = await db.collection('landrecords').findOne({ surveyNumber })
      if (existingRecord) {
        return NextResponse.json(
          { success: false, error: 'Survey number already exists' },
          { status: 409 }
        )
      }

      // Create new record
      const newRecord = {
        surveyNumber,
        ownerName,
        ownerAddress,
        ownerPhone,
        area: Number(area),
        location,
        value: Number(value),
        deedImage: deedImage || 'default-deed.jpg', // Default image
        description: description || '',
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await db.collection('landrecords').insertOne(newRecord)
      
      if (!result.insertedId) {
        throw new Error('Failed to insert record')
      }

      // Update wallet's land holdings
      await db.collection('wallets').updateOne(
        { address: ownerAddress },
        { 
          $push: { landRecords: result.insertedId },
          $setOnInsert: { 
            address: ownerAddress,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      // Return the created record with its ID
      return NextResponse.json(
        { 
          success: true, 
          record: { 
            _id: result.insertedId, 
            ...newRecord 
          } 
        },
        { status: 201 }
      )
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Database operation failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating land record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create land record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status, ownerAddress, previousOwners, transferRequest } = body

    console.log('PUT request body:', body);

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mock data mode for when database isn't available
    if (USE_MOCK_DATA || IS_DEVELOPMENT) {
      try {
        await connectToDatabase();
        // DB works, continue with normal flow
      } catch (dbError) {
        console.warn('Database connection failed, using mock update response:', dbError);
        
        // Create a mock updated record
        const mockRecord = {
          _id: id,
          surveyNumber: `MOCK-${id.substring(0, 3)}`,
          ownerName: 'Mock User',
          ownerAddress: ownerAddress || '0x0000000000000000000000000000000000000000',
          ownerPhone: '+1 000-000-0000',
          location: { latitude: 0, longitude: 0 },
          area: 1000,
          value: 1,
          status: status,
          updatedAt: new Date(),
          previousOwners: previousOwners || [],
          transferRequest: transferRequest || null
        };
        
        return NextResponse.json({ 
          success: true, 
          record: mockRecord,
          _isMockData: true
        });
      }
    }

    // Prevent direct transfer status changes from client-side
    if (status === 'PendingTransfer' && !transferRequest) {
      return NextResponse.json(
        { success: false, error: 'Direct transfers are not allowed. Please use the transfer request API.' },
        { status: 403 }
      )
    }

    try {
      const { db } = await connectToDatabase()
      
      // Handle MongoDB ObjectId if needed
      const query = typeof id === 'string' && id.length === 24 
        ? { _id: new mongoose.Types.ObjectId(id) } 
        : { _id: id };

      // Get current record to verify status changes
      const currentRecord = await db.collection('landrecords').findOne(query);
      
      if (!currentRecord) {
        return NextResponse.json(
          { success: false, error: 'Record not found' },
          { status: 404 }
        )
      }
      
      // Only allow admin accounts to change from Verified to PendingTransfer
      // (This check would need actual admin authentication in a real implementation)
      if (currentRecord.status === 'Verified' && status === 'PendingTransfer') {
        // Check if this is an authenticated admin request
        // For now, just ensure the request comes through the proper transfer request API
        if (!transferRequest || !transferRequest.newOwnerAddress) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized status change' },
            { status: 403 }
          )
        }
      }

      // Create update object
      const updateData: any = { 
        status,
        updatedAt: new Date()
      }

      // If newOwnerAddress is provided, add it to the update
      if (ownerAddress) {
        updateData.newOwnerAddress = ownerAddress
      }
      
      const result = await db.collection('landrecords').updateOne(
        query,
        { $set: updateData }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Record not found' },
          { status: 404 }
        )
      }

      // Get the updated record
      const updatedRecord = await db.collection('landrecords').findOne(query)

      // Log status changes for audit purposes
      console.log(`Record ${id} status changed from ${currentRecord.status} to ${status} at ${new Date()}`);

      return NextResponse.json({ success: true, record: updatedRecord })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Database operation failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating land record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update land record' },
      { status: 500 }
    )
  }
} 
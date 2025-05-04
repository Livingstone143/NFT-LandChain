import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get all notifications, most recent first
    const notifications = await db.collection('adminNotifications')
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      notifications 
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { id, action } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Handle different actions
    if (action === 'markRead') {
      const result = await db.collection('adminNotifications').updateOne(
        { _id: id },
        { $set: { read: true } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Failed to update notification' },
          { status: 500 }
        );
      }
    } else if (action === 'markAllRead') {
      await db.collection('adminNotifications').updateMany(
        { read: false },
        { $set: { read: true } }
      );
    } else if (action === 'delete') {
      const result = await db.collection('adminNotifications').deleteOne({ _id: id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Failed to delete notification' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling notification action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process notification action' },
      { status: 500 }
    );
  }
} 
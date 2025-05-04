import mongoose from 'mongoose'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

// Print a warning instead of throwing during module initialization
if (!MONGODB_URI) {
  console.warn('MONGODB_URI environment variable is not defined. This will cause database operations to fail.')
}

// MongoDB connection cache
let cachedClient: MongoClient | null = null
let cachedDb: any = null

async function connectToDatabase() {
  // Check the cached connection
  if (cachedClient && cachedDb) {
    try {
      // Simple ping to check if connection is still valid
      await cachedDb.command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.warn('Cached database connection is no longer valid, reconnecting...');
      // Fall through to re-establish connection
    }
  }

  // Guard against connection URI missing entirely
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    // Create a new connection
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('landchain'); // Replace with your actual database name

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectToDatabase 
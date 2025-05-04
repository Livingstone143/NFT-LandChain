const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Define the LandRecord schema
const landRecordSchema = new mongoose.Schema({
  surveyNumber: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  ownerAddress: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  area: { type: Number, required: true }, // in square meters
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  deedImage: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  value: { type: Number, required: true }, // in ETH
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
});

const LandRecord = mongoose.model('LandRecord', landRecordSchema);

// Sample land records data
const landRecords = [
  {
    surveyNumber: "SRV001",
    ownerName: "John Doe",
    ownerAddress: "123 Main St, Cityville",
    ownerPhone: "+1234567890",
    area: 1000,
    location: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    deedImage: "deed1.jpg",
    value: 1.5,
    status: "verified"
  },
  {
    surveyNumber: "SRV002",
    ownerName: "Jane Smith",
    ownerAddress: "456 Oak Ave, Townsville",
    ownerPhone: "+1987654321",
    area: 1500,
    location: {
      latitude: 12.9717,
      longitude: 77.5947
    },
    deedImage: "deed2.jpg",
    value: 2.0,
    status: "verified"
  },
  {
    surveyNumber: "SRV003",
    ownerName: "Robert Johnson",
    ownerAddress: "789 Pine Rd, Villageton",
    ownerPhone: "+1122334455",
    area: 2000,
    location: {
      latitude: 12.9718,
      longitude: 77.5948
    },
    deedImage: "deed3.jpg",
    value: 2.5,
    status: "pending"
  }
];

// Create a directory for deed images if it doesn't exist
const deedImagesDir = path.join(process.cwd(), 'public', 'deed-images');
if (!fs.existsSync(deedImagesDir)) {
  fs.mkdirSync(deedImagesDir, { recursive: true });
}

// Function to seed the database
async function seedDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB Atlas...');
    
    // Connect to MongoDB with options for Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('Successfully connected to MongoDB Atlas');

    // Clear existing records
    console.log('Clearing existing land records...');
    await LandRecord.deleteMany({});
    console.log('Successfully cleared existing land records');

    // Insert new records
    console.log('Inserting new land records...');
    await LandRecord.insertMany(landRecords);
    console.log('Successfully seeded land records');

    // Create sample deed images
    console.log('Creating sample deed images...');
    const sampleImage = Buffer.from('Sample image data'); // In a real scenario, you would use actual image files
    landRecords.forEach(record => {
      const imagePath = path.join(deedImagesDir, record.deedImage);
      fs.writeFileSync(imagePath, sampleImage);
      console.log(`Created sample deed image: ${record.deedImage}`);
    });

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    if (error.code === 'ENOTFOUND') {
      console.error('Could not connect to MongoDB Atlas. Please check your internet connection and MongoDB Atlas configuration.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection to MongoDB Atlas was refused. Please check your MongoDB Atlas connection string and network settings.');
    } else {
      console.error('An unexpected error occurred:', error);
    }
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB Atlas');
    }
  }
}

// Run the seed function
seedDatabase(); 
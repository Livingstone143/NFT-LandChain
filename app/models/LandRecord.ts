import mongoose, { Schema } from 'mongoose'

// LandRecord Schema
const LandRecordSchema = new Schema({
  surveyNumber: {
    type: String,
    required: true,
    unique: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  ownerAddress: {
    type: String,
    required: true,
  },
  ownerPhone: {
    type: String,
    required: true,
  },
  area: {
    type: Number,
    required: true,
  }, // in square meters
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  deedImage: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  value: {
    type: Number,
    required: true,
  }, // in ETH
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected', 'PendingTransfer'],
    default: 'Pending',
  },
  walletAddress: {
    type: String
  },
  newWalletAddress: {
    type: String
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  transactionHash: String,
  previousOwners: [{
    address: String,
    transferDate: Date,
    transactionHash: String,
  }],
}, {
  timestamps: true
})

LandRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Create or retrieve the model
const LandRecord = mongoose.models.LandRecord || mongoose.model('LandRecord', LandRecordSchema)

export default LandRecord 
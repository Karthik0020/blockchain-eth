const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Traditional fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  
  // Blockchain-related fields
  blockchainId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  identityHash: {
    type: String,
    unique: true,
    sparse: true
  },
  blockchainRegistered: {
    type: Boolean,
    default: false
  },
  registrationTxHash: {
    type: String,
    sparse: true
  },
  
  // Medical information
  medicalHistory: {
    type: String,
    default: ''
  },
  allergies: {
    type: [String],
    default: []
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update the updatedAt field before saving
patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate blockchain ID
patientSchema.methods.generateBlockchainId = function() {
  if (!this.blockchainId) {
    this.blockchainId = `patient_${this._id.toString()}`;
  }
  return this.blockchainId;
};

module.exports = mongoose.model('Patient', patientSchema);
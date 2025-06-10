const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  // Traditional fields - using String for patientId and doctorId to handle both ObjectId and string references
  patientId: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String
    required: true
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  treatment: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  
  // Blockchain-related fields
  recordHash: {
    type: String,
    unique: true,
    sparse: true
  },
  blockchainStored: {
    type: Boolean,
    default: false
  },
  transactionHash: {
    type: String,
    sparse: true
  },
  blockNumber: {
    type: Number,
    sparse: true
  },
  
  // Record metadata
  recordType: {
    type: String,
    enum: ['diagnosis', 'treatment', 'prescription', 'lab_result', 'imaging', 'surgery', 'consultation'],
    default: 'consultation'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'finalized', 'amended', 'archived'],
    default: 'finalized'
  },
  
  // File attachments (IPFS hashes)
  attachments: [{
    filename: String,
    ipfsHash: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
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
medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate record hash for blockchain
medicalRecordSchema.methods.generateRecordHash = function() {
  const crypto = require('crypto');
  const recordData = {
    patientId: this.patientId.toString(),
    doctorId: this.doctorId.toString(),
    diagnosis: this.diagnosis,
    treatment: this.treatment,
    date: this.date.toISOString(),
    recordType: this.recordType
  };
  
  return crypto.createHash('sha256')
    .update(JSON.stringify(recordData))
    .digest('hex');
};

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
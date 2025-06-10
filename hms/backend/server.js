const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import services
const blockchainService = require('./services/blockchainService');

// Import models
const Patient = require('./models/Patient');
const MedicalRecord = require('./models/MedicalRecord');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB with updated options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms_blockchain')
.then(() => {
  console.log('Connected to MongoDB');
  // Setup blockchain event listeners only if contract is available
  if (process.env.HMS_CONTRACT_ADDRESS) {
    blockchainService.setupEventListeners();
  }
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// In-memory storage for backward compatibility (will be migrated to MongoDB)
let patients = [];
let doctors = [];
let appointments = [];
let medicalRecords = [];
let technicians = [];
let labTests = [];
let surgeries = [];
let admissions = [];
let bills = [];
let medicines = [];
let equipment = [];
let emergencies = [];
let inventory = [];
let rooms = [];

// Helper function to generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Blockchain endpoints with better error handling
app.get('/api/blockchain/stats', async (req, res) => {
  try {
    if (!process.env.HMS_CONTRACT_ADDRESS) {
      return res.json({
        success: false,
        error: 'Contract not deployed',
        stats: {
          totalPatients: 0,
          totalRecords: 0,
          contractAddress: null,
          network: null
        }
      });
    }

    const stats = await blockchainService.getBlockchainStats();
    res.json(stats);
  } catch (error) {
    console.error('Blockchain stats error:', error.message);
    res.json({
      success: false,
      error: error.message,
      stats: {
        totalPatients: 0,
        totalRecords: 0,
        contractAddress: process.env.HMS_CONTRACT_ADDRESS || null,
        network: null
      }
    });
  }
});

app.post('/api/blockchain/verify-record', async (req, res) => {
  try {
    const { recordHash } = req.body;
    if (!process.env.HMS_CONTRACT_ADDRESS) {
      return res.json({ success: false, error: 'Contract not deployed' });
    }
    const result = await blockchainService.verifyRecord(recordHash);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify record' });
  }
});

app.get('/api/blockchain/record/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    if (!process.env.HMS_CONTRACT_ADDRESS) {
      return res.json({ success: false, error: 'Contract not deployed' });
    }
    const result = await blockchainService.getRecordDetails(hash);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get record details' });
  }
});

// Enhanced Patients endpoints with blockchain integration
app.get('/api/patients', async (req, res) => {
  try {
    // Try to get from MongoDB first, fallback to in-memory
    const mongoPatients = await Patient.find({ isActive: true }).sort({ createdAt: -1 });
    if (mongoPatients.length > 0) {
      res.json(mongoPatients);
    } else {
      res.json(patients);
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.json(patients); // Fallback to in-memory
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    // Create patient in MongoDB
    const patientData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };

    let savedPatient;
    try {
      const patient = new Patient(patientData);
      patient.generateBlockchainId();
      savedPatient = await patient.save();

      // Register on blockchain only if contract is available
      if (process.env.HMS_CONTRACT_ADDRESS) {
        const blockchainResult = await blockchainService.registerPatient({
          id: patient.blockchainId,
          name: patient.name,
          email: patient.email,
          phone: patient.phone
        });

        if (blockchainResult.success) {
          patient.blockchainRegistered = true;
          patient.identityHash = blockchainResult.identityHash;
          patient.registrationTxHash = blockchainResult.transactionHash;
          await patient.save();
        }
      }

      res.status(201).json(savedPatient);
    } catch (mongoError) {
      console.error('MongoDB error, using in-memory storage:', mongoError);
      
      // Fallback to in-memory storage
      const patient = {
        id: generateId(),
        ...patientData
      };
      patients.push(patient);
      res.status(201).json(patient);
    }
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    // Try MongoDB first
    const mongoPatient = await Patient.findById(req.params.id);
    if (mongoPatient) {
      res.json(mongoPatient);
      return;
    }

    // Fallback to in-memory
    const patient = patients.find(p => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    // Try MongoDB first
    const mongoPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (mongoPatient) {
      res.json(mongoPatient);
      return;
    }

    // Fallback to in-memory
    const index = patients.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    patients[index] = { ...patients[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(patients[index]);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Enhanced Medical Records endpoints with blockchain integration
app.get('/api/medical-records', async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = { isActive: true };
    
    if (patientId) {
      // Handle both ObjectId and string patientId
      try {
        query.patientId = mongoose.Types.ObjectId.isValid(patientId) ? patientId : patientId;
      } catch (err) {
        query.patientId = patientId;
      }
    }

    // Try MongoDB first
    try {
      const mongoRecords = await MedicalRecord.find(query)
        .populate('patientId', 'name')
        .populate('doctorId', 'name')
        .sort({ createdAt: -1 });

      if (mongoRecords.length > 0) {
        const recordsWithDetails = mongoRecords.map(record => ({
          ...record.toObject(),
          patientName: record.patientId?.name || 'Unknown',
          doctorName: record.doctorId?.name || 'Unknown'
        }));
        res.json(recordsWithDetails);
        return;
      }
    } catch (mongoError) {
      console.error('MongoDB query error:', mongoError);
    }

    // Fallback to in-memory
    let records = medicalRecords;
    if (patientId) {
      records = records.filter(r => r.patientId === patientId);
    }
    
    const recordsWithDetails = records.map(record => {
      const patient = patients.find(p => p.id === record.patientId);
      const doctor = doctors.find(d => d.id === record.doctorId);
      return {
        ...record,
        patientName: patient ? patient.name : 'Unknown',
        doctorName: doctor ? doctor.name : 'Unknown'
      };
    });
    
    res.json(recordsWithDetails);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

app.post('/api/medical-records', async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };

    try {
      // For MongoDB, we need to handle the ID references properly
      let mongoRecordData = { ...recordData };
      
      // Check if patientId and doctorId are valid ObjectIds or need to be found
      if (recordData.patientId && !mongoose.Types.ObjectId.isValid(recordData.patientId)) {
        // Try to find patient by the provided ID in in-memory storage
        const patient = patients.find(p => p.id === recordData.patientId);
        if (patient) {
          // Create a temporary patient in MongoDB if needed
          try {
            const mongoPatient = await Patient.findOne({ name: patient.name, email: patient.email });
            if (mongoPatient) {
              mongoRecordData.patientId = mongoPatient._id;
            } else {
              // Create patient in MongoDB
              const newPatient = new Patient(patient);
              const savedPatient = await newPatient.save();
              mongoRecordData.patientId = savedPatient._id;
            }
          } catch (err) {
            throw new Error('Invalid patient reference');
          }
        }
      }

      if (recordData.doctorId && !mongoose.Types.ObjectId.isValid(recordData.doctorId)) {
        // Try to find doctor by the provided ID in in-memory storage
        const doctor = doctors.find(d => d.id === recordData.doctorId);
        if (doctor) {
          // For now, we'll skip MongoDB storage for records with invalid doctor references
          throw new Error('Invalid doctor reference');
        }
      }

      // Create record in MongoDB
      const medicalRecord = new MedicalRecord(mongoRecordData);
      const savedRecord = await medicalRecord.save();

      // Store hash on blockchain only if contract is available
      if (process.env.HMS_CONTRACT_ADDRESS) {
        const recordForBlockchain = {
          patientId: savedRecord.patientId.toString(),
          diagnosis: savedRecord.diagnosis,
          treatment: savedRecord.treatment,
          date: savedRecord.date,
          type: savedRecord.recordType
        };

        const blockchainResult = await blockchainService.addMedicalRecord(recordForBlockchain);

        if (blockchainResult.success) {
          savedRecord.blockchainStored = true;
          savedRecord.recordHash = blockchainResult.recordHash;
          savedRecord.transactionHash = blockchainResult.transactionHash;
          savedRecord.blockNumber = blockchainResult.blockNumber;
          await savedRecord.save();
        }
      }

      res.status(201).json(savedRecord);
    } catch (mongoError) {
      console.error('MongoDB error, using in-memory storage:', mongoError);
      
      // Fallback to in-memory storage
      const record = {
        id: generateId(),
        ...recordData
      };
      medicalRecords.push(record);
      res.status(201).json(record);
    }
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({ error: 'Failed to create medical record' });
  }
});

// All other existing endpoints remain the same for backward compatibility
// Doctors
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

app.post('/api/doctors', (req, res) => {
  const doctor = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  doctors.push(doctor);
  res.status(201).json(doctor);
});

// Appointments
app.get('/api/appointments', (req, res) => {
  const appointmentsWithDetails = appointments.map(apt => {
    const patient = patients.find(p => p.id === apt.patientId);
    const doctor = doctors.find(d => d.id === apt.doctorId);
    return {
      ...apt,
      patientName: patient ? patient.name : 'Unknown',
      doctorName: doctor ? doctor.name : 'Unknown'
    };
  });
  res.json(appointmentsWithDetails);
});

app.post('/api/appointments', (req, res) => {
  const appointment = {
    id: generateId(),
    ...req.body,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  
  appointments.push(appointment);
  res.status(201).json(appointment);
});

app.put('/api/appointments/:id', (req, res) => {
  const index = appointments.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  appointments[index] = { ...appointments[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(appointments[index]);
});

// Technicians
app.get('/api/technicians', (req, res) => {
  res.json(technicians);
});

app.post('/api/technicians', (req, res) => {
  const technician = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  technicians.push(technician);
  res.status(201).json(technician);
});

app.put('/api/technicians/:id', (req, res) => {
  const index = technicians.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Technician not found' });
  }
  
  technicians[index] = { ...technicians[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(technicians[index]);
});

// Lab Tests
app.get('/api/lab-tests', (req, res) => {
  const { patientId } = req.query;
  let tests = labTests;
  
  if (patientId) {
    tests = tests.filter(t => t.patientId === patientId);
  }
  
  const testsWithDetails = tests.map(test => {
    const patient = patients.find(p => p.id === test.patientId);
    const doctor = doctors.find(d => d.id === test.doctorId);
    const technician = technicians.find(t => t.id === test.technicianId);
    return {
      ...test,
      patientName: patient ? patient.name : 'Unknown',
      doctorName: doctor ? doctor.name : 'Unknown',
      technicianName: technician ? technician.name : 'Unassigned'
    };
  });
  
  res.json(testsWithDetails);
});

app.post('/api/lab-tests', (req, res) => {
  const labTest = {
    id: generateId(),
    ...req.body,
    status: 'ordered',
    createdAt: new Date().toISOString()
  };
  
  labTests.push(labTest);
  res.status(201).json(labTest);
});

app.put('/api/lab-tests/:id', (req, res) => {
  const index = labTests.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lab test not found' });
  }
  
  labTests[index] = { ...labTests[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(labTests[index]);
});

// Surgeries
app.get('/api/surgeries', (req, res) => {
  const surgeriesWithDetails = surgeries.map(surgery => {
    const patient = patients.find(p => p.id === surgery.patientId);
    const doctor = doctors.find(d => d.id === surgery.surgeonId);
    return {
      ...surgery,
      patientName: patient ? patient.name : 'Unknown',
      surgeonName: doctor ? doctor.name : 'Unknown'
    };
  });
  res.json(surgeriesWithDetails);
});

app.post('/api/surgeries', (req, res) => {
  const surgery = {
    id: generateId(),
    ...req.body,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  
  surgeries.push(surgery);
  res.status(201).json(surgery);
});

app.put('/api/surgeries/:id', (req, res) => {
  const index = surgeries.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Surgery not found' });
  }
  
  surgeries[index] = { ...surgeries[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(surgeries[index]);
});

// Admissions
app.get('/api/admissions', (req, res) => {
  const admissionsWithDetails = admissions.map(admission => {
    const patient = patients.find(p => p.id === admission.patientId);
    const doctor = doctors.find(d => d.id === admission.doctorId);
    const room = rooms.find(r => r.id === admission.roomId);
    return {
      ...admission,
      patientName: patient ? patient.name : 'Unknown',
      doctorName: doctor ? doctor.name : 'Unknown',
      roomNumber: room ? room.number : 'Unassigned'
    };
  });
  res.json(admissionsWithDetails);
});

app.post('/api/admissions', (req, res) => {
  const admission = {
    id: generateId(),
    ...req.body,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  admissions.push(admission);
  
  if (admission.roomId) {
    const roomIndex = rooms.findIndex(r => r.id === admission.roomId);
    if (roomIndex !== -1) {
      rooms[roomIndex].status = 'occupied';
    }
  }
  
  res.status(201).json(admission);
});

app.put('/api/admissions/:id', (req, res) => {
  const index = admissions.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Admission not found' });
  }
  
  const oldAdmission = { ...admissions[index] };
  admissions[index] = { ...admissions[index], ...req.body, updatedAt: new Date().toISOString() };
  
  if (req.body.status === 'discharged' && oldAdmission.roomId) {
    const roomIndex = rooms.findIndex(r => r.id === oldAdmission.roomId);
    if (roomIndex !== -1) {
      rooms[roomIndex].status = 'available';
    }
  }
  
  res.json(admissions[index]);
});

// Bills
app.get('/api/bills', (req, res) => {
  const { patientId } = req.query;
  let billList = bills;
  
  if (patientId) {
    billList = billList.filter(b => b.patientId === patientId);
  }
  
  const billsWithDetails = billList.map(bill => {
    const patient = patients.find(p => p.id === bill.patientId);
    return {
      ...bill,
      patientName: patient ? patient.name : 'Unknown'
    };
  });
  
  res.json(billsWithDetails);
});

app.post('/api/bills', (req, res) => {
  const bill = {
    id: generateId(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  bills.push(bill);
  res.status(201).json(bill);
});

app.put('/api/bills/:id', (req, res) => {
  const index = bills.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Bill not found' });
  }
  
  bills[index] = { ...bills[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(bills[index]);
});

// Medicines
app.get('/api/medicines', (req, res) => {
  res.json(medicines);
});

app.post('/api/medicines', (req, res) => {
  const medicine = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  medicines.push(medicine);
  res.status(201).json(medicine);
});

app.put('/api/medicines/:id', (req, res) => {
  const index = medicines.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Medicine not found' });
  }
  
  medicines[index] = { ...medicines[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(medicines[index]);
});

// Equipment
app.get('/api/equipment', (req, res) => {
  res.json(equipment);
});

app.post('/api/equipment', (req, res) => {
  const equipmentItem = {
    id: generateId(),
    ...req.body,
    status: 'available',
    createdAt: new Date().toISOString()
  };
  
  equipment.push(equipmentItem);
  res.status(201).json(equipmentItem);
});

app.put('/api/equipment/:id', (req, res) => {
  const index = equipment.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Equipment not found' });
  }
  
  equipment[index] = { ...equipment[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(equipment[index]);
});

// Emergencies
app.get('/api/emergencies', (req, res) => {
  const emergenciesWithDetails = emergencies.map(emergency => {
    const patient = patients.find(p => p.id === emergency.patientId);
    const doctor = doctors.find(d => d.id === emergency.doctorId);
    return {
      ...emergency,
      patientName: patient ? patient.name : 'Unknown',
      doctorName: doctor ? doctor.name : 'Unassigned'
    };
  });
  res.json(emergenciesWithDetails);
});

app.post('/api/emergencies', (req, res) => {
  const emergency = {
    id: generateId(),
    ...req.body,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  emergencies.push(emergency);
  res.status(201).json(emergency);
});

app.put('/api/emergencies/:id', (req, res) => {
  const index = emergencies.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Emergency not found' });
  }
  
  emergencies[index] = { ...emergencies[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(emergencies[index]);
});

// Inventory
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory', (req, res) => {
  const inventoryItem = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  inventory.push(inventoryItem);
  res.status(201).json(inventoryItem);
});

app.put('/api/inventory/:id', (req, res) => {
  const index = inventory.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Inventory item not found' });
  }
  
  inventory[index] = { ...inventory[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(inventory[index]);
});

// Rooms
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
  const room = {
    id: generateId(),
    ...req.body,
    status: 'available',
    createdAt: new Date().toISOString()
  };
  
  rooms.push(room);
  res.status(201).json(room);
});

app.put('/api/rooms/:id', (req, res) => {
  const index = rooms.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  rooms[index] = { ...rooms[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(rooms[index]);
});

// Dashboard stats with blockchain integration - REPLACE the existing /api/stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    // Get blockchain stats with better error handling
    let blockchainStats = {
      totalRecords: 0,
      totalPatients: 0,
      recentTransactions: []
    };
    
    try {
      if (process.env.HMS_CONTRACT_ADDRESS) {
        const result = await blockchainService.getBlockchainStats();
        if (result.success) {
          blockchainStats = result.stats;
        }
      }
    } catch (error) {
      console.error('Blockchain stats error (non-fatal):', error.message);
    }
    
    // Get MongoDB counts with fallback to in-memory
    let mongoPatients = 0;
    let mongoRecords = 0;
    
    try {
      mongoPatients = await Patient.countDocuments({ isActive: true });
      mongoRecords = await MedicalRecord.countDocuments({ isActive: true });
    } catch (error) {
      console.error('MongoDB stats error (non-fatal):', error.message);
    }
    
    // Use MongoDB counts if available, otherwise use in-memory
    const totalPatients = mongoPatients > 0 ? mongoPatients : patients.length;
    const totalMedicalRecords = mongoRecords > 0 ? mongoRecords : medicalRecords.length;
    
    const stats = {
      totalPatients,
      totalDoctors: doctors.length,
      totalTechnicians: technicians.length,
      totalAppointments: appointments.length,
      totalMedicalRecords,
      totalLabTests: labTests.length,
      totalSurgeries: surgeries.length,
      totalAdmissions: admissions.length,
      totalBills: bills.length,
      totalMedicines: medicines.length,
      totalEquipment: equipment.length,
      totalEmergencies: emergencies.length,
      totalInventoryItems: inventory.length,
      totalRooms: rooms.length,
      
      // Dashboard specific stats
      activeEmergencies: emergencies.filter(e => e.status === 'active').length,
      pendingBills: bills.filter(b => b.status === 'pending').length,
      availableRooms: rooms.filter(r => r.status === 'available').length,
      occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
      
      // Recent activities data for dashboard
      recentAppointments: appointments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(apt => {
          const patient = patients.find(p => p.id === apt.patientId);
          const doctor = doctors.find(d => d.id === apt.doctorId);
          return {
            ...apt,
            patientName: patient ? patient.name : 'Unknown Patient',
            doctorName: doctor ? doctor.name : 'Unknown Doctor'
          };
        }),
      
      recentPatients: patients
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3),
        
      recentRecords: medicalRecords
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map(record => {
          const patient = patients.find(p => p.id === record.patientId);
          const doctor = doctors.find(d => d.id === record.doctorId);
          return {
            ...record,
            patientName: patient ? patient.name : 'Unknown Patient',
            doctorName: doctor ? doctor.name : 'Unknown Doctor'
          };
        }),
      
      // Blockchain stats
      blockchain: {
        totalRecords: blockchainStats.totalRecords || 0,
        totalPatients: blockchainStats.totalPatients || 0,
        recentTransactions: blockchainStats.recentTransactions || [],
        contractAddress: blockchainStats.contractAddress || null,
        network: blockchainStats.network || null
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    
    // Fallback stats in case of complete failure
    const fallbackStats = {
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      totalTechnicians: technicians.length,
      totalAppointments: appointments.length,
      totalMedicalRecords: medicalRecords.length,
      totalLabTests: labTests.length,
      totalSurgeries: surgeries.length,
      totalAdmissions: admissions.length,
      totalBills: bills.length,
      totalMedicines: medicines.length,
      totalEquipment: equipment.length,
      totalEmergencies: emergencies.length,
      totalInventoryItems: inventory.length,
      totalRooms: rooms.length,
      activeEmergencies: 0,
      pendingBills: 0,
      availableRooms: 0,
      occupiedRooms: 0,
      recentAppointments: [],
      recentPatients: [],
      recentRecords: [],
      blockchain: {
        totalRecords: 0,
        totalPatients: 0,
        recentTransactions: []
      }
    };
    
    res.json(fallbackStats);
  }
});

// Search endpoint
app.get('/api/search', (req, res) => {
  const { query, type } = req.query;
  let results = [];
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  const searchTerm = query.toLowerCase();
  
  if (!type || type === 'patients') {
    const patientResults = patients.filter(p => 
      p.name?.toLowerCase().includes(searchTerm) ||
      p.email?.toLowerCase().includes(searchTerm) ||
      p.phone?.includes(searchTerm)
    ).map(p => ({ ...p, type: 'patient' }));
    results = [...results, ...patientResults];
  }
  
  if (!type || type === 'doctors') {
    const doctorResults = doctors.filter(d => 
      d.name?.toLowerCase().includes(searchTerm) ||
      d.specialization?.toLowerCase().includes(searchTerm)
    ).map(d => ({ ...d, type: 'doctor' }));
    results = [...results, ...doctorResults];
  }
  
  if (!type || type === 'appointments') {
    const appointmentResults = appointments.filter(a => {
      const patient = patients.find(p => p.id === a.patientId);
      const doctor = doctors.find(d => d.id === a.doctorId);
      return patient?.name?.toLowerCase().includes(searchTerm) ||
             doctor?.name?.toLowerCase().includes(searchTerm);
    }).map(a => ({ ...a, type: 'appointment' }));
    results = [...results, ...appointmentResults];
  }
  
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`HMS Backend Server running on port ${PORT}`);
  console.log(`Blockchain integration ${process.env.HMS_CONTRACT_ADDRESS ? 'enabled' : 'disabled'}`);
});
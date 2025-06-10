const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI (you'll get this after compilation)
const HMS_CONTRACT_ABI = [
  "function registerPatient(string memory patientId, bytes32 identityHash) external",
  "function addRecord(string memory patientId, bytes32 recordHash, string memory recordType) external",
  "function getPatientRecords(string memory patientId) external view returns (bytes32[] memory)",
  "function verifyRecord(bytes32 recordHash) external view returns (bool)",
  "function getRecord(bytes32 recordHash) external view returns (tuple(string patientId, bytes32 recordHash, uint256 timestamp, address authorizedBy, string recordType, bool isActive))",
  "function authorizeDoctor(string memory patientId, address doctor) external",
  "function isAuthorizedDoctor(string memory patientId, address doctor) external view returns (bool)",
  "function getTotalPatients() external view returns (uint256)",
  "function getTotalRecords() external view returns (uint256)",
  "event PatientRegistered(string indexed patientId, bytes32 identityHash, address indexed registeredBy, uint256 timestamp)",
  "event RecordAdded(string indexed patientId, bytes32 indexed recordHash, address indexed authorizedBy, string recordType, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialize();
  }

  async initialize() {
    try {
      // Only initialize if we have the required environment variables
      if (!process.env.ETHEREUM_RPC_URL || !process.env.PRIVATE_KEY || !process.env.HMS_CONTRACT_ADDRESS) {
        console.log('Blockchain service: Missing required environment variables');
        console.log('Required: ETHEREUM_RPC_URL, PRIVATE_KEY, HMS_CONTRACT_ADDRESS');
        return;
      }

      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
      
      // Test provider connection
      try {
        await this.provider.getNetwork();
      } catch (error) {
        console.error('Failed to connect to blockchain network:', error.message);
        return;
      }
      
      // Initialize wallet
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

      // Initialize contract
      this.contract = new ethers.Contract(
        process.env.HMS_CONTRACT_ADDRESS,
        HMS_CONTRACT_ABI,
        this.wallet
      );

      // Test contract connection
      try {
        await this.contract.getTotalPatients();
        console.log('Blockchain service initialized successfully');
      } catch (error) {
        console.error('Contract connection failed:', error.message);
        this.contract = null;
      }
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error.message);
    }
  }

  // Generate hash for data
  generateHash(data) {
    return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
  }

  // Register patient on blockchain
  async registerPatient(patientData) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const identityHash = this.generateHash({
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone
      });

      const tx = await this.contract.registerPatient(patientData.id, identityHash);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        identityHash
      };
    } catch (error) {
      console.error('Error registering patient on blockchain:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add medical record to blockchain
  async addMedicalRecord(recordData) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const recordHash = this.generateHash(recordData);

      const tx = await this.contract.addRecord(
        recordData.patientId,
        recordHash,
        recordData.type || 'medical_record'
      );
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        recordHash
      };
    } catch (error) {
      console.error('Error adding record to blockchain:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get patient records from blockchain
  async getPatientRecords(patientId) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const recordHashes = await this.contract.getPatientRecords(patientId);
      return {
        success: true,
        recordHashes: recordHashes.map(hash => hash.toString())
      };
    } catch (error) {
      console.error('Error getting patient records:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify record exists on blockchain
  async verifyRecord(recordHash) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const exists = await this.contract.verifyRecord(recordHash);
      return {
        success: true,
        exists
      };
    } catch (error) {
      console.error('Error verifying record:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get record details from blockchain
  async getRecordDetails(recordHash) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const record = await this.contract.getRecord(recordHash);
      return {
        success: true,
        record: {
          patientId: record.patientId,
          recordHash: record.recordHash,
          timestamp: Number(record.timestamp),
          authorizedBy: record.authorizedBy,
          recordType: record.recordType,
          isActive: record.isActive
        }
      };
    } catch (error) {
      console.error('Error getting record details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Authorize doctor for patient
  async authorizeDoctor(patientId, doctorAddress) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.authorizeDoctor(patientId, doctorAddress);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error authorizing doctor:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if doctor is authorized
  async isAuthorizedDoctor(patientId, doctorAddress) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const isAuthorized = await this.contract.isAuthorizedDoctor(patientId, doctorAddress);
      return {
        success: true,
        isAuthorized
      };
    } catch (error) {
      console.error('Error checking doctor authorization:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get blockchain statistics
  async getBlockchainStats() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [totalPatients, totalRecords, network] = await Promise.all([
        this.contract.getTotalPatients(),
        this.contract.getTotalRecords(),
        this.provider.getNetwork()
      ]);

      return {
        success: true,
        stats: {
          totalPatients: Number(totalPatients),
          totalRecords: Number(totalRecords),
          contractAddress: process.env.HMS_CONTRACT_ADDRESS,
          network: {
            name: network.name,
            chainId: Number(network.chainId)
          }
        }
      };
    } catch (error) {
      console.error('Error getting blockchain stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listen to contract events
  setupEventListeners() {
    if (!this.contract) {
      console.error('Contract not initialized for event listeners');
      return;
    }

    try {
      // Listen for patient registration events
      this.contract.on('PatientRegistered', (patientId, identityHash, registeredBy, timestamp) => {
        console.log('Patient registered on blockchain:', {
          patientId,
          identityHash,
          registeredBy,
          timestamp: Number(timestamp)
        });
      });

      // Listen for record addition events
      this.contract.on('RecordAdded', (patientId, recordHash, authorizedBy, recordType, timestamp) => {
        console.log('Record added to blockchain:', {
          patientId,
          recordHash,
          authorizedBy,
          recordType,
          timestamp: Number(timestamp)
        });
      });
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }
}

module.exports = new BlockchainService();
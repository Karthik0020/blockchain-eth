import { ethers } from 'ethers';

// Contract ABI - use the same as backend
const HMS_CONTRACT_ABI = [
  "function registerPatient(string patientId, bytes32 identityHash) external",
  "function addRecord(string patientId, bytes32 recordHash, string recordType) external",
  "function getPatientRecords(string patientId) external view returns (bytes32[])",
  "function verifyRecord(bytes32 recordHash) external view returns (bool)",
  "function getRecord(bytes32 recordHash) external view returns (tuple(string patientId, bytes32 recordHash, uint256 timestamp, address authorizedBy, string recordType, bool isActive))",
  "function authorizeDoctor(string patientId, address doctor) external",
  "function isAuthorizedDoctor(string patientId, address doctor) external view returns (bool)",
  "function getTotalPatients() external view returns (uint256)",
  "function getTotalRecords() external view returns (uint256)",
  "event PatientRegistered(string indexed patientId, bytes32 identityHash, address indexed registeredBy, uint256 timestamp)",
  "event RecordAdded(string indexed patientId, bytes32 indexed recordHash, address indexed authorizedBy, string recordType, uint256 timestamp)"
];

// Network configurations
const NETWORKS = {
  mumbai: {
    chainId: '0x13881', // 80001 in hex
    chainName: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
};

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    this.targetNetwork = process.env.REACT_APP_TARGET_NETWORK || 'mumbai';
  }

  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  async connectWallet() {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask wallet.');
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];

      await this.ensureCorrectNetwork();

      if (this.contractAddress) {
        this.contract = new ethers.Contract(this.contractAddress, HMS_CONTRACT_ABI, this.signer);
      }

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.account = accounts[0];
          this.connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return {
        success: true,
        account: this.account,
        network: await this.provider.getNetwork(),
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async ensureCorrectNetwork() {
    try {
      const network = await this.provider.getNetwork();
      const targetChainId = parseInt(NETWORKS[this.targetNetwork].chainId, 16);

      if (network.chainId !== targetChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORKS[this.targetNetwork].chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [NETWORKS[this.targetNetwork]],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error('Error switching network:', error);
      throw new Error(`Please switch to ${NETWORKS[this.targetNetwork].chainName} network`);
    }
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  }

  isConnected() {
    return this.account !== null && this.signer !== null;
  }

  getCurrentAccount() {
    return this.account;
  }

  generateHash(data) {
    // ethers v6: keccak256 expects Uint8Array or Bytes
    return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
  }

  async registerPatient(patientData) {
    try {
      if (!this.contract) throw new Error('Contract not initialized. Please connect your wallet first.');

      const identityHash = this.generateHash({
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone,
      });

      const gasEstimate = await this.contract.estimateGas.registerPatient(patientData.id, identityHash);
      const gasLimit = gasEstimate.mul(120).div(100);

      const tx = await this.contract.registerPatient(patientData.id, identityHash, { gasLimit });

      return {
        success: true,
        transactionHash: tx.hash,
        transaction: tx,
      };
    } catch (error) {
      console.error('Error registering patient:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  async addMedicalRecord(recordData) {
    try {
      if (!this.contract) throw new Error('Contract not initialized. Please connect your wallet first.');

      const recordHash = this.generateHash(recordData);

      const gasEstimate = await this.contract.estimateGas.addRecord(
        recordData.patientId,
        recordHash,
        recordData.type || 'medical_record'
      );

      const gasLimit = gasEstimate.mul(120).div(100);

      const tx = await this.contract.addRecord(recordData.patientId, recordHash, recordData.type || 'medical_record', { gasLimit });

      return {
        success: true,
        transactionHash: tx.hash,
        recordHash,
        transaction: tx,
      };
    } catch (error) {
      console.error('Error adding record:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  async getPatientRecords(patientId) {
    try {
      if (!this.contract) throw new Error('Contract not initialized. Please connect your wallet first.');

      const recordHashes = await this.contract.getPatientRecords(patientId);
      return {
        success: true,
        recordHashes: recordHashes.map((hash) => hash.toString()),
      };
    } catch (error) {
      console.error('Error getting patient records:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  async verifyRecord(recordHash) {
    try {
      if (!this.contract) throw new Error('Contract not initialized. Please connect your wallet first.');

      const exists = await this.contract.verifyRecord(recordHash);
      return { success: true, exists };
    } catch (error) {
      console.error('Error verifying record:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  async getRecordDetails(recordHash) {
    try {
      if (!this.contract) throw new Error('Contract not initialized. Please connect your wallet first.');

      const record = await this.contract.getRecord(recordHash);
      return {
        success: true,
        record: {
          patientId: record.patientId,
          recordHash: record.recordHash,
          timestamp: Number(record.timestamp),
          authorizedBy: record.authorizedBy,
          recordType: record.recordType,
          isActive: record.isActive,
        },
      };
    } catch (error) {
      console.error('Error getting record details:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  async getBlockchainStats() {
    try {
      if (!this.contract) throw new Error('Contract not initialized. Please connect your wallet first.');

      const [totalPatients, totalRecords, network] = await Promise.all([
        this.contract.getTotalPatients(),
        this.contract.getTotalRecords(),
        this.provider.getNetwork(),
      ]);

      return {
        success: true,
        stats: {
          totalPatients: totalPatients.toNumber(),
          totalRecords: totalRecords.toNumber(),
          contractAddress: this.contractAddress,
          network: {
            name: network.name,
            chainId: network.chainId,
          },
          account: this.account,
        },
      };
    } catch (error) {
      console.error('Error getting blockchain stats:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  async waitForTransaction(txHash, confirmations = 1) {
    try {
      if (!this.provider) throw new Error('Provider not initialized');

      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      return { success: true, receipt };
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  async getTransactionReceipt(txHash) {
    try {
      if (!this.provider) throw new Error('Provider not initialized');

      const receipt = await this.provider.getTransactionReceipt(txHash);
      return { success: true, receipt };
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  parseError(error) {
    if (error.code === 4001) return 'Transaction rejected by user';
    if (error.code === -32603) return 'Internal JSON-RPC error';
    if (error.message?.includes('insufficient funds')) return 'Insufficient funds for transaction';
    if (error.message?.includes('gas')) return 'Gas estimation failed or insufficient gas';
    if (error.message?.includes('revert')) {
      const match = error.message.match(/revert (.+)/);
      return match ? match[1] : 'Transaction reverted';
    }
    return error.message || 'Unknown error occurred';
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  getExplorerUrl(txHash) {
    const baseUrl = NETWORKS[this.targetNetwork].blockExplorerUrls[0];
    return `${baseUrl}tx/${txHash}`;
  }
}

export default new BlockchainService();

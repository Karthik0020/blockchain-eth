# Ethereum Blockchain Integration Setup Guide

This guide will help you integrate Ethereum blockchain into your Hospital Management System.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install blockchain dependencies
cd blockchain
npm install

# Install backend dependencies
cd ../hms/backend
npm install

# Install frontend dependencies
cd ../hms/frontend
npm install
```

### 2. Environment Setup

```bash
# Copy environment templates
cp blockchain/.env.example blockchain/.env
cp hms/backend/.env.example hms/backend/.env
cp hms/frontend/.env.example hms/frontend/.env
```

### 3. Configure Environment Variables

#### Blockchain (.env)
```env
PRIVATE_KEY=your_metamask_private_key
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hms_blockchain
ETHEREUM_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_metamask_private_key
HMS_CONTRACT_ADDRESS=deployed_contract_address
```

#### Frontend (.env)
```env
REACT_APP_CONTRACT_ADDRESS=deployed_contract_address
REACT_APP_TARGET_NETWORK=mumbai
REACT_APP_ENABLE_BLOCKCHAIN=true
```

## 📋 Step-by-Step Setup

### Step 1: Get Required API Keys

1. **Alchemy Account** (Recommended)
   - Go to [Alchemy](https://www.alchemy.com/)
   - Create account and new app
   - Select "Polygon Mumbai" network
   - Copy the API key

2. **PolygonScan API Key**
   - Go to [PolygonScan](https://polygonscan.com/)
   - Create account
   - Go to API Keys section
   - Generate new API key

3. **MetaMask Setup**
   - Install MetaMask browser extension
   - Create or import wallet
   - Export private key (Keep this secure!)
   - Add Mumbai testnet to MetaMask

### Step 2: Add Mumbai Testnet to MetaMask

Network Details:
- **Network Name**: Polygon Mumbai
- **RPC URL**: https://rpc-mumbai.maticvigil.com/
- **Chain ID**: 80001
- **Currency Symbol**: MATIC
- **Block Explorer**: https://mumbai.polygonscan.com/

### Step 3: Get Test MATIC

1. Go to [Mumbai Faucet](https://faucet.polygon.technology/)
2. Enter your wallet address
3. Request test MATIC tokens

### Step 4: Compile and Deploy Smart Contract

```bash
# Navigate to blockchain directory
cd blockchain

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Mumbai testnet
npm run deploy:mumbai
```

### Step 5: Verify Contract (Optional)

```bash
# Verify on PolygonScan
npm run verify -- --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

###  6: Update Configuration

After deployment, update the contract address in:
- `hms/backend/.env`
- `hms/frontend/.env`

### Step 7: Start the Application

```bash
# Start backend (from hms/backend)
npm run dev

# Start frontend (from hms/frontend)
npm start
```

## 🔧 Local Development

For local development with Hardhat network:

```bash
# Terminal 1: Start local blockchain
cd blockchain
npm run node

# Terminal 2: Deploy to local network
npm run deploy:local

# Terminal 3: Start backend
cd ../hms/backend
npm run dev

# Terminal 4: Start frontend
cd ../hms/frontend
npm start
```

## 📱 Frontend Integration

### Connect MetaMask

The frontend automatically detects MetaMask and provides connection UI:

```javascript
import blockchainService from '../services/blockchainService';

// Connect wallet
const result = await blockchainService.connectWallet();
if (result.success) {
  console.log('Connected:', result.account);
}
```

### Register Patient on Blockchain

```javascript
// Register patient
const result = await blockchainService.registerPatient({
  id: 'patient_123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
});
```

### Add Medical Record

```javascript
// Add medical record
const result = await blockchainService.addMedicalRecord({
  patientId: 'patient_123',
  diagnosis: 'Common cold',
  treatment: 'Rest and fluids',
  type: 'consultation'
});
```

## 🔍 Verification

### Verify Record on Blockchain

```javascript
// Verify record exists
const result = await blockchainService.verifyRecord(recordHash);
console.log('Record exists:', result.exists);
```

### Get Record Details

```javascript
// Get record details
const result = await blockchainService.getRecordDetails(recordHash);
console.log('Record:', result.record);
```

## 🛠 Troubleshooting

### Common Issues

1. **"Contract not initialized"**
   - Ensure MetaMask is connected
   - Check contract address in environment variables
   - Verify you're on the correct network

2. **"Insufficient funds"**
   - Get test MATIC from faucet
   - Check wallet balance

3. **"Transaction reverted"**
   - Check if patient is registered
   - Verify doctor authorization
   - Ensure valid input data

4. **Network connection issues**
   - Check RPC URL
   - Try different RPC provider
   - Verify network configuration

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('debug', 'blockchain:*');
```

## 📊 Monitoring

### View Transactions

- **Mumbai**: https://mumbai.polygonscan.com/
- **Local**: Hardhat console logs

### Contract Events

The contract emits events for:
- Patient registration
- Record additions
- Doctor authorizations

## 🔒 Security Best Practices

1. **Never commit private keys**
2. **Use environment variables**
3. **Validate all inputs**
4. **Test on testnet first**
5. **Keep dependencies updated**

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Polygon Documentation](https://docs.polygon.technology/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review console logs
3. Verify environment configuration
4. Test with minimal example
5. Check network status

## 🎯 Next Steps

After successful setup:

1. **Test all functionality**
2. **Add more medical record types**
3. **Implement IPFS for file storage**
4. **Add role-based permissions**
5. **Deploy to mainnet** (when ready)

---

**⚠️ Important**: This is for educational/development purposes. For production use, conduct thorough security audits and testing.
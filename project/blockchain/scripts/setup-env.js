const fs = require('fs');
const path = require('path');

// This script helps set up environment variables after deployment
async function setupEnvironment() {
  console.log('Setting up environment variables...');
  
  // Read deployment artifacts (if they exist)
  const artifactsPath = path.join(__dirname, '../artifacts/contracts/HMSRecords.sol/HMSRecords.json');
  
  if (fs.existsSync(artifactsPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    console.log('Contract ABI available in artifacts');
    
    // You can extract the ABI and save it to a separate file for frontend use
    const abi = artifact.abi;
    const abiPath = path.join(__dirname, '../abi/HMSRecords.json');
    
    // Create abi directory if it doesn't exist
    const abiDir = path.dirname(abiPath);
    if (!fs.existsSync(abiDir)) {
      fs.mkdirSync(abiDir, { recursive: true });
    }
    
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
    console.log('ABI saved to:', abiPath);
  }
  
  // Create environment template for frontend
  const frontendEnvTemplate = `# Frontend Environment Variables
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address_here
REACT_APP_TARGET_NETWORK=mumbai
REACT_APP_ENABLE_BLOCKCHAIN=true
`;

  const frontendEnvPath = path.join(__dirname, '../../hms/frontend/.env.example');
  fs.writeFileSync(frontendEnvPath, frontendEnvTemplate);
  console.log('Frontend .env.example created');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Copy .env.example to .env in the blockchain directory');
  console.log('2. Fill in your private key and RPC URLs');
  console.log('3. Deploy the contract: npm run deploy:mumbai');
  console.log('4. Update the contract address in frontend/.env');
  console.log('5. Start the application: npm run dev:frontend');
}

setupEnvironment().catch(console.error);
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying HMSRecords contract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Updated syntax for getting balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const HMSRecords = await ethers.getContractFactory("HMSRecords");
  const hmsRecords = await HMSRecords.deploy();

  // Updated syntax for waiting for deployment
  await hmsRecords.waitForDeployment();

  // Get contract address using getAddress()
  const contractAddress = await hmsRecords.getAddress();
  console.log("HMSRecords deployed to:", contractAddress);
  
  // Get deployment transaction
  const deploymentTx = hmsRecords.deploymentTransaction();
  if (deploymentTx) {
    console.log("Transaction hash:", deploymentTx.hash);
    
    // Wait for confirmations - adjust based on network
    console.log("Waiting for confirmations...");
    
    // Use different confirmation counts for different networks
    let confirmations = 1; // Default for local networks
    
    if (hre.network.name === "mumbai" || hre.network.name === "polygon") {
      confirmations = 3;
    } else if (hre.network.name === "mainnet" || hre.network.name === "ethereum") {
      confirmations = 5;
    } else if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
      confirmations = 1; // Local networks only need 1
    }
    
    console.log(`Waiting for ${confirmations} confirmation(s) on ${hre.network.name}...`);
    const receipt = await deploymentTx.wait(confirmations);
    console.log("Confirmed in block:", receipt.blockNumber);
  }

  console.log("Deployment completed!");
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    blockNumber: deploymentTx ? deploymentTx.blockNumber : null,
    transactionHash: deploymentTx ? deploymentTx.hash : null,
    timestamp: new Date().toISOString()
  };

  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

  // Verify contract if on testnet
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
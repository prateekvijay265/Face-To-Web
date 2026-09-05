const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  const provider = hre.ethers.provider;
  const network = await provider.getNetwork();
  console.log(`Connected to network: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}`);

  // Validate chain ID for Sepolia
  if (Number(network.chainId) !== 11155111) {
    console.error("ERROR: Not connected to Sepolia testnet! Aborting deployment.");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    console.error("ERROR: No deployer account found. Check DEPLOYER_PRIVATE_KEY.");
    process.exit(1);
  }

  console.log(`Deploying contracts with the account: ${deployer.address}`);
  
  const balance = await provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error("ERROR: Deployer account has 0 ETH. Please fund it using a Sepolia faucet.");
    process.exit(1);
  }

  const ContentRegistry = await hre.ethers.getContractFactory("ContentRegistry");
  const registry = await ContentRegistry.deploy();

  await registry.waitForDeployment();
  const contractAddress = await registry.getAddress();
  const tx = registry.deploymentTransaction();

  console.log(`\nDeployment successful!`);
  console.log(`Contract deployed to: ${contractAddress}`);
  console.log(`Transaction Hash: ${tx.hash}`);
  
  // Wait for 1 block confirmation to ensure it's minable for our read test
  console.log("\nWaiting for 1 block confirmation...");
  const receipt = await tx.wait(1);
  console.log(`Confirmed in block: ${receipt.blockNumber}`);

  console.log("\nVerifying contract is reachable...");
  // Call a read function
  const DUMMY_HASH = "0x8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";
  const isVerified = await registry.verifyContent(DUMMY_HASH);
  console.log(`Read test 'verifyContent(DUMMY_HASH)' returned: ${isVerified}`);
  
  if (isVerified !== false) {
    console.error("ERROR: Unexpected read result from fresh contract.");
    process.exit(1);
  }
  
  console.log("Contract is fully reachable and verified.");

  // Save address to env/config
  const envPath = path.join(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("CONTRACT_ADDRESS=")) {
        envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
        envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated CONTRACT_ADDRESS in .env`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

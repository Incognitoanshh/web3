const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying IdentityContract...");
  const Identity = await hre.ethers.getContractFactory("IdentityContract");
  const identityContract = await Identity.deploy(); // ✅ deployed() call hatao

  console.log(`✅ IdentityContract deployed at: ${identityContract.target}`);

  console.log("🚀 Deploying EnhancedDataRequestContract...");
  const DataRequest = await hre.ethers.getContractFactory("EnhancedDataRequestContract");
  const dataRequestContract = await DataRequest.deploy(); // ✅ deployed() call hatao

  console.log(`✅ EnhancedDataRequestContract deployed at: ${dataRequestContract.target}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});

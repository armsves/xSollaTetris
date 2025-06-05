import { ethers, network } from 'hardhat';

async function main() {
  const CONTRACT_NAME = "XsollaLeaderboard";

  console.log(`Deploying ${CONTRACT_NAME} contract to ${network.name}`);

  // Fix the deployment call syntax - provide empty array for constructor args
  const contract = await ethers.deployContract(CONTRACT_NAME);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`${CONTRACT_NAME} deployed to ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
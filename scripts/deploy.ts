import { ethers } from "hardhat";

async function main() {
  console.log("Deploying LandRegistry contract...");

  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();

  await landRegistry.deployed();

  console.log("LandRegistry deployed to:", landRegistry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
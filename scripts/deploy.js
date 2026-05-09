const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Market = await hre.ethers.getContractFactory("NFTMarket");
  const market = await Market.deploy();
  await market.waitForDeployment();
  const marketAddr = await market.getAddress();

  console.log("Market deployed to:", marketAddr);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  const nftAddr = await nft.getAddress();

  console.log("NFT deployed to:", nftAddr);

  const configPath = path.join(__dirname, "..", "config.js");
  const content = `export const nftaddress = "${nftAddr}"\nexport const nftmarketaddress = "${marketAddr}"\n`;
  fs.writeFileSync(configPath, content);
  console.log("Wrote addresses to config.js");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

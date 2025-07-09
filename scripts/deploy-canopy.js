const { ethers } = require("hardhat")

async function main() {
  console.log("🌿 Deploying LUMIN Smart Contracts to Canopy Network...")

  // Get deployer account
  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  // Deploy LUM Token
  console.log("\n📄 Deploying LUM Token...")
  const LumToken = await ethers.getContractFactory("LumToken")
  const lumToken = await LumToken.deploy()
  await lumToken.deployed()
  console.log("✅ LUM Token deployed to:", lumToken.address)

  // Deploy NFT Contract
  console.log("\n🎨 Deploying LUM NFT...")
  const LumNFT = await ethers.getContractFactory("LumNFT")
  const lumNFT = await LumNFT.deploy(lumToken.address)
  await lumNFT.deployed()
  console.log("✅ LUM NFT deployed to:", lumNFT.address)

  // Deploy Timelock Controller for DAO
  console.log("\n⏰ Deploying Timelock Controller...")
  const TimelockController = await ethers.getContractFactory("TimelockController")
  const timelock = await TimelockController.deploy(
    86400, // 1 day delay
    [deployer.address], // proposers
    [deployer.address], // executors
    deployer.address, // admin
  )
  await timelock.deployed()
  console.log("✅ Timelock Controller deployed to:", timelock.address)

  // Deploy DAO
  console.log("\n🏛️ Deploying LUM DAO...")
  const LumDAO = await ethers.getContractFactory("LumDAO")
  const lumDAO = await LumDAO.deploy(
    lumToken.address, // voting token
    timelock.address, // timelock
    lumToken.address, // LUM token for treasury
  )
  await lumDAO.deployed()
  console.log("✅ LUM DAO deployed to:", lumDAO.address)

  // Setup initial configuration
  console.log("\n⚙️ Setting up initial configuration...")

  // Fund DAO treasury with initial tokens
  const initialTreasuryAmount = ethers.utils.parseEther("100000") // 100k LUM
  await lumToken.transfer(lumDAO.address, initialTreasuryAmount)
  console.log("✅ Funded DAO treasury with 100k LUM tokens")

  // Create some sample NFTs for testing
  console.log("\n🎯 Creating sample NFTs...")

  // Grade 5 Achievement NFT
  await lumNFT.mintNFT(
    deployer.address,
    2, // Badge category
    2, // Epic rarity
    "Grade 5 Achievement",
    "Milestone achievement for completing Grade 5",
    ethers.utils.parseEther("3000"),
    5, // Grade utility
    0, // No duration
  )

  // Grade 10 Legendary NFT
  await lumNFT.mintNFT(
    deployer.address,
    2, // Badge category
    3, // Legendary rarity
    "Legendary Master",
    "Ultimate achievement for completing Grade 10",
    ethers.utils.parseEther("6000"),
    10, // Grade utility
    0, // No duration
  )

  console.log("✅ Created sample achievement NFTs")

  // Display deployment summary for Canopy Network
  console.log("\n🎉 LUMIN Canopy Network Deployment Complete!")
  console.log("=".repeat(60))
  console.log("🌿 Network: Canopy Network")
  console.log("📄 LUM Token:", lumToken.address)
  console.log("🎨 LUM NFT:", lumNFT.address)
  console.log("⏰ Timelock:", timelock.address)
  console.log("🏛️ LUM DAO:", lumDAO.address)
  console.log("=".repeat(60))

  // Save deployment addresses for frontend
  const deploymentInfo = {
    network: "canopy",
    chainId: 1, // Update with actual Canopy chain ID
    lumToken: lumToken.address,
    lumNFT: lumNFT.address,
    timelock: timelock.address,
    lumDAO: lumDAO.address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  }

  console.log("\n📋 Canopy Deployment Info:")
  console.log(JSON.stringify(deploymentInfo, null, 2))

  // Verify contracts are working
  console.log("\n🔍 Verifying Canopy deployment...")
  const tokenName = await lumToken.name()
  const tokenSymbol = await lumToken.symbol()
  const totalSupply = await lumToken.totalSupply()

  console.log(`✅ Token: ${tokenName} (${tokenSymbol})`)
  console.log(`✅ Total Supply: ${ethers.utils.formatEther(totalSupply)} LUM`)

  const nftName = await lumNFT.name()
  const nftSymbol = await lumNFT.symbol()
  console.log(`✅ NFT: ${nftName} (${nftSymbol})`)

  console.log("\n🌿 LUMIN is ready on Canopy Network!")

  // Return addresses for use in other scripts
  return {
    lumToken: lumToken.address,
    lumNFT: lumNFT.address,
    timelock: timelock.address,
    lumDAO: lumDAO.address,
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Canopy deployment failed:", error)
    process.exit(1)
  })

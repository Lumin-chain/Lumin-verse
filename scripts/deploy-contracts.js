const { ethers } = require("hardhat")

async function main() {
  console.log("🚀 Deploying LUMIN Smart Contracts...")

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

  // Grant DAO permission to mint rewards
  await lumToken.transferOwnership(lumDAO.address)
  console.log("✅ Transferred LUM Token ownership to DAO")

  // Fund DAO treasury with initial tokens
  const initialTreasuryAmount = ethers.utils.parseEther("100000") // 100k LUM
  await lumToken.transfer(lumDAO.address, initialTreasuryAmount)
  console.log("✅ Funded DAO treasury with 100k LUM tokens")

  // Create some sample NFTs
  console.log("\n🎯 Creating sample NFTs...")

  // Avatar NFT
  await lumNFT.mintNFT(
    deployer.address,
    0, // AVATAR
    2, // EPIC
    "Neon Gamer Avatar",
    "Glowing avatar with special effects",
    ethers.utils.parseEther("12"),
    15, // 15% point bonus
    0,
  )

  // Power-up NFT
  await lumNFT.mintNFT(
    deployer.address,
    1, // POWERUP
    1, // RARE
    "Golden Hint Crystal",
    "Reveals one correct answer per puzzle",
    ethers.utils.parseEther("3.5"),
    1, // 1 hint
    300, // 5 minutes duration
  )

  console.log("✅ Created sample NFTs")

  // Display deployment summary
  console.log("\n🎉 LUMIN Deployment Complete!")
  console.log("=".repeat(50))
  console.log("📄 LUM Token:", lumToken.address)
  console.log("🎨 LUM NFT:", lumNFT.address)
  console.log("⏰ Timelock:", timelock.address)
  console.log("🏛️ LUM DAO:", lumDAO.address)
  console.log("=".repeat(50))

  // Save deployment addresses
  const deploymentInfo = {
    network: "localhost",
    lumToken: lumToken.address,
    lumNFT: lumNFT.address,
    timelock: timelock.address,
    lumDAO: lumDAO.address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  }

  console.log("\n📋 Deployment Info:")
  console.log(JSON.stringify(deploymentInfo, null, 2))

  // Verify contracts are working
  console.log("\n🔍 Verifying deployment...")
  const tokenName = await lumToken.name()
  const tokenSymbol = await lumToken.symbol()
  const totalSupply = await lumToken.totalSupply()

  console.log(`✅ Token: ${tokenName} (${tokenSymbol})`)
  console.log(`✅ Total Supply: ${ethers.utils.formatEther(totalSupply)} LUM`)

  const nftName = await lumNFT.name()
  const nftSymbol = await lumNFT.symbol()
  console.log(`✅ NFT: ${nftName} (${nftSymbol})`)

  console.log("\n🚀 LUMIN is ready to launch!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })

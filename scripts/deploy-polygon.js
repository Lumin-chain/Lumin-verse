const hre = require("hardhat")

async function main() {
  console.log("🔷 Deploying LUMIN contracts to Polygon...")

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  // Check if we have enough MATIC for deployment
  const balance = await deployer.getBalance()
  const minBalance = hre.ethers.utils.parseEther("0.1") // 0.1 MATIC minimum

  if (balance.lt(minBalance)) {
    console.error("❌ Insufficient MATIC balance for deployment")
    console.log("Required: 0.1 MATIC, Current:", hre.ethers.utils.formatEther(balance))
    process.exit(1)
  }

  // Deploy LUM Token
  console.log("\n📄 Deploying LUM Token...")
  const LumToken = await hre.ethers.getContractFactory("LumToken")
  const lumToken = await LumToken.deploy()
  await lumToken.deployed()
  console.log("✅ LUM Token deployed to:", lumToken.address)

  // Wait for a few confirmations
  console.log("⏳ Waiting for confirmations...")
  await lumToken.deployTransaction.wait(3)

  // Deploy LUM NFT
  console.log("\n🎨 Deploying LUM NFT...")
  const LumNFT = await hre.ethers.getContractFactory("LumNFT")
  const lumNFT = await LumNFT.deploy(lumToken.address)
  await lumNFT.deployed()
  console.log("✅ LUM NFT deployed to:", lumNFT.address)
  await lumNFT.deployTransaction.wait(3)

  // Deploy LUM DAO
  console.log("\n🏛️ Deploying LUM DAO...")
  const LumDAO = await hre.ethers.getContractFactory("LumDAO")
  const lumDAO = await LumDAO.deploy(lumToken.address, lumNFT.address)
  await lumDAO.deployed()
  console.log("✅ LUM DAO deployed to:", lumDAO.address)
  await lumDAO.deployTransaction.wait(3)

  // Set up permissions
  console.log("\n🔧 Setting up permissions...")

  // Grant minter role to NFT contract
  const minterRole = await lumToken.MINTER_ROLE()
  let tx = await lumToken.grantRole(minterRole, lumNFT.address)
  await tx.wait(2)
  console.log("✅ Granted minter role to NFT contract")

  // Grant minter role to DAO contract
  tx = await lumToken.grantRole(minterRole, lumDAO.address)
  await tx.wait(2)
  console.log("✅ Granted minter role to DAO contract")

  // Set NFT contract in token contract
  tx = await lumToken.setNFTContract(lumNFT.address)
  await tx.wait(2)
  console.log("✅ Set NFT contract in token contract")

  // Initialize some test data
  console.log("\n🧪 Initializing test data...")

  // Mint some initial tokens to deployer for testing
  tx = await lumToken.mint(deployer.address, hre.ethers.utils.parseEther("10000"))
  await tx.wait(2)
  console.log("✅ Minted 10,000 LUM tokens to deployer")

  // Create a test proposal in DAO
  tx = await lumDAO.createProposal(
    "Initial Treasury Funding",
    "Allocate initial funds for game development and rewards",
    hre.ethers.utils.parseEther("5000"),
  )
  await tx.wait(2)
  console.log("✅ Created initial DAO proposal")

  // Verify contracts on Polygonscan
  if (hre.network.name === "polygon" || hre.network.name === "mumbai") {
    console.log("\n🔍 Verifying contracts on Polygonscan...")

    // Wait a bit more for Polygonscan to index the contracts
    console.log("⏳ Waiting for Polygonscan indexing...")
    await new Promise((resolve) => setTimeout(resolve, 30000)) // 30 seconds

    try {
      await hre.run("verify:verify", {
        address: lumToken.address,
        constructorArguments: [],
      })
      console.log("✅ LUM Token verified on Polygonscan")
    } catch (error) {
      console.log("⚠️ LUM Token verification failed:", error.message)
    }

    try {
      await hre.run("verify:verify", {
        address: lumNFT.address,
        constructorArguments: [lumToken.address],
      })
      console.log("✅ LUM NFT verified on Polygonscan")
    } catch (error) {
      console.log("⚠️ LUM NFT verification failed:", error.message)
    }

    try {
      await hre.run("verify:verify", {
        address: lumDAO.address,
        constructorArguments: [lumToken.address, lumNFT.address],
      })
      console.log("✅ LUM DAO verified on Polygonscan")
    } catch (error) {
      console.log("⚠️ LUM DAO verification failed:", error.message)
    }
  }

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contracts: {
      LumToken: lumToken.address,
      LumNFT: lumNFT.address,
      LumDAO: lumDAO.address,
    },
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    gasUsed: {
      LumToken: lumToken.deployTransaction.gasLimit?.toString(),
      LumNFT: lumNFT.deployTransaction.gasLimit?.toString(),
      LumDAO: lumDAO.deployTransaction.gasLimit?.toString(),
    },
    transactionHashes: {
      LumToken: lumToken.deployTransaction.hash,
      LumNFT: lumNFT.deployTransaction.hash,
      LumDAO: lumDAO.deployTransaction.hash,
    },
  }

  const fs = require("fs")
  const path = require("path")

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments")
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir)
  }

  // Save deployment info
  const filename = hre.network.name === "polygon" ? "polygon.json" : "mumbai.json"
  fs.writeFileSync(path.join(deploymentsDir, filename), JSON.stringify(deploymentInfo, null, 2))

  console.log("\n🎉 Deployment completed successfully!")
  console.log("📋 Contract addresses:")
  console.log("   LUM Token:", lumToken.address)
  console.log("   LUM NFT:", lumNFT.address)
  console.log("   LUM DAO:", lumDAO.address)
  console.log(`\n💾 Deployment info saved to deployments/${filename}`)

  console.log("\n🔗 Polygonscan links:")
  const explorerUrl = hre.network.name === "polygon" ? "https://polygonscan.com" : "https://mumbai.polygonscan.com"
  console.log(`   LUM Token: ${explorerUrl}/address/${lumToken.address}`)
  console.log(`   LUM NFT: ${explorerUrl}/address/${lumNFT.address}`)
  console.log(`   LUM DAO: ${explorerUrl}/address/${lumDAO.address}`)

  console.log("\n🔗 Next steps:")
  console.log("1. Update frontend contract addresses in components/web3-integration.tsx")
  console.log("2. Test the contracts with the game interface")
  console.log("3. Set up monitoring and analytics")
  console.log("4. Configure game rewards and NFT minting")
  console.log("5. Add liquidity to DEX if needed")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })

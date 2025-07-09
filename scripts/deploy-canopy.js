const hre = require("hardhat")

async function main() {
  console.log("🌿 Deploying LUMIN contracts to Canopy Network...")

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  // Deploy LUM Token
  console.log("\n📄 Deploying LUM Token...")
  const LumToken = await hre.ethers.getContractFactory("LumToken")
  const lumToken = await LumToken.deploy()
  await lumToken.deployed()
  console.log("✅ LUM Token deployed to:", lumToken.address)

  // Deploy LUM NFT
  console.log("\n🎨 Deploying LUM NFT...")
  const LumNFT = await hre.ethers.getContractFactory("LumNFT")
  const lumNFT = await LumNFT.deploy(lumToken.address)
  await lumNFT.deployed()
  console.log("✅ LUM NFT deployed to:", lumNFT.address)

  // Deploy LUM DAO
  console.log("\n🏛️ Deploying LUM DAO...")
  const LumDAO = await hre.ethers.getContractFactory("LumDAO")
  const lumDAO = await LumDAO.deploy(lumToken.address, lumNFT.address)
  await lumDAO.deployed()
  console.log("✅ LUM DAO deployed to:", lumDAO.address)

  // Set up permissions
  console.log("\n🔧 Setting up permissions...")

  // Grant minter role to NFT contract
  await lumToken.grantRole(await lumToken.MINTER_ROLE(), lumNFT.address)
  console.log("✅ Granted minter role to NFT contract")

  // Grant minter role to DAO contract
  await lumToken.grantRole(await lumToken.MINTER_ROLE(), lumDAO.address)
  console.log("✅ Granted minter role to DAO contract")

  // Set NFT contract in token contract
  await lumToken.setNFTContract(lumNFT.address)
  console.log("✅ Set NFT contract in token contract")

  // Initialize some test data
  console.log("\n🧪 Initializing test data...")

  // Mint some initial tokens to deployer for testing
  await lumToken.mint(deployer.address, hre.ethers.utils.parseEther("10000"))
  console.log("✅ Minted 10,000 LUM tokens to deployer")

  // Create a test proposal in DAO
  await lumDAO.createProposal(
    "Initial Treasury Funding",
    "Allocate initial funds for game development and rewards",
    hre.ethers.utils.parseEther("5000"),
  )
  console.log("✅ Created initial DAO proposal")

  // Verify contracts on Canopy Network (if block explorer is available)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contracts...")

    try {
      await hre.run("verify:verify", {
        address: lumToken.address,
        constructorArguments: [],
      })
      console.log("✅ LUM Token verified")
    } catch (error) {
      console.log("⚠️ LUM Token verification failed:", error.message)
    }

    try {
      await hre.run("verify:verify", {
        address: lumNFT.address,
        constructorArguments: [lumToken.address],
      })
      console.log("✅ LUM NFT verified")
    } catch (error) {
      console.log("⚠️ LUM NFT verification failed:", error.message)
    }

    try {
      await hre.run("verify:verify", {
        address: lumDAO.address,
        constructorArguments: [lumToken.address, lumNFT.address],
      })
      console.log("✅ LUM DAO verified")
    } catch (error) {
      console.log("⚠️ LUM DAO verification failed:", error.message)
    }
  }

  // Save deployment addresses
  const deploymentInfo = {
    network: "canopy",
    chainId: hre.network.config.chainId,
    contracts: {
      LumToken: lumToken.address,
      LumNFT: lumNFT.address,
      LumDAO: lumDAO.address,
    },
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
  }

  const fs = require("fs")
  const path = require("path")

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments")
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir)
  }

  // Save deployment info
  fs.writeFileSync(path.join(deploymentsDir, "canopy.json"), JSON.stringify(deploymentInfo, null, 2))

  console.log("\n🎉 Deployment completed successfully!")
  console.log("📋 Contract addresses:")
  console.log("   LUM Token:", lumToken.address)
  console.log("   LUM NFT:", lumNFT.address)
  console.log("   LUM DAO:", lumDAO.address)
  console.log("\n💾 Deployment info saved to deployments/canopy.json")

  console.log("\n🔗 Next steps:")
  console.log("1. Update frontend contract addresses in components/web3-integration.tsx")
  console.log("2. Test the contracts with the game interface")
  console.log("3. Set up monitoring and analytics")
  console.log("4. Configure game rewards and NFT minting")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })

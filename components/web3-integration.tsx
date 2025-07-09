"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Contract ABIs (simplified for demo)
const LUM_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function awardPoints(address player, uint256 points, string gameType, uint256 timeElapsed, uint256 accuracy)",
  "function claimRewards() external",
  "function getPlayerStats(address player) view returns (uint256 points, uint256 level, uint256 streak, uint256 totalRewards, uint256 lastClaim)",
]

const LUM_NFT_ABI = [
  "function mintNFT(address to, uint8 category, uint8 rarity, string name, string description, uint256 price, uint256 utility, uint256 duration) returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function getNFTMetadata(uint256 tokenId) view returns (tuple(uint8 category, uint8 rarity, string name, string description, uint256 price, bool isActive, uint256 utility, uint256 duration))",
]

// Contract addresses (will be set after deployment)
const CONTRACTS = {
  canopy: {
    lumToken: "0x0000000000000000000000000000000000000000", // To be updated after deployment
    lumNFT: "0x0000000000000000000000000000000000000000",
    lumDAO: "0x0000000000000000000000000000000000000000",
  },
  polygon: {
    lumToken: "0x0000000000000000000000000000000000000000", // To be updated after deployment
    lumNFT: "0x0000000000000000000000000000000000000000",
    lumDAO: "0x0000000000000000000000000000000000000000",
  },
}

interface Web3IntegrationProps {
  onStatsUpdate: (stats: any) => void
}

export default function Web3Integration({ onStatsUpdate }: Web3IntegrationProps) {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [account, setAccount] = useState<string>("")
  const [network, setNetwork] = useState<string>("")
  const [lumBalance, setLumBalance] = useState<string>("0")
  const [nftCount, setNftCount] = useState<number>(0)
  const [playerStats, setPlayerStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Initialize Web3 connection
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(web3Provider)
    }
  }, [])

  // Connect wallet
  const connectWallet = async () => {
    if (!provider) {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await provider.send("eth_requestAccounts", [])
      const signer = provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setSigner(signer)
      setAccount(address)
      setNetwork(network.name)

      // Load user data
      await loadUserData(signer, address, network.chainId)

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      })
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to wallet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load user data from contracts
  const loadUserData = async (signer: ethers.Signer, address: string, chainId: number) => {
    try {
      const contractAddresses = chainId === 137 ? CONTRACTS.polygon : CONTRACTS.canopy

      // Load LUM token balance
      const lumToken = new ethers.Contract(contractAddresses.lumToken, LUM_TOKEN_ABI, signer)
      const balance = await lumToken.balanceOf(address)
      setLumBalance(ethers.utils.formatEther(balance))

      // Load player stats
      const stats = await lumToken.getPlayerStats(address)
      const playerData = {
        points: stats[0].toNumber(),
        level: stats[1].toNumber(),
        streak: stats[2].toNumber(),
        totalRewards: ethers.utils.formatEther(stats[3]),
        lastClaim: stats[4].toNumber(),
      }
      setPlayerStats(playerData)
      onStatsUpdate(playerData)

      // Load NFT count
      const lumNFT = new ethers.Contract(contractAddresses.lumNFT, LUM_NFT_ABI, signer)
      const nftBalance = await lumNFT.balanceOf(address)
      setNftCount(nftBalance.toNumber())
    } catch (error) {
      console.error("Failed to load user data:", error)
    }
  }

  // Award points for game completion
  const awardGamePoints = async (points: number, gameType: string, timeElapsed: number, accuracy: number) => {
    if (!signer || !account) return

    try {
      setIsLoading(true)
      const chainId = await signer.getChainId()
      const contractAddresses = chainId === 137 ? CONTRACTS.polygon : CONTRACTS.canopy

      const lumToken = new ethers.Contract(contractAddresses.lumToken, LUM_TOKEN_ABI, signer)
      const tx = await lumToken.awardPoints(account, points, gameType, timeElapsed, accuracy)
      await tx.wait()

      toast({
        title: "Points Awarded!",
        description: `+${points} points for completing ${gameType}`,
      })

      // Reload user data
      await loadUserData(signer, account, chainId)
    } catch (error) {
      console.error("Failed to award points:", error)
      toast({
        title: "Transaction Failed",
        description: "Failed to award points",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mint NFT for level completion
  const mintLevelNFT = async (level: number, grade: number) => {
    if (!signer || !account) return

    try {
      setIsLoading(true)
      const chainId = await signer.getChainId()
      const contractAddresses = chainId === 137 ? CONTRACTS.polygon : CONTRACTS.canopy

      const lumNFT = new ethers.Contract(contractAddresses.lumNFT, LUM_NFT_ABI, signer)

      let nftData
      if (grade === 5) {
        nftData = {
          category: 2, // Badge
          rarity: 2, // Epic
          name: `Grade 5 Achievement Badge`,
          description: `Completed Level ${level} - Grade 5 Milestone`,
          price: ethers.utils.parseEther("3000"),
          utility: level,
          duration: 0,
        }
      } else if (grade === 10) {
        nftData = {
          category: 2, // Badge
          rarity: 3, // Legendary
          name: `Legendary Master Badge`,
          description: `Completed Level ${level} - Ultimate Achievement`,
          price: ethers.utils.parseEther("6000"),
          utility: level,
          duration: 0,
        }
      }

      if (nftData) {
        const tx = await lumNFT.mintNFT(
          account,
          nftData.category,
          nftData.rarity,
          nftData.name,
          nftData.description,
          nftData.price,
          nftData.utility,
          nftData.duration,
        )
        await tx.wait()

        toast({
          title: "NFT Minted!",
          description: `${nftData.name} has been minted to your wallet`,
        })

        // Reload user data
        await loadUserData(signer, account, chainId)
      }
    } catch (error) {
      console.error("Failed to mint NFT:", error)
      toast({
        title: "Minting Failed",
        description: "Failed to mint NFT",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Claim LUM token rewards
  const claimRewards = async () => {
    if (!signer || !account) return

    try {
      setIsLoading(true)
      const chainId = await signer.getChainId()
      const contractAddresses = chainId === 137 ? CONTRACTS.polygon : CONTRACTS.canopy

      const lumToken = new ethers.Contract(contractAddresses.lumToken, LUM_TOKEN_ABI, signer)
      const tx = await lumToken.claimRewards()
      await tx.wait()

      toast({
        title: "Rewards Claimed!",
        description: "Your LUM tokens have been claimed",
      })

      // Reload user data
      await loadUserData(signer, account, chainId)
    } catch (error) {
      console.error("Failed to claim rewards:", error)
      toast({
        title: "Claim Failed",
        description: "Failed to claim rewards",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Switch network
  const switchNetwork = async (targetChainId: number) => {
    if (!provider) return

    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: `0x${targetChainId.toString(16)}` }])
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        const networkData =
          targetChainId === 137
            ? {
                chainId: "0x89",
                chainName: "Polygon Mainnet",
                nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                rpcUrls: ["https://polygon-rpc.com/"],
                blockExplorerUrls: ["https://polygonscan.com/"],
              }
            : {
                chainId: "0x1", // Placeholder for Canopy Network
                chainName: "Canopy Network",
                nativeCurrency: { name: "CNP", symbol: "CNP", decimals: 18 },
                rpcUrls: ["https://canopy-rpc.com/"], // Placeholder
                blockExplorerUrls: ["https://canopy-explorer.com/"], // Placeholder
              }

        await provider.send("wallet_addEthereumChain", [networkData])
      }
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <span className="text-2xl">🔗</span>
          <span>Web3 Integration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!account ? (
          <Button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold"
          >
            {isLoading ? "Connecting..." : "🦊 Connect Wallet"}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Account Info */}
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white font-semibold mb-2">Connected Account</div>
              <div className="text-sm text-gray-300 font-mono">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
              <Badge className="mt-2 bg-green-500/20 text-green-400">{network} Network</Badge>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-300">{Number.parseFloat(lumBalance).toFixed(2)}</div>
                <div className="text-sm text-yellow-400">$LUM Balance</div>
              </div>
              <div className="bg-purple-500/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-300">{nftCount}</div>
                <div className="text-sm text-purple-400">NFTs Owned</div>
              </div>
            </div>

            {/* Player Stats */}
            {playerStats && (
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-white font-semibold mb-2">Player Stats</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    Level: <span className="text-blue-400">{playerStats.level}</span>
                  </div>
                  <div>
                    Points: <span className="text-green-400">{playerStats.points}</span>
                  </div>
                  <div>
                    Streak: <span className="text-orange-400">{playerStats.streak}</span>
                  </div>
                  <div>
                    Rewards:{" "}
                    <span className="text-yellow-400">
                      {Number.parseFloat(playerStats.totalRewards).toFixed(2)} $LUM
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={claimRewards}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 font-bold"
              >
                💰 Claim Rewards
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => switchNetwork(137)}
                  variant="outline"
                  className="bg-purple-900/30 border-purple-500/30 text-purple-100"
                >
                  🔷 Polygon
                </Button>
                <Button
                  onClick={() => switchNetwork(1)} // Placeholder for Canopy
                  variant="outline"
                  className="bg-green-900/30 border-green-500/30 text-green-100"
                >
                  🌿 Canopy
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

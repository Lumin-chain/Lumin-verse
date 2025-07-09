"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Vote, Plus, Clock, CheckCircle, XCircle } from "lucide-react"

interface GameStats {
  totalPoints: number
  lumTokens: number
  level: number
  streak: number
  nftsOwned: number
  puzzlesSolved: number
}

interface Proposal {
  id: string
  title: string
  description: string
  category: string
  proposer: string
  votesFor: number
  votesAgainst: number
  totalVotes: number
  status: "active" | "passed" | "rejected" | "pending"
  timeLeft: string
  requiredTokens: number
}

interface DAOGovernanceProps {
  userStats: GameStats
}

export default function DAOGovernance({ userStats }: DAOGovernanceProps) {
  const [activeTab, setActiveTab] = useState("proposals")
  const [showCreateProposal, setShowCreateProposal] = useState(false)
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    category: "",
  })

  const [proposals] = useState<Proposal[]>([
    {
      id: "1",
      title: "Add Multiplayer Battle Arena",
      description: "Implement real-time PvP battles with ranked matchmaking and seasonal rewards.",
      category: "Game Features",
      proposer: "CryptoPuzzler",
      votesFor: 15420,
      votesAgainst: 3200,
      totalVotes: 18620,
      status: "active",
      timeLeft: "2 days",
      requiredTokens: 100,
    },
    {
      id: "2",
      title: "Increase Daily Challenge Rewards",
      description: "Boost daily challenge rewards from 50 $LUM to 100 $LUM to encourage more participation.",
      category: "Tokenomics",
      proposer: "LogicMaster",
      votesFor: 12890,
      votesAgainst: 8750,
      totalVotes: 21640,
      status: "active",
      timeLeft: "5 days",
      requiredTokens: 50,
    },
    {
      id: "3",
      title: "New Puzzle Category: Physics Simulations",
      description: "Add physics-based puzzle games with gravity, momentum, and collision mechanics.",
      category: "Game Features",
      proposer: "PhysicsWiz",
      votesFor: 8900,
      votesAgainst: 2100,
      totalVotes: 11000,
      status: "passed",
      timeLeft: "Completed",
      requiredTokens: 75,
    },
    {
      id: "4",
      title: "Reduce NFT Minting Threshold",
      description: "Lower the Grade 5 NFT minting requirement to Grade 3 to make rewards more accessible.",
      category: "NFT & Rewards",
      proposer: "AccessibleGaming",
      votesFor: 5200,
      votesAgainst: 14800,
      totalVotes: 20000,
      status: "rejected",
      timeLeft: "Completed",
      requiredTokens: 25,
    },
  ])

  const votingPower = Math.floor(userStats.lumTokens)
  const canCreateProposal = userStats.lumTokens >= 10

  const handleVote = (proposalId: string, voteType: "for" | "against") => {
    // In a real implementation, this would interact with the smart contract
    console.log(`Voting ${voteType} on proposal ${proposalId} with ${votingPower} voting power`)
  }

  const handleCreateProposal = () => {
    if (!canCreateProposal) return

    // In a real implementation, this would create a proposal on the blockchain
    console.log("Creating proposal:", newProposal)
    setShowCreateProposal(false)
    setNewProposal({ title: "", description: "", category: "" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "passed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />
      case "passed":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* DAO Header */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <span>LUMIN DAO Governance</span>
            <span className="text-xl animate-pulse">⚡</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-purple-300">{votingPower}</div>
              <div className="text-sm text-purple-400">Your Voting Power</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-300">
                {proposals.filter((p) => p.status === "active").length}
              </div>
              <div className="text-sm text-blue-400">Active Proposals</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-green-300">
                {proposals.filter((p) => p.status === "passed").length}
              </div>
              <div className="text-sm text-green-400">Passed Proposals</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-yellow-300">50,000</div>
              <div className="text-sm text-yellow-400">Total $LUM in Treasury</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
          <TabsTrigger value="proposals" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            📋 Proposals
          </TabsTrigger>
          <TabsTrigger value="treasury" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            💰 Treasury
          </TabsTrigger>
          <TabsTrigger value="history" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            📊 History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white text-xl font-semibold">Active Proposals</h3>
            <Button
              onClick={() => setShowCreateProposal(true)}
              disabled={!canCreateProposal}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          </div>

          {!canCreateProposal && (
            <Card className="bg-yellow-500/20 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="text-yellow-300 text-sm">
                  💡 You need at least 10 $LUM tokens to create proposals. Current balance:{" "}
                  {userStats.lumTokens.toFixed(1)} $LUM
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-white text-lg">{proposal.title}</CardTitle>
                        <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1`}>
                          {getStatusIcon(proposal.status)}
                          {proposal.status}
                        </Badge>
                      </div>
                      <div className="text-white/70 text-sm mb-2">{proposal.description}</div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>By: {proposal.proposer}</span>
                        <span>Category: {proposal.category}</span>
                        <span>Time left: {proposal.timeLeft}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-white">
                        <span>For: {proposal.votesFor.toLocaleString()}</span>
                        <span>Against: {proposal.votesAgainst.toLocaleString()}</span>
                      </div>
                      <Progress value={(proposal.votesFor / proposal.totalVotes) * 100} className="h-2 bg-white/10" />
                      <div className="text-center text-xs text-white/60">
                        {proposal.totalVotes.toLocaleString()} total votes
                      </div>
                    </div>

                    {proposal.status === "active" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVote(proposal.id, "for")}
                          disabled={votingPower < proposal.requiredTokens}
                          className="flex-1 bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
                          variant="outline"
                        >
                          <Vote className="h-4 w-4 mr-2" />
                          Vote For
                        </Button>
                        <Button
                          onClick={() => handleVote(proposal.id, "against")}
                          disabled={votingPower < proposal.requiredTokens}
                          className="flex-1 bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                          variant="outline"
                        >
                          <Vote className="h-4 w-4 mr-2" />
                          Vote Against
                        </Button>
                      </div>
                    )}

                    {votingPower < proposal.requiredTokens && proposal.status === "active" && (
                      <div className="text-yellow-300 text-xs text-center">
                        Need {proposal.requiredTokens} $LUM to vote (you have {votingPower})
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="treasury" className="space-y-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Treasury Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <div className="text-2xl font-bold text-yellow-300">50,000 $LUM</div>
                  <div className="text-sm text-yellow-400">Total Treasury</div>
                </div>
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-300">2,500 $LUM</div>
                  <div className="text-sm text-blue-400">Monthly Inflow</div>
                </div>
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="text-2xl font-bold text-green-300">1,800 $LUM</div>
                  <div className="text-sm text-green-400">Monthly Outflow</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-semibold">Recent Treasury Activities</h4>
                {[
                  { action: "Game Development Fund", amount: "-500 $LUM", type: "expense" },
                  { action: "Daily Challenge Rewards", amount: "-300 $LUM", type: "expense" },
                  { action: "NFT Sales Revenue", amount: "+1,200 $LUM", type: "income" },
                  { action: "Tournament Prize Pool", amount: "-800 $LUM", type: "expense" },
                ].map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white">{activity.action}</span>
                    <span className={`font-bold ${activity.type === "income" ? "text-green-400" : "text-red-400"}`}>
                      {activity.amount}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Governance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposals
                  .filter((p) => p.status !== "active")
                  .map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-semibold">{proposal.title}</div>
                        <div className="text-white/60 text-sm">By {proposal.proposer}</div>
                      </div>
                      <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1`}>
                        {getStatusIcon(proposal.status)}
                        {proposal.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Proposal Modal */}
      {showCreateProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Create New Proposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter proposal title..."
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-white">
                  Category
                </Label>
                <Select
                  value={newProposal.category}
                  onValueChange={(value) => setNewProposal({ ...newProposal, category: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="game-features">Game Features</SelectItem>
                    <SelectItem value="tokenomics">Tokenomics</SelectItem>
                    <SelectItem value="nft-rewards">NFT & Rewards</SelectItem>
                    <SelectItem value="governance">Governance</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white min-h-[100px]"
                  placeholder="Describe your proposal in detail..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateProposal}
                  disabled={!newProposal.title || !newProposal.description || !newProposal.category}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Create Proposal (Cost: 10 $LUM)
                </Button>
                <Button
                  onClick={() => setShowCreateProposal(false)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

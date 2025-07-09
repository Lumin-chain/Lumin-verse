"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DAOGovernanceProps {
  userStats: {
    lumTokens: number
    level: number
  }
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
  endDate: string
  status: "active" | "passed" | "failed" | "executed"
  emoji: string
}

export default function DAOGovernance({ userStats }: DAOGovernanceProps) {
  const [selectedProposal, setSelectedProposal] = useState<string>("")
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    category: "",
    requestedAmount: "",
  })

  const proposals: Proposal[] = [
    {
      id: "1",
      title: "Add Chess Puzzles to LumLogic",
      description: "Integrate chess-based logic puzzles with AI-powered difficulty scaling and tournament modes.",
      category: "Game Feature",
      proposer: "0x1234...5678",
      votesFor: 750,
      votesAgainst: 250,
      totalVotes: 1000,
      endDate: "2024-02-15",
      status: "active",
      emoji: "♟️",
    },
    {
      id: "2",
      title: "Increase Daily Reward Pool by 25%",
      description: "Boost daily challenge rewards to incentivize more active participation in the ecosystem.",
      category: "Tokenomics",
      proposer: "0x2345...6789",
      votesFor: 1200,
      votesAgainst: 300,
      totalVotes: 1500,
      endDate: "2024-02-20",
      status: "active",
      emoji: "💰",
    },
    {
      id: "3",
      title: "Partnership with Cosmic Academy",
      description: "Strategic partnership to create educational puzzle content and expand user base.",
      category: "Partnership",
      proposer: "0x3456...7890",
      votesFor: 2100,
      votesAgainst: 400,
      totalVotes: 2500,
      endDate: "2024-01-30",
      status: "passed",
      emoji: "🤝",
    },
  ]

  const votingPower = Math.floor(userStats.lumTokens * 1.5) // 1.5 votes per LUM token
  const canCreateProposal = userStats.lumTokens >= 10 // Minimum 10 LUM to create proposal

  const handleVote = (proposalId: string, support: boolean) => {
    // Implement voting logic
    console.log(`Voting ${support ? "for" : "against"} proposal ${proposalId}`)
  }

  const handleCreateProposal = () => {
    if (!canCreateProposal) return
    // Implement proposal creation logic
    console.log("Creating proposal:", newProposal)
  }

  return (
    <div className="space-y-6">
      {/* DAO Header */}
      <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <span>LUMIN DAO Governance</span>
            <span className="text-2xl animate-pulse">⚡</span>
          </CardTitle>
          <CardDescription className="text-indigo-300">
            Shape the future of the LUMIN ecosystem through decentralized governance! 🌌
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-indigo-800/20 rounded-lg">
              <div className="text-2xl mb-2">🗳️</div>
              <div className="text-2xl font-bold text-indigo-300">{votingPower}</div>
              <div className="text-sm text-indigo-400">Your Voting Power</div>
            </div>
            <div className="text-center p-4 bg-purple-800/20 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-2xl font-bold text-purple-300">
                {proposals.filter((p) => p.status === "active").length}
              </div>
              <div className="text-sm text-purple-400">Active Proposals</div>
            </div>
            <div className="text-center p-4 bg-pink-800/20 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-2xl font-bold text-pink-300">
                {proposals.filter((p) => p.status === "passed").length}
              </div>
              <div className="text-sm text-pink-400">Passed Proposals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="proposals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
          <TabsTrigger value="proposals" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            📋 Proposals
          </TabsTrigger>
          <TabsTrigger value="create" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            ✨ Create
          </TabsTrigger>
          <TabsTrigger value="treasury" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            💎 Treasury
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          {proposals.map((proposal) => {
            const forPercentage = (proposal.votesFor / proposal.totalVotes) * 100
            const againstPercentage = (proposal.votesAgainst / proposal.totalVotes) * 100

            return (
              <Card
                key={proposal.id}
                className="bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm hover:bg-purple-800/40 transition-all"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{proposal.emoji}</span>
                      <div>
                        <CardTitle className="text-white text-lg">{proposal.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-blue-500/20 text-blue-400">{proposal.category}</Badge>
                          <Badge
                            className={`${
                              proposal.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : proposal.status === "passed"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {proposal.status === "active"
                              ? "🟢 Active"
                              : proposal.status === "passed"
                                ? "✅ Passed"
                                : "❌ Failed"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-purple-300">
                      <div>Ends: {proposal.endDate}</div>
                      <div>By: {proposal.proposer}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-purple-200">{proposal.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">
                        ✅ For: {forPercentage.toFixed(1)}% ({proposal.votesFor} votes)
                      </span>
                      <span className="text-red-400">
                        ❌ Against: {againstPercentage.toFixed(1)}% ({proposal.votesAgainst} votes)
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={forPercentage} className="h-3 bg-red-900/50" />
                      <div
                        className="absolute inset-0 bg-green-500/30 rounded-full"
                        style={{ width: `${forPercentage}%` }}
                      />
                    </div>
                  </div>

                  {proposal.status === "active" && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleVote(proposal.id, true)}
                        className="flex-1 bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
                        disabled={votingPower === 0}
                      >
                        ✅ Vote For ({votingPower} votes)
                      </Button>
                      <Button
                        onClick={() => handleVote(proposal.id, false)}
                        className="flex-1 bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                        disabled={votingPower === 0}
                      >
                        ❌ Vote Against ({votingPower} votes)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-3xl">✨</span>
                <span>Create New Proposal</span>
              </CardTitle>
              <CardDescription className="text-purple-300">
                {canCreateProposal
                  ? "Submit your ideas to improve the LUMIN ecosystem! 🚀"
                  : `You need at least 10 $LUM tokens to create proposals. Current: ${userStats.lumTokens.toFixed(1)} $LUM`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">📝 Proposal Title</label>
                <Input
                  placeholder="Enter proposal title..."
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                  className="bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-300"
                  disabled={!canCreateProposal}
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">📂 Category</label>
                <Select
                  value={newProposal.category}
                  onValueChange={(value) => setNewProposal({ ...newProposal, category: value })}
                  disabled={!canCreateProposal}
                >
                  <SelectTrigger className="bg-purple-900/30 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="game-feature">🎮 Game Feature</SelectItem>
                    <SelectItem value="tokenomics">💰 Tokenomics</SelectItem>
                    <SelectItem value="governance">🏛️ Governance</SelectItem>
                    <SelectItem value="partnership">🤝 Partnership</SelectItem>
                    <SelectItem value="treasury">💎 Treasury</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">📄 Description</label>
                <Textarea
                  placeholder="Describe your proposal in detail..."
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  className="bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-300 h-32"
                  disabled={!canCreateProposal}
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">💰 Requested Amount (if applicable)</label>
                <Input
                  placeholder="Amount in $LUM tokens..."
                  value={newProposal.requestedAmount}
                  onChange={(e) => setNewProposal({ ...newProposal, requestedAmount: e.target.value })}
                  className="bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-300"
                  disabled={!canCreateProposal}
                />
              </div>

              <Button
                onClick={handleCreateProposal}
                disabled={!canCreateProposal || !newProposal.title || !newProposal.category}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold py-3"
              >
                🚀 Submit Proposal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treasury" className="space-y-4">
          <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-3xl">💎</span>
                <span>DAO Treasury</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-white font-semibold text-lg">💰 Treasury Balance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-yellow-800/20 rounded-lg">
                      <span className="text-yellow-300">$LUM Tokens</span>
                      <span className="text-yellow-400 font-bold">2,500,000 $LUM</span>
                    </div>
                    <div className="flex justify-between p-3 bg-blue-800/20 rounded-lg">
                      <span className="text-blue-300">ETH</span>
                      <span className="text-blue-400 font-bold">150.5 ETH</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-800/20 rounded-lg">
                      <span className="text-green-300">USDC</span>
                      <span className="text-green-400 font-bold">$500,000 USDC</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-white font-semibold text-lg">📊 Recent Transactions</h3>
                  <div className="space-y-2">
                    {[
                      { type: "Reward Distribution", amount: "-50,000 $LUM", date: "2024-01-28" },
                      { type: "Partnership Payment", amount: "-25 ETH", date: "2024-01-25" },
                      { type: "Development Fund", amount: "-$100,000 USDC", date: "2024-01-20" },
                    ].map((tx, index) => (
                      <div key={index} className="flex justify-between p-2 bg-purple-800/20 rounded text-sm">
                        <span className="text-purple-300">{tx.type}</span>
                        <div className="text-right">
                          <div className="text-red-400">{tx.amount}</div>
                          <div className="text-purple-400 text-xs">{tx.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

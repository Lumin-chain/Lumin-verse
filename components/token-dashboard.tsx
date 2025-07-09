"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coins, TrendingUp, Lock, Gift, ArrowUpRight, Zap, Trophy } from "lucide-react"

interface TokenDashboardProps {
  userStats: {
    totalPoints: number
    lumTokens: number
    level: number
    streak: number
    nftsOwned: number
    puzzlesSolved: number
  }
}

export default function TokenDashboard({ userStats }: TokenDashboardProps) {
  const stakingAPY = 12.5
  const stakedAmount = 25.3
  const availableForStaking = userStats.lumTokens - stakedAmount

  return (
    <div className="space-y-6">
      {/* Token Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-400" />
              $LUM Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{userStats.lumTokens.toFixed(2)}</div>
            <div className="text-sm text-white/70">≈ ${(userStats.lumTokens * 0.45).toFixed(2)} USD</div>
            <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              +12.5% (24h)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-400" />
              Staked $LUM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400 mb-2">{stakedAmount.toFixed(2)}</div>
            <div className="text-sm text-white/70">APY: {stakingAPY}%</div>
            <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
              <TrendingUp className="h-4 w-4" />
              +0.12 $LUM earned
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-400" />
              Rewards Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400 mb-2">{(userStats.totalPoints * 0.01).toFixed(2)}</div>
            <div className="text-sm text-white/70">From {userStats.puzzlesSolved} puzzles</div>
            <div className="flex items-center gap-1 mt-2 text-blue-400 text-sm">
              <Zap className="h-4 w-4" />
              {userStats.streak} day streak
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="staking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
          <TabsTrigger value="staking" className="text-white data-[state=active]:bg-white/20">
            Staking
          </TabsTrigger>
          <TabsTrigger value="rewards" className="text-white data-[state=active]:bg-white/20">
            Rewards
          </TabsTrigger>
          <TabsTrigger value="governance" className="text-white data-[state=active]:bg-white/20">
            Governance
          </TabsTrigger>
          <TabsTrigger value="history" className="text-white data-[state=active]:bg-white/20">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staking" className="space-y-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Stake $LUM Tokens</CardTitle>
              <CardDescription className="text-white/70">
                Earn {stakingAPY}% APY and unlock premium features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-semibold">Available to Stake</div>
                  <div className="text-2xl font-bold text-yellow-400">{availableForStaking.toFixed(2)} $LUM</div>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Stake Tokens
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-white">
                  <span>Currently Staked</span>
                  <span>{stakedAmount} $LUM</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Estimated Daily Rewards</span>
                  <span className="text-green-400">+{((stakedAmount * stakingAPY) / 365 / 100).toFixed(4)} $LUM</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Unlock Date</span>
                  <span>Available anytime</span>
                </div>
              </div>

              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                Unstake Tokens
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Staking Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div className="text-white">
                  <div className="font-semibold">Premium Puzzles</div>
                  <div className="text-sm text-white/70">Access exclusive puzzle packs</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div className="text-white">
                  <div className="font-semibold">Governance Rights</div>
                  <div className="text-sm text-white/70">Vote on platform decisions</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Gift className="h-4 w-4 text-white" />
                </div>
                <div className="text-white">
                  <div className="font-semibold">Exclusive NFTs</div>
                  <div className="text-sm text-white/70">Rare collectibles and avatars</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: "Puzzle Completion", amount: "+2.5 $LUM", time: "2 hours ago", icon: "🧩" },
                { type: "Daily Streak Bonus", amount: "+5.0 $LUM", time: "1 day ago", icon: "🔥" },
                { type: "PvP Victory", amount: "+7.5 $LUM", time: "2 days ago", icon: "⚔️" },
                { type: "Staking Rewards", amount: "+0.12 $LUM", time: "3 days ago", icon: "💎" },
              ].map((reward, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reward.icon}</span>
                    <div className="text-white">
                      <div className="font-semibold">{reward.type}</div>
                      <div className="text-sm text-white/70">{reward.time}</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-semibold">{reward.amount}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Active Proposals</CardTitle>
              <CardDescription className="text-white/70">
                Vote on platform improvements and new features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Add Chess Puzzles to LumLogic</h3>
                  <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                </div>
                <p className="text-white/70 text-sm">
                  Proposal to integrate chess-based logic puzzles into the LumLogic game category.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/70">
                    <span>Yes: 75%</span>
                    <span>No: 25%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    Vote Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Vote No
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: "Reward", amount: "+2.5 $LUM", hash: "0x1234...5678", time: "2 hours ago" },
                { type: "Stake", amount: "-10.0 $LUM", hash: "0x2345...6789", time: "1 day ago" },
                { type: "NFT Purchase", amount: "-5.0 $LUM", hash: "0x3456...7890", time: "3 days ago" },
                { type: "Reward", amount: "+7.5 $LUM", hash: "0x4567...8901", time: "5 days ago" },
              ].map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="text-white">
                    <div className="font-semibold">{tx.type}</div>
                    <div className="text-sm text-white/70">{tx.hash}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${tx.amount.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                      {tx.amount}
                    </div>
                    <div className="text-sm text-white/70">{tx.time}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

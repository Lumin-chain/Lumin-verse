"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
        <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 backdrop-blur-sm hover:scale-105 transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <span>$LUM Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-300 mb-2 flex items-center gap-2">
              {userStats.lumTokens.toFixed(2)}
              <span className="text-lg animate-pulse">✨</span>
            </div>
            <div className="text-sm text-yellow-400">≈ ${(userStats.lumTokens * 0.45).toFixed(2)} USD</div>
            <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
              <span>📈</span>
              <span>+12.5% (24h)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <span>Staked $LUM</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-300 mb-2 flex items-center gap-2">
              {stakedAmount.toFixed(2)}
              <span className="text-lg animate-bounce">💎</span>
            </div>
            <div className="text-sm text-purple-400">APY: {stakingAPY}% 🚀</div>
            <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
              <span>⬆️</span>
              <span>+0.12 $LUM earned</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 backdrop-blur-sm hover:scale-105 transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <span>Rewards Earned</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-300 mb-2 flex items-center gap-2">
              {(userStats.totalPoints * 0.01).toFixed(2)}
              <span className="text-lg animate-pulse">🌟</span>
            </div>
            <div className="text-sm text-orange-400">From {userStats.puzzlesSolved} puzzles 🧩</div>
            <div className="flex items-center gap-1 mt-2 text-blue-400 text-sm">
              <span>🔥</span>
              <span>{userStats.streak} day streak</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="staking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
          <TabsTrigger value="staking" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            🔒 Staking
          </TabsTrigger>
          <TabsTrigger value="rewards" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            🎁 Rewards
          </TabsTrigger>
          <TabsTrigger value="governance" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            🗳️ Governance
          </TabsTrigger>
          <TabsTrigger value="history" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            📜 History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staking" className="space-y-4">
          <Card className="bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <span>Stake $LUM Tokens</span>
              </CardTitle>
              <CardDescription className="text-purple-300">
                Earn {stakingAPY}% APY and unlock premium features ✨
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-800/20 rounded-lg border border-purple-500/20">
                <div>
                  <div className="text-white font-semibold flex items-center gap-2">
                    <span>💰</span>
                    <span>Available to Stake</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-300 flex items-center gap-2">
                    {availableForStaking.toFixed(2)} $LUM
                    <span className="text-lg animate-pulse">✨</span>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold">
                  🚀 Stake Tokens
                </Button>
              </div>

              <div className="space-y-3 p-4 bg-purple-800/10 rounded-lg">
                <div className="flex justify-between text-white">
                  <span className="flex items-center gap-2">
                    <span>🔒</span>
                    <span>Currently Staked</span>
                  </span>
                  <span className="text-purple-300">{stakedAmount} $LUM</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="flex items-center gap-2">
                    <span>📈</span>
                    <span>Daily Rewards</span>
                  </span>
                  <span className="text-green-400">+{((stakedAmount * stakingAPY) / 365 / 100).toFixed(4)} $LUM</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="flex items-center gap-2">
                    <span>⏰</span>
                    <span>Unlock Date</span>
                  </span>
                  <span className="text-blue-300">Available anytime</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-red-900/30 border-red-500/30 text-red-300 hover:bg-red-800/40"
              >
                🔓 Unstake Tokens
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <span>Staking Benefits</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-purple-800/20 rounded-lg border border-purple-500/20">
                <div className="text-3xl">⚡</div>
                <div className="text-white">
                  <div className="font-semibold">Premium Puzzles</div>
                  <div className="text-sm text-purple-300">Access exclusive puzzle packs 🧩</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-800/20 rounded-lg border border-blue-500/20">
                <div className="text-3xl">🗳️</div>
                <div className="text-white">
                  <div className="font-semibold">Governance Rights</div>
                  <div className="text-sm text-blue-300">Vote on platform decisions 🏛️</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-800/20 rounded-lg border border-green-500/20">
                <div className="text-3xl">🎨</div>
                <div className="text-white">
                  <div className="font-semibold">Exclusive NFTs</div>
                  <div className="text-sm text-green-300">Rare collectibles and avatars 👑</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <span>Recent Rewards</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: "Puzzle Completion", amount: "+2.5 $LUM", time: "2 hours ago", icon: "🧩" },
                { type: "Daily Streak Bonus", amount: "+5.0 $LUM", time: "1 day ago", icon: "🔥" },
                { type: "PvP Victory", amount: "+7.5 $LUM", time: "2 days ago", icon: "⚔️" },
                { type: "Staking Rewards", amount: "+0.12 $LUM", time: "3 days ago", icon: "💎" },
              ].map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-purple-800/20 rounded-lg border border-purple-500/20 hover:bg-purple-700/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{reward.icon}</span>
                    <div className="text-white">
                      <div className="font-semibold">{reward.type}</div>
                      <div className="text-sm text-purple-300">{reward.time}</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold text-lg">{reward.amount}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-2xl">🗳️</span>
                <span>Active Proposals</span>
              </CardTitle>
              <CardDescription className="text-indigo-300">
                Vote on platform improvements and new features 🚀
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-indigo-800/20 rounded-lg border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <span>♟️</span>
                    <span>Add Chess Puzzles to LumLogic</span>
                  </h3>
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">🟢 Active</Badge>
                </div>
                <p className="text-indigo-300 text-sm">
                  Proposal to integrate chess-based logic puzzles into the LumLogic game category. 🧠
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-indigo-300">
                    <span>✅ Yes: 75%</span>
                    <span>❌ No: 25%</span>
                  </div>
                  <Progress value={75} className="h-3 bg-indigo-900/50" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 font-bold">
                    ✅ Vote Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-900/30 border-red-500/30 text-red-300 hover:bg-red-800/40"
                  >
                    ❌ Vote No
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-900/30 to-purple-900/30 border border-slate-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <span>Transaction History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: "Reward", amount: "+2.5 $LUM", hash: "0x1234...5678", time: "2 hours ago", icon: "🎁" },
                { type: "Stake", amount: "-10.0 $LUM", hash: "0x2345...6789", time: "1 day ago", icon: "🔒" },
                { type: "NFT Purchase", amount: "-5.0 $LUM", hash: "0x3456...7890", time: "3 days ago", icon: "🎨" },
                { type: "Reward", amount: "+7.5 $LUM", hash: "0x4567...8901", time: "5 days ago", icon: "🏆" },
              ].map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800/20 rounded-lg border border-slate-500/20 hover:bg-slate-700/30 transition-all"
                >
                  <div className="text-white flex items-center gap-3">
                    <span className="text-2xl">{tx.icon}</span>
                    <div>
                      <div className="font-semibold">{tx.type}</div>
                      <div className="text-sm text-slate-400 font-mono">{tx.hash}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold text-lg ${tx.amount.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                    >
                      {tx.amount}
                    </div>
                    <div className="text-sm text-slate-400">{tx.time}</div>
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

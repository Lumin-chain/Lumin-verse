"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Puzzle, Coins, Trophy, Brain, Gamepad2, Zap, Star, Target } from "lucide-react"
import SudokuGame from "@/components/games/sudoku-game"
import WordSearchGame from "@/components/games/word-search-game"
import MatchGame from "@/components/games/match-game"
import LogicCircuitGame from "@/components/games/logic-circuit-game"
import TriviaGame from "@/components/games/trivia-game"
import WalletConnect from "@/components/wallet-connect"
import TokenDashboard from "@/components/token-dashboard"
import NFTMarketplace from "@/components/nft-marketplace"

interface GameStats {
  totalPoints: number
  lumTokens: number
  level: number
  streak: number
  nftsOwned: number
  puzzlesSolved: number
}

export default function LuminApp() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [userStats, setUserStats] = useState<GameStats>({
    totalPoints: 1250,
    lumTokens: 45.7,
    level: 12,
    streak: 7,
    nftsOwned: 3,
    puzzlesSolved: 89,
  })

  const games = [
    {
      id: "lumlogic",
      name: "LumLogic",
      description: "Sudoku & Logic Puzzles",
      icon: Brain,
      color: "bg-blue-500",
      component: SudokuGame,
    },
    {
      id: "lumword",
      name: "LumWord",
      description: "Word Games & Puzzles",
      icon: Puzzle,
      color: "bg-green-500",
      component: WordSearchGame,
    },
    {
      id: "lummatch",
      name: "LumMatch",
      description: "Tile Matching Games",
      icon: Target,
      color: "bg-purple-500",
      component: MatchGame,
    },
    {
      id: "lumcode",
      name: "LumCode",
      description: "Logic Circuits & Binary",
      icon: Zap,
      color: "bg-orange-500",
      component: LogicCircuitGame,
    },
    {
      id: "lumtrivia",
      name: "LumTrivia",
      description: "AI-Generated Quizzes",
      icon: Gamepad2,
      color: "bg-red-500",
      component: TriviaGame,
    },
  ]

  const handleGameComplete = (gameId: string, score: number, timeElapsed: number) => {
    const basePoints = 100
    const timeBonus = Math.max(0, 300 - timeElapsed) // Bonus for speed
    const totalPoints = basePoints + timeBonus
    const lumEarned = totalPoints * 0.01 // Convert points to LUM tokens

    setUserStats((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + totalPoints,
      lumTokens: prev.lumTokens + lumEarned,
      puzzlesSolved: prev.puzzlesSolved + 1,
      streak: prev.streak + 1,
    }))

    setActiveGame(null)
  }

  if (activeGame) {
    const game = games.find((g) => g.id === activeGame)
    if (game) {
      const GameComponent = game.component
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => setActiveGame(null)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                ← Back to Games
              </Button>
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-400" />
                  <span>{userStats.lumTokens.toFixed(1)} $LUM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-400" />
                  <span>{userStats.totalPoints} pts</span>
                </div>
              </div>
            </div>
            <GameComponent onComplete={(score: number, time: number) => handleGameComplete(activeGame, score, time)} />
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Puzzle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">LUMIN</h1>
              <p className="text-white/70">Web3 Puzzleverse</p>
            </div>
          </div>
          <WalletConnect isConnected={isConnected} onConnect={setIsConnected} />
        </div>

        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
            <TabsTrigger value="games" className="text-white data-[state=active]:bg-white/20">
              Games
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-white/20">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="text-white data-[state=active]:bg-white/20">
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-white data-[state=active]:bg-white/20">
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{userStats.level}</div>
                  <div className="text-sm text-white/70">Level</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{userStats.lumTokens.toFixed(1)}</div>
                  <div className="text-sm text-white/70">$LUM</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{userStats.totalPoints}</div>
                  <div className="text-sm text-white/70">Points</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{userStats.streak}</div>
                  <div className="text-sm text-white/70">Streak</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{userStats.nftsOwned}</div>
                  <div className="text-sm text-white/70">NFTs</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{userStats.puzzlesSolved}</div>
                  <div className="text-sm text-white/70">Solved</div>
                </CardContent>
              </Card>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => {
                const IconComponent = game.icon
                return (
                  <Card
                    key={game.id}
                    className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${game.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white">{game.name}</CardTitle>
                          <CardDescription className="text-white/70">{game.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold"
                        onClick={() => setActiveGame(game.id)}
                      >
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Daily Challenges */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Daily Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="text-white">
                    <div className="font-semibold">Complete 3 Sudoku puzzles</div>
                    <div className="text-sm text-white/70">Progress: 2/3</div>
                  </div>
                  <Badge className="bg-yellow-500 text-black">+50 $LUM</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="text-white">
                    <div className="font-semibold">Win 2 PvP matches</div>
                    <div className="text-sm text-white/70">Progress: 0/2</div>
                  </div>
                  <Badge className="bg-purple-500 text-white">NFT Reward</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard">
            <TokenDashboard userStats={userStats} />
          </TabsContent>

          <TabsContent value="marketplace">
            <NFTMarketplace />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Global Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { rank: 1, name: "CryptoPuzzler", points: 15420, avatar: "CP" },
                  { rank: 2, name: "LogicMaster", points: 12890, avatar: "LM" },
                  { rank: 3, name: "WordWizard", points: 11250, avatar: "WW" },
                  { rank: 4, name: "You", points: userStats.totalPoints, avatar: "YU" },
                  { rank: 5, name: "BrainTeaser", points: 9870, avatar: "BT" },
                ].map((player) => (
                  <div key={player.rank} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">#{player.rank}</div>
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {player.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-white">
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-white/70">{player.points.toLocaleString()} points</div>
                    </div>
                    {player.name === "You" && <Badge className="bg-green-500 text-white">You</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

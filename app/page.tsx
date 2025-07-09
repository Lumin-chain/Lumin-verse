"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import SudokuGame from "@/components/games/sudoku-game"
import WordSearchGame from "@/components/games/word-search-game"
import MatchGame from "@/components/games/match-game"
import LogicCircuitGame from "@/components/games/logic-circuit-game"
import TriviaGame from "@/components/games/trivia-game"
import WalletConnect from "@/components/wallet-connect"
import TokenDashboard from "@/components/token-dashboard"
import NFTMarketplace from "@/components/nft-marketplace"
import GameTutorial from "@/components/game-tutorial"
import AchievementsPanel from "@/components/achievements-panel"
import DAOGovernance from "@/components/dao-governance"
import DEXWithdrawal from "@/components/dex-withdrawal"
import ParticleBackground from "@/components/particle-background"
import SoundManager from "@/components/sound-manager"
import { useSound } from "@/hooks/use-sound"
import { useAchievements } from "@/hooks/use-achievements"

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
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialGame, setTutorialGame] = useState<string>("")
  const [isMobile, setIsMobile] = useState(false)
  const [userStats, setUserStats] = useState<GameStats>({
    totalPoints: 1250,
    lumTokens: 45.7,
    level: 12,
    streak: 7,
    nftsOwned: 3,
    puzzlesSolved: 89,
  })

  const { playSound } = useSound()
  const { checkAchievements, newAchievements } = useAchievements()

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const games = [
    {
      id: "lumlogic",
      name: "LumLogic",
      description: "Sudoku & Logic Puzzles",
      icon: "🧠",
      emoji: "🔮",
      color: "from-blue-400 to-cyan-400",
      bgGlow: "shadow-blue-500/50",
      component: SudokuGame,
      tutorial: "Master the art of logical deduction! Place numbers 1-9 in each row, column, and 3x3 box.",
    },
    {
      id: "lumword",
      name: "LumWord",
      description: "Word Games & Puzzles",
      icon: "📝",
      emoji: "🌟",
      color: "from-green-400 to-emerald-400",
      bgGlow: "shadow-green-500/50",
      component: WordSearchGame,
      tutorial: "Find hidden words in the cosmic grid! Drag to select words horizontally, vertically, or diagonally.",
    },
    {
      id: "lummatch",
      name: "LumMatch",
      description: "Tile Matching Games",
      icon: "🎯",
      emoji: "💫",
      color: "from-purple-400 to-pink-400",
      bgGlow: "shadow-purple-500/50",
      component: MatchGame,
      tutorial: "Match pairs of cosmic symbols! Click cards to flip them and find matching pairs.",
    },
    {
      id: "lumcode",
      name: "LumCode",
      description: "Logic Circuits & Binary",
      icon: "⚡",
      emoji: "🚀",
      color: "from-orange-400 to-red-400",
      bgGlow: "shadow-orange-500/50",
      component: LogicCircuitGame,
      tutorial: "Build logic circuits! Connect gates to create the target truth table output.",
    },
    {
      id: "lumtrivia",
      name: "LumTrivia",
      description: "AI-Generated Quizzes",
      icon: "🎮",
      emoji: "🌌",
      color: "from-indigo-400 to-purple-400",
      bgGlow: "shadow-indigo-500/50",
      component: TriviaGame,
      tutorial: "Test your knowledge across the galaxy! Answer questions quickly for bonus points.",
    },
  ]

  const handleGameComplete = (gameId: string, score: number, timeElapsed: number) => {
    const basePoints = 100
    const timeBonus = Math.max(0, 300 - timeElapsed)
    const totalPoints = basePoints + timeBonus
    const lumEarned = totalPoints * 0.01

    playSound("gameComplete")

    const newStats = {
      ...userStats,
      totalPoints: userStats.totalPoints + totalPoints,
      lumTokens: userStats.lumTokens + lumEarned,
      puzzlesSolved: userStats.puzzlesSolved + 1,
      streak: userStats.streak + 1,
    }

    setUserStats(newStats)
    checkAchievements(newStats, gameId)
    setActiveGame(null)
  }

  const handleGameStart = (gameId: string) => {
    playSound("gameStart")
    setActiveGame(gameId)
  }

  const handleTutorialStart = (gameId: string) => {
    playSound("buttonClick")
    setTutorialGame(gameId)
    setShowTutorial(true)
  }

  if (showTutorial) {
    const game = games.find((g) => g.id === tutorialGame)
    return (
      <GameTutorial
        game={game!}
        onComplete={() => {
          setShowTutorial(false)
          setActiveGame(tutorialGame)
        }}
        onSkip={() => {
          setShowTutorial(false)
          setActiveGame(tutorialGame)
        }}
      />
    )
  }

  if (activeGame) {
    const game = games.find((g) => g.id === activeGame)
    if (game) {
      const GameComponent = game.component
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
          <ParticleBackground />
          <SoundManager />

          <div className="container mx-auto p-2 md:p-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 md:mb-6 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  playSound("buttonClick")
                  setActiveGame(null)
                }}
                className="bg-purple-900/50 border-purple-400/50 text-purple-100 hover:bg-purple-800/50 backdrop-blur-sm w-full md:w-auto"
              >
                🚀 Back to Galaxy
              </Button>
              <div className="flex items-center gap-2 md:gap-4 text-white text-sm md:text-base">
                <div className="flex items-center gap-1 md:gap-2 bg-yellow-500/20 px-2 md:px-3 py-1 rounded-full backdrop-blur-sm">
                  <span className="text-yellow-400">💰</span>
                  <span>{userStats.lumTokens.toFixed(1)} $LUM</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 bg-blue-500/20 px-2 md:px-3 py-1 rounded-full backdrop-blur-sm">
                  <span className="text-blue-400">⭐</span>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <ParticleBackground />
      <SoundManager />

      {/* Achievement Notifications */}
      {newAchievements.length > 0 && <AchievementsPanel achievements={newAchievements} />}

      <div className="container mx-auto p-2 md:p-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center text-2xl md:text-3xl animate-spin-slow shadow-2xl shadow-yellow-500/50">
                🌟
              </div>
              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 text-lg md:text-2xl animate-bounce">
                ✨
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                LUMIN
              </h1>
              <p className="text-purple-300 flex items-center gap-2 text-sm md:text-base">
                <span>🌌</span> Web3 Puzzleverse Galaxy
              </p>
            </div>
          </div>
          <WalletConnect isConnected={isConnected} onConnect={setIsConnected} />
        </div>

        <Tabs defaultValue="games" className="space-y-4 md:space-y-6">
          <TabsList
            className={`grid w-full ${isMobile ? "grid-cols-2" : "grid-cols-6"} bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm`}
          >
            <TabsTrigger
              value="games"
              className="text-purple-100 data-[state=active]:bg-purple-600/50 data-[state=active]:text-white text-xs md:text-sm"
            >
              🎮 Games
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="text-purple-100 data-[state=active]:bg-purple-600/50 data-[state=active]:text-white text-xs md:text-sm"
            >
              📊 Dashboard
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger
                  value="marketplace"
                  className="text-purple-100 data-[state=active]:bg-purple-600/50 data-[state=active]:text-white text-xs md:text-sm"
                >
                  🛒 Market
                </TabsTrigger>
                <TabsTrigger
                  value="dao"
                  className="text-purple-100 data-[state=active]:bg-purple-600/50 data-[state=active]:text-white text-xs md:text-sm"
                >
                  🏛️ DAO
                </TabsTrigger>
                <TabsTrigger
                  value="dex"
                  className="text-purple-100 data-[state=active]:bg-purple-600/50 data-[state=active]:text-white text-xs md:text-sm"
                >
                  💱 DEX
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboard"
                  className="text-purple-100 data-[state=active]:bg-purple-600/50 data-[state=active]:text-white text-xs md:text-sm"
                >
                  🏆 Leaders
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {isMobile && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant="outline"
                className="bg-purple-900/30 border-purple-500/30 text-purple-100 whitespace-nowrap"
                onClick={() => playSound("buttonClick")}
              >
                🛒 Market
              </Button>
              <Button
                variant="outline"
                className="bg-purple-900/30 border-purple-500/30 text-purple-100 whitespace-nowrap"
                onClick={() => playSound("buttonClick")}
              >
                🏛️ DAO
              </Button>
              <Button
                variant="outline"
                className="bg-purple-900/30 border-purple-500/30 text-purple-100 whitespace-nowrap"
                onClick={() => playSound("buttonClick")}
              >
                💱 DEX
              </Button>
              <Button
                variant="outline"
                className="bg-purple-900/30 border-purple-500/30 text-purple-100 whitespace-nowrap"
                onClick={() => playSound("buttonClick")}
              >
                🏆 Leaders
              </Button>
            </div>
          )}

          <TabsContent value="games" className="space-y-4 md:space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
              <Card className="bg-purple-900/30 border-purple-500/30 backdrop-blur-sm hover:bg-purple-800/40 transition-all">
                <CardContent className="p-2 md:p-4 text-center">
                  <div className="text-xl md:text-3xl mb-1 md:mb-2">🎯</div>
                  <div className="text-lg md:text-2xl font-bold text-purple-300">{userStats.level}</div>
                  <div className="text-xs md:text-sm text-purple-400">Level</div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-900/30 border-yellow-500/30 backdrop-blur-sm hover:bg-yellow-800/40 transition-all">
                <CardContent className="p-2 md:p-4 text-center">
                  <div className="text-xl md:text-3xl mb-1 md:mb-2">💰</div>
                  <div className="text-lg md:text-2xl font-bold text-yellow-300">{userStats.lumTokens.toFixed(1)}</div>
                  <div className="text-xs md:text-sm text-yellow-400">$LUM</div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/30 border-blue-500/30 backdrop-blur-sm hover:bg-blue-800/40 transition-all">
                <CardContent className="p-2 md:p-4 text-center">
                  <div className="text-xl md:text-3xl mb-1 md:mb-2">⭐</div>
                  <div className="text-lg md:text-2xl font-bold text-blue-300">{userStats.totalPoints}</div>
                  <div className="text-xs md:text-sm text-blue-400">Points</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-900/30 border-orange-500/30 backdrop-blur-sm hover:bg-orange-800/40 transition-all">
                <CardContent className="p-2 md:p-4 text-center">
                  <div className="text-xl md:text-3xl mb-1 md:mb-2">🔥</div>
                  <div className="text-lg md:text-2xl font-bold text-orange-300">{userStats.streak}</div>
                  <div className="text-xs md:text-sm text-orange-400">Streak</div>
                </CardContent>
              </Card>

              <Card className="bg-pink-900/30 border-pink-500/30 backdrop-blur-sm hover:bg-pink-800/40 transition-all">
                <CardContent className="p-2 md:p-4 text-center">
                  <div className="text-xl md:text-3xl mb-1 md:mb-2">🎨</div>
                  <div className="text-lg md:text-2xl font-bold text-pink-300">{userStats.nftsOwned}</div>
                  <div className="text-xs md:text-sm text-pink-400">NFTs</div>
                </CardContent>
              </Card>

              <Card className="bg-green-900/30 border-green-500/30 backdrop-blur-sm hover:bg-green-800/40 transition-all">
                <CardContent className="p-2 md:p-4 text-center">
                  <div className="text-xl md:text-3xl mb-1 md:mb-2">🧩</div>
                  <div className="text-lg md:text-2xl font-bold text-green-300">{userStats.puzzlesSolved}</div>
                  <div className="text-xs md:text-sm text-green-400">Solved</div>
                </CardContent>
              </Card>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className={`bg-gradient-to-br ${game.color} p-1 hover:scale-105 transition-all duration-300 cursor-pointer group shadow-xl ${game.bgGlow}`}
                >
                  <div className="bg-slate-900/80 rounded-lg p-4 md:p-6 h-full backdrop-blur-sm">
                    <CardHeader className="pb-3 md:pb-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative">
                          <div className="text-3xl md:text-4xl group-hover:animate-bounce">{game.icon}</div>
                          <div className="absolute -top-1 -right-1 text-base md:text-lg animate-pulse">
                            {game.emoji}
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg md:text-xl">{game.name}</CardTitle>
                          <CardDescription className="text-gray-300 text-sm md:text-base">
                            {game.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 md:space-y-3">
                      <Button
                        className={`w-full bg-gradient-to-r ${game.color} hover:scale-105 text-white font-bold py-2 md:py-3 text-sm md:text-lg shadow-lg transition-all duration-300`}
                        onClick={() => handleGameStart(game.id)}
                      >
                        🚀 Launch Game
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs md:text-sm"
                        onClick={() => handleTutorialStart(game.id)}
                      >
                        📚 Tutorial
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {/* Daily Challenges */}
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-lg md:text-xl">
                  <span className="text-xl md:text-2xl">🏆</span>
                  <span>Daily Galaxy Challenges</span>
                  <span className="text-lg md:text-xl animate-pulse">✨</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 bg-purple-800/30 rounded-lg border border-purple-500/20 gap-3">
                  <div className="text-white flex items-center gap-3">
                    <span className="text-xl md:text-2xl">🧩</span>
                    <div>
                      <div className="font-semibold text-sm md:text-base">Complete 3 Sudoku puzzles</div>
                      <div className="text-xs md:text-sm text-purple-300">Progress: 2/3 ⭐⭐⚪</div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500 text-black font-bold px-2 md:px-3 py-1 text-xs md:text-sm">
                    +50 $LUM 💰
                  </Badge>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 bg-pink-800/30 rounded-lg border border-pink-500/20 gap-3">
                  <div className="text-white flex items-center gap-3">
                    <span className="text-xl md:text-2xl">⚔️</span>
                    <div>
                      <div className="font-semibold text-sm md:text-base">Win 2 PvP battles</div>
                      <div className="text-xs md:text-sm text-pink-300">Progress: 0/2 ⚪⚪</div>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-2 md:px-3 py-1 text-xs md:text-sm">
                    NFT Reward 🎨
                  </Badge>
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

          <TabsContent value="dao">
            <DAOGovernance userStats={userStats} />
          </TabsContent>

          <TabsContent value="dex">
            <DEXWithdrawal userStats={userStats} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-lg md:text-xl">
                  <span className="text-xl md:text-2xl">🏆</span>
                  <span>Galactic Leaderboard</span>
                  <span className="text-lg md:text-xl animate-bounce">👑</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {[
                  { rank: 1, name: "CryptoPuzzler", points: 15420, avatar: "🚀", badge: "👑" },
                  { rank: 2, name: "LogicMaster", points: 12890, avatar: "🧠", badge: "🥈" },
                  { rank: 3, name: "WordWizard", points: 11250, avatar: "📝", badge: "🥉" },
                  { rank: 4, name: "You", points: userStats.totalPoints, avatar: "🌟", badge: "⭐" },
                  { rank: 5, name: "BrainTeaser", points: 9870, avatar: "🎯", badge: "🎮" },
                ].map((player) => (
                  <div
                    key={player.rank}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-purple-800/20 rounded-lg border border-purple-500/20 hover:bg-purple-700/30 transition-all"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-yellow-400">#{player.rank}</div>
                    <div className="text-2xl md:text-3xl">{player.badge}</div>
                    <Avatar className="border-2 border-purple-400 w-8 h-8 md:w-10 md:h-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg md:text-xl">
                        {player.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-white">
                      <div className="font-semibold flex items-center gap-2 text-sm md:text-base">
                        {player.name}
                        {player.name === "You" && <span className="text-base md:text-lg">🎯</span>}
                      </div>
                      <div className="text-xs md:text-sm text-purple-300 flex items-center gap-1">
                        <span>⭐</span>
                        {player.points.toLocaleString()} points
                      </div>
                    </div>
                    {player.name === "You" && (
                      <Badge className="bg-green-500 text-white font-bold text-xs md:text-sm">You! 🎉</Badge>
                    )}
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

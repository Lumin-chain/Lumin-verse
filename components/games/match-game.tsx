"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGameLevels } from "@/hooks/use-game-levels"
import { useSound } from "@/hooks/use-sound"

interface MatchGameProps {
  level: number
  onComplete: (score: number, timeElapsed: number) => void
  onBack: () => void
}

export default function MatchGame({ level, onComplete, onBack }: MatchGameProps) {
  const { getLevelConfig } = useGameLevels()
  const { playSound } = useSound()
  const config = getLevelConfig(level)

  const [cards, setCards] = useState<any[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [moves, setMoves] = useState<number>(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [gridSize, setGridSize] = useState({ rows: 4, cols: 4 })

  // Cosmic symbols for cards
  const symbols = [
    "🌟",
    "🌙",
    "⭐",
    "🌍",
    "🪐",
    "☄️",
    "🌌",
    "🚀",
    "👽",
    "🛸",
    "🌠",
    "🔮",
    "💫",
    "🌈",
    "⚡",
    "💎",
    "🔥",
    "❄️",
    "🌊",
    "🌪️",
    "🌋",
    "🏔️",
    "🌺",
    "🦋",
  ]

  // Calculate grid size based on level
  const calculateGridSize = useCallback(() => {
    const totalPairs = Math.min(12, 6 + Math.floor(config.grade / 2))
    const totalCards = totalPairs * 2

    // Find best grid dimensions
    let bestRows = 4,
      bestCols = 4
    for (let rows = 3; rows <= 6; rows++) {
      for (let cols = 3; cols <= 8; cols++) {
        if (rows * cols >= totalCards && rows * cols <= totalCards + 2) {
          if (Math.abs(rows - cols) <= Math.abs(bestRows - bestCols)) {
            bestRows = rows
            bestCols = cols
          }
        }
      }
    }

    return { rows: bestRows, cols: bestCols, pairs: totalPairs }
  }, [config.grade])

  // Generate cards
  const generateCards = useCallback(() => {
    const { rows, cols, pairs } = calculateGridSize()
    setGridSize({ rows, cols })

    const selectedSymbols = symbols.slice(0, pairs)
    const cardPairs = [...selectedSymbols, ...selectedSymbols]

    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]]
    }

    const newCards: any[] = cardPairs.map((symbol, index) => ({
      id: index,
      symbol,
      isFlipped: false,
      isMatched: false,
    }))

    // Fill remaining slots with empty cards if needed
    while (newCards.length < rows * cols) {
      newCards.push({
        id: newCards.length,
        symbol: "",
        isFlipped: false,
        isMatched: true, // Mark as matched so they don't interfere
      })
    }

    setCards(newCards)
  }, [calculateGridSize])

  // Initialize game
  useEffect(() => {
    generateCards()
    setIsGameActive(true)
    setTimeElapsed(0)
    setGameCompleted(false)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setScore(0)
    setHintsUsed(0)
    playSound("gameStart")
  }, [level, generateCards, playSound])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGameActive && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => {
          if (prev >= config.timeLimit) {
            setIsGameActive(false)
            playSound("gameOver")
            return prev
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isGameActive, gameCompleted, config.timeLimit, playSound])

  // Handle card flip
  const handleCardClick = (cardId: number) => {
    if (!isGameActive || flippedCards.length >= 2) return

    const card = cards[cardId]
    if (card.isFlipped || card.isMatched || card.symbol === "") return

    playSound("buttonClick")

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    // Update card state
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)

      const [firstId, secondId] = newFlippedCards
      const firstCard = cards[firstId]
      const secondCard = cards[secondId]

      setTimeout(() => {
        if (firstCard.symbol === secondCard.symbol) {
          // Match found
          playSound("success")
          setCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c)))

          const newMatchedPairs = matchedPairs + 1
          setMatchedPairs(newMatchedPairs)

          // Check if game completed
          const totalPairs = cards.filter((c) => c.symbol !== "").length / 2
          if (newMatchedPairs >= totalPairs) {
            setGameCompleted(true)
            setIsGameActive(false)

            const timeBonus = Math.max(0, config.timeLimit - timeElapsed)
            const moveBonus = Math.max(0, 100 - moves * 5)
            const hintPenalty = hintsUsed * 25
            const finalScore = Math.max(100, config.basePoints + timeBonus + moveBonus - hintPenalty)

            setScore(finalScore)
            playSound("gameComplete")

            setTimeout(() => {
              onComplete(finalScore, timeElapsed)
            }, 2000)
          }
        } else {
          // No match
          playSound("error")
          setCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c)))
        }

        setFlippedCards([])
      }, 1000)
    }
  }

  // Use hint
  const useHint = () => {
    if (hintsUsed >= 3 || !isGameActive) return

    // Find two matching unmatched cards
    const unmatchedCards = cards.filter((c) => !c.isMatched && c.symbol !== "")
    const symbolGroups: { [symbol: string]: any[] } = {}

    unmatchedCards.forEach((card) => {
      if (!symbolGroups[card.symbol]) {
        symbolGroups[card.symbol] = []
      }
      symbolGroups[card.symbol].push(card)
    })

    // Find a pair to highlight
    for (const symbol in symbolGroups) {
      if (symbolGroups[symbol].length >= 2) {
        const [card1, card2] = symbolGroups[symbol]

        // Briefly flip the cards to show the hint
        setCards((prev) => prev.map((c) => (c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: true } : c)))

        setHintsUsed((prev) => prev + 1)
        playSound("powerup")

        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: false } : c)))
        }, 1500)

        break
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const totalPairs = cards.filter((c) => c.symbol !== "").length / 2

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-purple-900/30 border-purple-500/30 text-purple-100 hover:bg-purple-800/40"
          >
            ← Back
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Level {level} - Grade {config.grade}
            </h1>
            <p className="text-purple-300">{config.difficulty} Memory Match</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm md:text-base">
          <Badge
            className={`${timeElapsed > config.timeLimit - 30 ? "text-red-400" : "text-green-400"} bg-black/20 border border-white/20`}
          >
            ⏱️ {formatTime(config.timeLimit - timeElapsed)}
          </Badge>
          <Badge className="text-yellow-400 bg-black/20 border border-white/20">💰 {config.lumReward} $LUM</Badge>
          <Badge className="text-blue-400 bg-black/20 border border-white/20">🎯 {config.basePoints} pts</Badge>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-green-900/30 border-green-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-300">
              {matchedPairs}/{totalPairs}
            </div>
            <div className="text-xs text-green-400">Pairs Found</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/30 border-blue-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-300">{moves}</div>
            <div className="text-xs text-blue-400">Moves</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-900/30 border-yellow-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-yellow-300">{hintsUsed}/3</div>
            <div className="text-xs text-yellow-400">Hints Used</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/30 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-300">{score}</div>
            <div className="text-xs text-purple-400">Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Grid */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardContent className="p-4">
          <div
            className="grid gap-2 max-w-2xl mx-auto"
            style={{
              gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize.rows}, minmax(0, 1fr))`,
            }}
          >
            {cards.map((card) => (
              <button
                key={card.id}
                className={`
                  aspect-square flex items-center justify-center text-2xl md:text-3xl font-bold rounded-lg transition-all duration-300 transform
                  ${
                    card.symbol === ""
                      ? "invisible"
                      : card.isMatched
                        ? "bg-green-500/50 text-white scale-95"
                        : card.isFlipped
                          ? "bg-blue-500/70 text-white"
                          : "bg-purple-500/30 text-transparent hover:bg-purple-500/50 hover:scale-105"
                  }
                  ${flippedCards.includes(card.id) ? "animate-pulse" : ""}
                `}
                onClick={() => handleCardClick(card.id)}
                disabled={!isGameActive || card.symbol === ""}
              >
                {card.isFlipped || card.isMatched ? card.symbol : "🔮"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={useHint}
          disabled={hintsUsed >= 3 || !isGameActive}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        >
          💡 Hint ({3 - hintsUsed} left)
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="bg-red-900/30 border-red-500/30 text-red-300 hover:bg-red-800/40"
        >
          🔄 Restart
        </Button>
      </div>

      {/* Game Completed Modal */}
      {gameCompleted && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="bg-gradient-to-br from-green-900/90 to-blue-900/90 border border-green-500/50 backdrop-blur-sm max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle className="text-white flex items-center justify-center gap-3">
                <span className="text-3xl animate-bounce">🎉</span>
                <span>Level Complete!</span>
                <span className="text-3xl animate-bounce">🎉</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="text-4xl font-bold text-green-400">{score} Points!</div>
              <div className="text-white space-y-2">
                <div>⏱️ Time: {formatTime(timeElapsed)}</div>
                <div>
                  🎯 Pairs: {matchedPairs}/{totalPairs}
                </div>
                <div>🔄 Moves: {moves}</div>
                <div>💡 Hints Used: {hintsUsed}</div>
                <div className="text-yellow-400 font-bold">💰 +{config.lumReward} $LUM</div>
              </div>

              {/* Special NFT notification */}
              {level === 15 && (
                <div className="bg-purple-500/20 border border-purple-400/50 rounded-lg p-3">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="text-purple-300 font-bold">Grade 5 NFT Unlocked!</div>
                  <div className="text-sm text-purple-400">+3000 $LUM Bonus</div>
                </div>
              )}

              {(level === 28 || level === 29 || level === 30) && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-lg p-3">
                  <div className="text-2xl mb-2">👑</div>
                  <div className="text-yellow-300 font-bold">Legendary NFT Unlocked!</div>
                  <div className="text-sm text-yellow-400">+6000 $LUM Bonus</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

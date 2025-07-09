"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Timer, RotateCcw, CheckCircle, Zap } from "lucide-react"

interface MatchGameProps {
  onComplete: (score: number, timeElapsed: number) => void
}

interface GameCard {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

export default function MatchGame({ onComplete }: MatchGameProps) {
  const [cards, setCards] = useState<GameCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [moves, setMoves] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)

  const symbols = ["🧩", "🎯", "⚡", "🔥", "💎", "🌟", "🎮", "🚀"]

  const generateCards = () => {
    const cardPairs = symbols.flatMap((symbol, index) => [
      { id: index * 2, symbol, isFlipped: false, isMatched: false },
      { id: index * 2 + 1, symbol, isFlipped: false, isMatched: false },
    ])

    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]]
    }

    setCards(cardPairs)
  }

  useEffect(() => {
    generateCards()
  }, [])

  useEffect(() => {
    if (cards.length > 0 && !isComplete) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [cards, isComplete])

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      const firstCard = cards.find((card) => card.id === first)
      const secondCard = cards.find((card) => card.id === second)

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) => (card.id === first || card.id === second ? { ...card, isMatched: true } : card)),
          )
          setMatchedPairs((prev) => prev + 1)
          setCombo((prev) => {
            const newCombo = prev + 1
            setMaxCombo((current) => Math.max(current, newCombo))
            return newCombo
          })
          setFlippedCards([])
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) => (card.id === first || card.id === second ? { ...card, isFlipped: false } : card)),
          )
          setCombo(0)
          setFlippedCards([])
        }, 1000)
      }
      setMoves((prev) => prev + 1)
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (matchedPairs === symbols.length && !isComplete) {
      setIsComplete(true)
      const baseScore = 1000
      const timeBonus = Math.max(0, 300 - timeElapsed)
      const moveBonus = Math.max(0, 100 - moves * 5)
      const comboBonus = maxCombo * 50
      const totalScore = baseScore + timeBonus + moveBonus + comboBonus
      onComplete(totalScore, timeElapsed)
    }
  }, [matchedPairs, symbols.length, isComplete, timeElapsed, moves, maxCombo, onComplete])

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2 || isComplete) return

    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))
    setFlippedCards((prev) => [...prev, cardId])
  }

  const resetGame = () => {
    generateCards()
    setFlippedCards([])
    setMatchedPairs(0)
    setTimeElapsed(0)
    setIsComplete(false)
    setMoves(0)
    setCombo(0)
    setMaxCombo(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (cards.length === 0) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-8 text-center">
          <div className="text-white">Loading game...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              🎯 LumMatch - Memory Game
              {isComplete && <CheckCircle className="h-5 w-5 text-green-400" />}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400">Moves: {moves}</Badge>
              <Badge className="bg-orange-500/20 text-orange-400 flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Combo: {combo}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Grid */}
        <div className="lg:col-span-3">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    disabled={card.isFlipped || card.isMatched || flippedCards.length >= 2 || isComplete}
                    className={`
                      aspect-square flex items-center justify-center text-4xl font-bold rounded-lg border-2 transition-all duration-300
                      ${
                        card.isFlipped || card.isMatched
                          ? card.isMatched
                            ? "bg-green-500/30 border-green-400 text-white scale-105"
                            : "bg-blue-500/30 border-blue-400 text-white"
                          : "bg-white/10 border-white/20 hover:bg-white/20 hover:scale-105"
                      }
                    `}
                  >
                    {card.isFlipped || card.isMatched ? card.symbol : "?"}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Controls */}
        <div className="space-y-4">
          {/* Game Stats */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-white">
                <span>Pairs Found:</span>
                <span className="text-green-400">
                  {matchedPairs}/{symbols.length}
                </span>
              </div>
              <div className="flex justify-between text-white">
                <span>Moves:</span>
                <span className="text-blue-400">{moves}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Current Combo:</span>
                <span className="text-orange-400">{combo}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Best Combo:</span>
                <span className="text-yellow-400">{maxCombo}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Accuracy:</span>
                <span className="text-purple-400">{moves > 0 ? Math.round((matchedPairs / moves) * 100) : 0}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={resetGame}
                className="w-full bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 flex items-center gap-2"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4" />
                New Game
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 text-sm space-y-2">
              <p>• Click cards to flip them over</p>
              <p>• Find matching pairs of symbols</p>
              <p>• Build combos for bonus points</p>
              <p>• Complete in fewer moves for higher score</p>
            </CardContent>
          </Card>

          {/* Completion Message */}
          {isComplete && (
            <Card className="bg-green-500/20 border-green-500/30">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-green-300 font-semibold">Perfect Match!</div>
                <div className="text-green-400 text-sm">Time: {formatTime(timeElapsed)}</div>
                <div className="text-green-400 text-sm">Moves: {moves}</div>
                <div className="text-green-400 text-sm">Best Combo: {maxCombo}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

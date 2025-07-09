"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useSound } from "@/hooks/use-sound"

interface MatchGameProps {
  level: number
  onComplete: (score: number) => void
  onBack: () => void
}

const SYMBOLS = ["🌟", "🌙", "⭐", "🪐", "🌌", "☄️", "🛸", "🚀", "👽", "🌍", "🔮", "💫", "🌠", "🌕", "🌑", "🌒"]

interface GameCard {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

export function MatchGame({ level, onComplete, onBack }: MatchGameProps) {
  const { playSound } = useSound()
  const [cards, setCards] = useState<GameCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [score, setScore] = useState(0)

  const gridSize = Math.min(4 + Math.floor(level / 5), 6)
  const totalPairs = (gridSize * gridSize) / 2

  const initializeGame = useCallback(() => {
    const totalCards = gridSize * gridSize
    const pairs = totalCards / 2
    const selectedSymbols = SYMBOLS.slice(0, pairs)
    const gameCards: GameCard[] = []

    // Create pairs
    selectedSymbols.forEach((symbol, index) => {
      gameCards.push(
        { id: index * 2, symbol, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, symbol, isFlipped: false, isMatched: false },
      )
    })

    // Shuffle cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]]
    }

    setCards(gameCards)
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setStartTime(Date.now())
    setScore(0)
  }, [gridSize])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

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
          setMatches((prev) => prev + 1)
          setScore((prev) => prev + 50)
          playSound("success")

          if (matches + 1 === totalPairs) {
            const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - startTime) / 1000))
            const moveBonus = Math.max(0, (totalPairs * 2 - moves) * 5)
            const finalScore = score + 50 + timeBonus + moveBonus
            setTimeout(() => onComplete(finalScore), 500)
          }
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) => (card.id === first || card.id === second ? { ...card, isFlipped: false } : card)),
          )
          playSound("error")
        }, 1000)
      }

      setTimeout(() => setFlippedCards([]), 1000)
      setMoves((prev) => prev + 1)
    }
  }, [flippedCards, cards, matches, totalPairs, moves, score, startTime, onComplete, playSound])

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return
    if (flippedCards.includes(cardId)) return

    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isMatched) return

    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))
    setFlippedCards((prev) => [...prev, cardId])
    playSound("click")
  }

  const progress = (matches / totalPairs) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                🎯 LumMatch - Level {level}
              </CardTitle>
              <Button onClick={onBack} variant="outline" className="border-purple-500/50 bg-transparent">
                Back
              </Button>
            </div>
            <div className="flex gap-4 items-center">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                Score: {score}
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                Moves: {moves}
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-200">
                Matches: {matches}/{totalPairs}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 max-w-2xl mx-auto" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`
                    aspect-square flex items-center justify-center text-4xl
                    rounded-lg border-2 cursor-pointer transition-all duration-300
                    ${
                      card.isFlipped || card.isMatched
                        ? "bg-purple-500/30 border-purple-400 transform scale-105"
                        : "bg-black/40 border-purple-500/30 hover:bg-purple-500/20"
                    }
                    ${card.isMatched ? "opacity-50" : ""}
                  `}
                  onClick={() => handleCardClick(card.id)}
                >
                  {card.isFlipped || card.isMatched ? card.symbol : "❓"}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

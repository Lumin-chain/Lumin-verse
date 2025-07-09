"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useSound } from "@/hooks/use-sound"

interface WordSearchGameProps {
  level: number
  onComplete: (score: number) => void
  onBack: () => void
}

const WORD_LISTS = {
  1: ["STAR", "MOON", "SUN", "MARS"],
  2: ["GALAXY", "PLANET", "COMET", "ORBIT", "SPACE"],
  3: ["NEBULA", "QUASAR", "PULSAR", "COSMIC", "METEOR", "ASTEROID"],
}

export function WordSearchGame({ level, onComplete, onBack }: WordSearchGameProps) {
  const { playSound } = useSound()
  const [grid, setGrid] = useState<string[][]>([])
  const [words, setWords] = useState<string[]>([])
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [score, setScore] = useState(0)

  const gridSize = Math.min(8 + Math.floor(level / 3), 12)
  const wordList = WORD_LISTS[Math.min(Math.ceil(level / 10), 3) as keyof typeof WORD_LISTS] || WORD_LISTS[3]

  const generateGrid = useCallback(() => {
    const newGrid: string[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(""))

    // Fill with random letters
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
      }
    }

    // Place words
    const wordsToPlace = wordList.slice(0, Math.min(4 + Math.floor(level / 5), wordList.length))
    const placedWords: string[] = []

    wordsToPlace.forEach((word) => {
      let placed = false
      let attempts = 0

      while (!placed && attempts < 50) {
        const direction = Math.floor(Math.random() * 8) // 8 directions
        const startRow = Math.floor(Math.random() * gridSize)
        const startCol = Math.floor(Math.random() * gridSize)

        const directions = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ]

        const [dRow, dCol] = directions[direction]

        // Check if word fits
        let canPlace = true
        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * dRow
          const col = startCol + i * dCol
          if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
            canPlace = false
            break
          }
        }

        if (canPlace) {
          // Place the word
          for (let i = 0; i < word.length; i++) {
            const row = startRow + i * dRow
            const col = startCol + i * dCol
            newGrid[row][col] = word[i]
          }
          placedWords.push(word)
          placed = true
        }
        attempts++
      }
    })

    setGrid(newGrid)
    setWords(placedWords)
  }, [level, gridSize, wordList])

  useEffect(() => {
    generateGrid()
    setStartTime(Date.now())
  }, [generateGrid])

  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true)
    setSelectedCells(new Set([`${row}-${col}`]))
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    if (isSelecting) {
      setSelectedCells((prev) => new Set([...prev, `${row}-${col}`]))
    }
  }

  const handleCellMouseUp = () => {
    if (isSelecting) {
      checkForWord()
      setIsSelecting(false)
    }
  }

  const checkForWord = () => {
    const selectedLetters = Array.from(selectedCells)
      .sort((a, b) => {
        const [aRow, aCol] = a.split("-").map(Number)
        const [bRow, bCol] = b.split("-").map(Number)
        return aRow - bRow || aCol - bCol
      })
      .map((cell) => {
        const [row, col] = cell.split("-").map(Number)
        return grid[row][col]
      })
      .join("")

    const reversedWord = selectedLetters.split("").reverse().join("")

    const foundWord = words.find((word) => word === selectedLetters || word === reversedWord)

    if (foundWord && !foundWords.has(foundWord)) {
      setFoundWords((prev) => new Set([...prev, foundWord]))
      setScore((prev) => prev + foundWord.length * 10)
      playSound("success")

      if (foundWords.size + 1 === words.length) {
        const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - startTime) / 1000))
        const finalScore = score + foundWord.length * 10 + timeBonus
        setTimeout(() => onComplete(finalScore), 500)
      }
    } else {
      playSound("error")
    }

    setSelectedCells(new Set())
  }

  const progress = (foundWords.size / words.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                🔍 LumWord - Level {level}
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
                Found: {foundWords.size}/{words.length}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Word Grid */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Find the Words:</h3>
                <div
                  className="grid gap-1 p-4 bg-black/30 rounded-lg"
                  style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                  onMouseLeave={() => setIsSelecting(false)}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          w-8 h-8 flex items-center justify-center text-sm font-bold
                          border border-purple-500/30 cursor-pointer transition-all
                          ${
                            selectedCells.has(`${rowIndex}-${colIndex}`)
                              ? "bg-purple-500/50 text-white"
                              : "bg-black/20 text-purple-200 hover:bg-purple-500/20"
                          }
                        `}
                        onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                        onMouseUp={handleCellMouseUp}
                      >
                        {cell}
                      </div>
                    )),
                  )}
                </div>
              </div>

              {/* Words List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Words to Find:</h3>
                <div className="grid gap-2">
                  {words.map((word) => (
                    <div
                      key={word}
                      className={`
                        p-3 rounded-lg border transition-all
                        ${
                          foundWords.has(word)
                            ? "bg-green-500/20 border-green-500/50 text-green-200 line-through"
                            : "bg-black/20 border-purple-500/30 text-purple-200"
                        }
                      `}
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

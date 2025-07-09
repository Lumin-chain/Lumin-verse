"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGameLevels } from "@/hooks/use-game-levels"
import { useSound } from "@/hooks/use-sound"

interface WordSearchGameProps {
  level: number
  onComplete: (score: number, timeElapsed: number) => void
  onBack: () => void
}

interface WordPosition {
  word: string
  startRow: number
  startCol: number
  direction: "horizontal" | "vertical" | "diagonal"
  found: boolean
}

export default function WordSearchGame({ level, onComplete, onBack }: WordSearchGameProps) {
  const { getLevelConfig } = useGameLevels()
  const { playSound } = useSound()
  const config = getLevelConfig(level)

  const [grid, setGrid] = useState<string[][]>([])
  const [words, setWords] = useState<WordPosition[]>([])
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)

  // Word lists based on difficulty
  const getWordList = useCallback(() => {
    const wordLists = {
      1: ["CAT", "DOG", "SUN", "FUN", "RUN"],
      2: ["STAR", "MOON", "FIRE", "WATER", "EARTH"],
      3: ["GALAXY", "PLANET", "COSMIC", "NEBULA", "ORBIT"],
      4: ["QUANTUM", "PHOTON", "ENERGY", "MATTER", "FUSION"],
      5: ["UNIVERSE", "INFINITY", "DIMENSION", "PARTICLE", "GRAVITY"],
    }

    const difficultyLevel = Math.min(5, Math.ceil(config.grade / 2))
    return wordLists[difficultyLevel as keyof typeof wordLists] || wordLists[5]
  }, [config.grade])

  // Generate word search grid
  const generateGrid = useCallback(() => {
    const gridSize = Math.min(15, 8 + config.grade)
    const newGrid: string[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(""))
    const wordList = getWordList()
    const placedWords: WordPosition[] = []

    // Place words in grid
    wordList.forEach((word) => {
      let placed = false
      let attempts = 0

      while (!placed && attempts < 50) {
        const direction = ["horizontal", "vertical", "diagonal"][Math.floor(Math.random() * 3)] as
          | "horizontal"
          | "vertical"
          | "diagonal"
        const startRow = Math.floor(Math.random() * gridSize)
        const startCol = Math.floor(Math.random() * gridSize)

        if (canPlaceWord(newGrid, word, startRow, startCol, direction, gridSize)) {
          placeWord(newGrid, word, startRow, startCol, direction)
          placedWords.push({
            word,
            startRow,
            startCol,
            direction,
            found: false,
          })
          placed = true
        }
        attempts++
      }
    })

    // Fill empty cells with random letters
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (newGrid[i][j] === "") {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
        }
      }
    }

    setGrid(newGrid)
    setWords(placedWords)
  }, [config.grade, getWordList])

  const canPlaceWord = (
    grid: string[][],
    word: string,
    row: number,
    col: number,
    direction: string,
    gridSize: number,
  ): boolean => {
    const directions = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1],
    }

    const [dRow, dCol] = directions[direction as keyof typeof directions]

    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow
      const newCol = col + i * dCol

      if (newRow >= gridSize || newCol >= gridSize || newRow < 0 || newCol < 0) {
        return false
      }

      if (grid[newRow][newCol] !== "" && grid[newRow][newCol] !== word[i]) {
        return false
      }
    }

    return true
  }

  const placeWord = (grid: string[][], word: string, row: number, col: number, direction: string) => {
    const directions = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1],
    }

    const [dRow, dCol] = directions[direction as keyof typeof directions]

    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow
      const newCol = col + i * dCol
      grid[newRow][newCol] = word[i]
    }
  }

  // Initialize game
  useEffect(() => {
    generateGrid()
    setIsGameActive(true)
    setTimeElapsed(0)
    setGameCompleted(false)
    setFoundWords([])
    setScore(0)
    setHintsUsed(0)
    playSound("gameStart")
  }, [level, generateGrid, playSound])

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

  // Handle cell selection
  const handleCellMouseDown = (row: number, col: number) => {
    if (!isGameActive) return
    setIsSelecting(true)
    setSelectedCells([{ row, col }])
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting || !isGameActive) return

    const start = selectedCells[0]
    if (!start) return

    // Check if it's a valid line (horizontal, vertical, or diagonal)
    const rowDiff = row - start.row
    const colDiff = col - start.col

    if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
      const newSelection = getLineCells(start.row, start.col, row, col)
      setSelectedCells(newSelection)
    }
  }

  const handleCellMouseUp = () => {
    if (!isSelecting || !isGameActive) return

    setIsSelecting(false)
    checkForWord()
  }

  const getLineCells = (startRow: number, startCol: number, endRow: number, endCol: number) => {
    const cells: { row: number; col: number }[] = []
    const rowDiff = endRow - startRow
    const colDiff = endCol - startCol
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff))

    const rowStep = steps === 0 ? 0 : rowDiff / steps
    const colStep = steps === 0 ? 0 : colDiff / steps

    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: startRow + Math.round(i * rowStep),
        col: startCol + Math.round(i * colStep),
      })
    }

    return cells
  }

  const checkForWord = () => {
    const selectedWord = selectedCells.map((cell) => grid[cell.row][cell.col]).join("")
    const reversedWord = selectedWord.split("").reverse().join("")

    const foundWord = words.find(
      (w) => (w.word === selectedWord || w.word === reversedWord) && !foundWords.includes(w.word),
    )

    if (foundWord) {
      playSound("success")
      setFoundWords((prev) => [...prev, foundWord.word])

      // Check if all words found
      if (foundWords.length + 1 === words.length) {
        setGameCompleted(true)
        setIsGameActive(false)

        const timeBonus = Math.max(0, config.timeLimit - timeElapsed)
        const hintPenalty = hintsUsed * 25
        const finalScore = Math.max(100, config.basePoints + timeBonus - hintPenalty)

        setScore(finalScore)
        playSound("gameComplete")

        setTimeout(() => {
          onComplete(finalScore, timeElapsed)
        }, 2000)
      }
    } else {
      playSound("error")
    }

    setSelectedCells([])
  }

  const useHint = () => {
    if (hintsUsed >= 3 || !isGameActive) return

    const unFoundWords = words.filter((w) => !foundWords.includes(w.word))
    if (unFoundWords.length === 0) return

    const hintWord = unFoundWords[0]
    const hintCells: { row: number; col: number }[] = []

    const directions = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1],
    }

    const [dRow, dCol] = directions[hintWord.direction]

    for (let i = 0; i < hintWord.word.length; i++) {
      hintCells.push({
        row: hintWord.startRow + i * dRow,
        col: hintWord.startCol + i * dCol,
      })
    }

    setSelectedCells(hintCells)
    setHintsUsed((prev) => prev + 1)
    playSound("powerup")

    setTimeout(() => {
      setSelectedCells([])
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some((cell) => cell.row === row && cell.col === col)
  }

  const isCellInFoundWord = (row: number, col: number) => {
    return words.some((word) => {
      if (!foundWords.includes(word.word)) return false

      const directions = {
        horizontal: [0, 1],
        vertical: [1, 0],
        diagonal: [1, 1],
      }

      const [dRow, dCol] = directions[word.direction]

      for (let i = 0; i < word.word.length; i++) {
        const wordRow = word.startRow + i * dRow
        const wordCol = word.startCol + i * dCol
        if (wordRow === row && wordCol === col) return true
      }

      return false
    })
  }

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
            <p className="text-purple-300">{config.difficulty} Word Search</p>
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
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-900/30 border-green-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-300">
              {foundWords.length}/{words.length}
            </div>
            <div className="text-xs text-green-400">Words Found</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/30 border-blue-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-300">{hintsUsed}/3</div>
            <div className="text-xs text-blue-400">Hints Used</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/30 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-300">{score}</div>
            <div className="text-xs text-purple-400">Score</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Word Search Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardContent className="p-4">
              <div
                className="grid gap-1 max-w-2xl mx-auto"
                style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
                onMouseLeave={() => setIsSelecting(false)}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        aspect-square flex items-center justify-center text-sm md:text-base font-bold rounded transition-all
                        ${
                          isCellInFoundWord(rowIndex, colIndex)
                            ? "bg-green-500/50 text-white"
                            : isCellSelected(rowIndex, colIndex)
                              ? "bg-blue-500/50 text-white"
                              : "bg-white/20 text-white hover:bg-white/30"
                        }
                      `}
                      onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                      onMouseUp={handleCellMouseUp}
                      disabled={!isGameActive}
                    >
                      {cell}
                    </button>
                  )),
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Word List & Controls */}
        <div className="space-y-4">
          <Card className="bg-purple-900/30 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">Words to Find</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {words.map((word, index) => (
                <div
                  key={index}
                  className={`p-2 rounded font-mono text-sm ${
                    foundWords.includes(word.word)
                      ? "bg-green-500/20 text-green-300 line-through"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {word.word}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-yellow-900/30 border-yellow-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">Power-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={useHint}
                disabled={hintsUsed >= 3 || !isGameActive}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                💡 Hint ({3 - hintsUsed} left)
              </Button>
            </CardContent>
          </Card>
        </div>
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
                  📝 Words Found: {foundWords.length}/{words.length}
                </div>
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

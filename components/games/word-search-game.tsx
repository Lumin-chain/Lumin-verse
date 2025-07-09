"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Timer, RotateCcw, CheckCircle, Search } from "lucide-react"

interface WordSearchGameProps {
  onComplete: (score: number, timeElapsed: number) => void
}

interface WordPosition {
  word: string
  startRow: number
  startCol: number
  direction: "horizontal" | "vertical" | "diagonal"
  found: boolean
}

export default function WordSearchGame({ onComplete }: WordSearchGameProps) {
  const [grid, setGrid] = useState<string[][]>([])
  const [words, setWords] = useState<WordPosition[]>([])
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([])
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)

  const wordList = ["PUZZLE", "LOGIC", "BRAIN", "SOLVE", "THINK", "SMART", "GAME", "PLAY"]

  const generateGrid = () => {
    const size = 12
    const newGrid: string[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(""))
    const newWords: WordPosition[] = []

    // Place words in grid
    wordList.forEach((word) => {
      let placed = false
      let attempts = 0

      while (!placed && attempts < 50) {
        const direction = ["horizontal", "vertical", "diagonal"][Math.floor(Math.random() * 3)] as
          | "horizontal"
          | "vertical"
          | "diagonal"
        const startRow = Math.floor(Math.random() * size)
        const startCol = Math.floor(Math.random() * size)

        if (canPlaceWord(newGrid, word, startRow, startCol, direction, size)) {
          placeWord(newGrid, word, startRow, startCol, direction)
          newWords.push({
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
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === "") {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
        }
      }
    }

    setGrid(newGrid)
    setWords(newWords)
  }

  const canPlaceWord = (
    grid: string[][],
    word: string,
    row: number,
    col: number,
    direction: string,
    size: number,
  ): boolean => {
    const len = word.length

    switch (direction) {
      case "horizontal":
        if (col + len > size) return false
        for (let i = 0; i < len; i++) {
          if (grid[row][col + i] !== "" && grid[row][col + i] !== word[i]) return false
        }
        break
      case "vertical":
        if (row + len > size) return false
        for (let i = 0; i < len; i++) {
          if (grid[row + i][col] !== "" && grid[row + i][col] !== word[i]) return false
        }
        break
      case "diagonal":
        if (row + len > size || col + len > size) return false
        for (let i = 0; i < len; i++) {
          if (grid[row + i][col + i] !== "" && grid[row + i][col + i] !== word[i]) return false
        }
        break
    }
    return true
  }

  const placeWord = (grid: string[][], word: string, row: number, col: number, direction: string) => {
    for (let i = 0; i < word.length; i++) {
      switch (direction) {
        case "horizontal":
          grid[row][col + i] = word[i]
          break
        case "vertical":
          grid[row + i][col] = word[i]
          break
        case "diagonal":
          grid[row + i][col + i] = word[i]
          break
      }
    }
  }

  useEffect(() => {
    generateGrid()
  }, [])

  const timerEffect = () => {
    if (grid.length > 0) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }

  useEffect(timerEffect, [grid])

  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true)
    setSelectedCells([{ row, col }])
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    if (isSelecting) {
      setSelectedCells((prev) => {
        if (prev.length === 0) return [{ row, col }]
        const start = prev[0]
        const cells = getLineCells(start.row, start.col, row, col)
        return cells
      })
    }
  }

  const handleCellMouseUp = () => {
    if (selectedCells.length > 1) {
      checkForWord()
    }
    setIsSelecting(false)
  }

  const getLineCells = (startRow: number, startCol: number, endRow: number, endCol: number) => {
    const cells: { row: number; col: number }[] = []
    const deltaRow = endRow - startRow
    const deltaCol = endCol - startCol
    const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))

    if (steps === 0) return [{ row: startRow, col: startCol }]

    const stepRow = deltaRow / steps
    const stepCol = deltaCol / steps

    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: Math.round(startRow + stepRow * i),
        col: Math.round(startCol + stepCol * i),
      })
    }

    return cells
  }

  const checkForWord = () => {
    const selectedWord = selectedCells.map((cell) => grid[cell.row][cell.col]).join("")
    const reversedWord = selectedWord.split("").reverse().join("")

    const foundWord = words.find((w) => (w.word === selectedWord || w.word === reversedWord) && !w.found)

    if (foundWord) {
      setFoundWords((prev) => [...prev, foundWord.word])
      setWords((prev) => prev.map((w) => (w.word === foundWord.word ? { ...w, found: true } : w)))

      if (foundWords.length + 1 === wordList.length) {
        setIsComplete(true)
        const score = Math.max(0, 1000 - Math.floor(timeElapsed / 5))
        onComplete(score, timeElapsed)
      }
    }

    setSelectedCells([])
  }

  const resetGame = () => {
    generateGrid()
    setSelectedCells([])
    setFoundWords([])
    setTimeElapsed(0)
    setIsComplete(false)
    setIsSelecting(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some((cell) => cell.row === row && cell.col === col)
  }

  const isCellInFoundWord = (row: number, col: number) => {
    return words.some((word) => {
      if (!word.found) return false

      const len = word.word.length
      for (let i = 0; i < len; i++) {
        let checkRow = word.startRow
        let checkCol = word.startCol

        switch (word.direction) {
          case "horizontal":
            checkCol += i
            break
          case "vertical":
            checkRow += i
            break
          case "diagonal":
            checkRow += i
            checkCol += i
            break
        }

        if (checkRow === row && checkCol === col) return true
      }
      return false
    })
  }

  if (grid.length === 0) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-8 text-center">
          <div className="text-white">Loading puzzle...</div>
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
              🔍 LumWord - Word Search
              {isComplete && <CheckCircle className="h-5 w-5 text-green-400" />}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </Badge>
              <Badge className="bg-green-500/20 text-green-400">
                Found: {foundWords.length}/{wordList.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Word Search Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div
                className="grid grid-cols-12 gap-1 max-w-2xl mx-auto select-none"
                onMouseLeave={() => setIsSelecting(false)}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                      onMouseUp={handleCellMouseUp}
                      className={`
                        aspect-square flex items-center justify-center text-sm font-bold border border-white/20
                        ${
                          isCellSelected(rowIndex, colIndex)
                            ? "bg-blue-500/50 text-white"
                            : isCellInFoundWord(rowIndex, colIndex)
                              ? "bg-green-500/30 text-green-200"
                              : "bg-white/5 text-white hover:bg-white/10"
                        }
                      `}
                      disabled={isComplete}
                    >
                      {cell}
                    </button>
                  )),
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Word List and Controls */}
        <div className="space-y-4">
          {/* Word List */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find These Words
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {wordList.map((word) => (
                  <div
                    key={word}
                    className={`p-2 rounded-lg border ${
                      foundWords.includes(word)
                        ? "bg-green-500/20 border-green-500/30 text-green-300 line-through"
                        : "bg-white/5 border-white/20 text-white"
                    }`}
                  >
                    {word}
                  </div>
                ))}
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
              <p>• Click and drag to select words</p>
              <p>• Words can be horizontal, vertical, or diagonal</p>
              <p>• Words can be forwards or backwards</p>
              <p>• Find all {wordList.length} words to complete the puzzle</p>
            </CardContent>
          </Card>

          {/* Completion Message */}
          {isComplete && (
            <Card className="bg-green-500/20 border-green-500/30">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-green-300 font-semibold">All Words Found!</div>
                <div className="text-green-400 text-sm">Time: {formatTime(timeElapsed)}</div>
                <div className="text-green-400 text-sm">Score: {Math.max(0, 1000 - Math.floor(timeElapsed / 5))}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

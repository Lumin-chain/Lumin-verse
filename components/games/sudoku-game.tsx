"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Timer, RotateCcw, Lightbulb, CheckCircle } from "lucide-react"

interface SudokuGameProps {
  onComplete: (score: number, timeElapsed: number) => void
}

type SudokuGrid = (number | null)[][]

export default function SudokuGame({ onComplete }: SudokuGameProps) {
  const [grid, setGrid] = useState<SudokuGrid>([])
  const [initialGrid, setInitialGrid] = useState<SudokuGrid>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)

  // Generate a simple Sudoku puzzle
  const generatePuzzle = (): SudokuGrid => {
    const solution = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ]

    // Remove some numbers to create puzzle
    const puzzle = solution.map((row) => [...row])
    const cellsToRemove = 40 // Difficulty level

    for (let i = 0; i < cellsToRemove; i++) {
      const row = Math.floor(Math.random() * 9)
      const col = Math.floor(Math.random() * 9)
      puzzle[row][col] = null
    }

    return puzzle
  }

  useEffect(() => {
    const puzzle = generatePuzzle()
    setGrid(puzzle)
    setInitialGrid(puzzle.map((row) => [...row]))
  }, [])

  useEffect(() => {
    if (grid.length > 0) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [grid])

  const isValidMove = (grid: SudokuGrid, row: number, col: number, num: number): boolean => {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (i !== col && grid[row][i] === num) return false
    }

    // Check column
    for (let i = 0; i < 9; i++) {
      if (i !== row && grid[i][col] === num) return false
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if ((i !== row || j !== col) && grid[i][j] === num) return false
      }
    }

    return true
  }

  const handleCellClick = (row: number, col: number) => {
    if (initialGrid[row][col] !== null) return // Can't modify initial numbers
    setSelectedCell({ row, col })
  }

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isComplete) return

    const { row, col } = selectedCell
    if (initialGrid[row][col] !== null) return

    const newGrid = grid.map((r) => [...r])

    if (isValidMove(newGrid, row, col, num)) {
      newGrid[row][col] = num
      setGrid(newGrid)

      // Check if puzzle is complete
      const isGridComplete = newGrid.every((row) => row.every((cell) => cell !== null))

      if (isGridComplete) {
        setIsComplete(true)
        const score = Math.max(0, 1000 - mistakes * 50 - hintsUsed * 25 - Math.floor(timeElapsed / 10))
        onComplete(score, timeElapsed)
      }
    } else {
      setMistakes((prev) => prev + 1)
    }
  }

  const handleClear = () => {
    if (!selectedCell || isComplete) return
    const { row, col } = selectedCell
    if (initialGrid[row][col] !== null) return

    const newGrid = grid.map((r) => [...r])
    newGrid[row][col] = null
    setGrid(newGrid)
  }

  const handleHint = () => {
    if (!selectedCell || isComplete || hintsUsed >= 3) return

    const { row, col } = selectedCell
    if (initialGrid[row][col] !== null) return

    // Find the correct number for this cell
    for (let num = 1; num <= 9; num++) {
      if (isValidMove(grid, row, col, num)) {
        const newGrid = grid.map((r) => [...r])
        newGrid[row][col] = num
        setGrid(newGrid)
        setHintsUsed((prev) => prev + 1)
        break
      }
    }
  }

  const resetGame = () => {
    const puzzle = generatePuzzle()
    setGrid(puzzle)
    setInitialGrid(puzzle.map((row) => [...row]))
    setSelectedCell(null)
    setTimeElapsed(0)
    setIsComplete(false)
    setMistakes(0)
    setHintsUsed(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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
              🧩 LumLogic - Sudoku
              {isComplete && <CheckCircle className="h-5 w-5 text-green-400" />}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </Badge>
              <Badge className="bg-red-500/20 text-red-400">Mistakes: {mistakes}</Badge>
              <Badge className="bg-yellow-500/20 text-yellow-400">Hints: {hintsUsed}/3</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sudoku Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-9 gap-1 max-w-md mx-auto">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        aspect-square flex items-center justify-center text-lg font-bold border
                        ${
                          selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                            ? "bg-blue-500/30 border-blue-400"
                            : "bg-white/5 border-white/20 hover:bg-white/10"
                        }
                        ${initialGrid[rowIndex][colIndex] !== null ? "text-white bg-white/20" : "text-blue-300"}
                        ${(rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? "border-b-2 border-b-white/40" : ""}
                        ${(colIndex + 1) % 3 === 0 && colIndex !== 8 ? "border-r-2 border-r-white/40" : ""}
                      `}
                      disabled={isComplete}
                    >
                      {cell || ""}
                    </button>
                  )),
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Number Input */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    disabled={isComplete}
                    className="aspect-square bg-white/10 border-white/20 text-white hover:bg-white/20"
                    variant="outline"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleClear}
                disabled={isComplete || !selectedCell}
                className="w-full bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                variant="outline"
              >
                Clear Cell
              </Button>
              <Button
                onClick={handleHint}
                disabled={isComplete || !selectedCell || hintsUsed >= 3}
                className="w-full bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 flex items-center gap-2"
                variant="outline"
              >
                <Lightbulb className="h-4 w-4" />
                Hint ({3 - hintsUsed} left)
              </Button>
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

          {/* Completion Message */}
          {isComplete && (
            <Card className="bg-green-500/20 border-green-500/30">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-green-300 font-semibold">Puzzle Complete!</div>
                <div className="text-green-400 text-sm">Time: {formatTime(timeElapsed)}</div>
                <div className="text-green-400 text-sm">
                  Score: {Math.max(0, 1000 - mistakes * 50 - hintsUsed * 25 - Math.floor(timeElapsed / 10))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

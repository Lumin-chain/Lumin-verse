"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGameLevels } from "@/hooks/use-game-levels"
import { useSound } from "@/hooks/use-sound"

interface SudokuGameProps {
  level: number
  onComplete: (score: number, timeElapsed: number) => void
  onBack: () => void
}

type SudokuCell = {
  value: number
  isFixed: boolean
  isSelected: boolean
  isError: boolean
}

export default function SudokuGame({ level, onComplete, onBack }: SudokuGameProps) {
  const { getLevelConfig } = useGameLevels()
  const { playSound } = useSound()
  const config = getLevelConfig(level)

  const [grid, setGrid] = useState<SudokuCell[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [mistakes, setMistakes] = useState(0)

  // Generate a Sudoku puzzle based on level difficulty
  const generateSudoku = useCallback(() => {
    // Create empty 9x9 grid
    const newGrid: SudokuCell[][] = Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => ({
            value: 0,
            isFixed: false,
            isSelected: false,
            isError: false,
          })),
      )

    // Fill diagonal 3x3 boxes first (they don't affect each other)
    const fillDiagonalBoxes = () => {
      for (let box = 0; box < 9; box += 3) {
        fillBox(newGrid, box, box)
      }
    }

    // Fill a 3x3 box with random valid numbers
    const fillBox = (grid: SudokuCell[][], row: number, col: number) => {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      shuffleArray(nums)

      let numIndex = 0
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          grid[row + i][col + j].value = nums[numIndex++]
          grid[row + i][col + j].isFixed = true
        }
      }
    }

    // Shuffle array utility
    const shuffleArray = (array: number[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
    }

    // Solve the rest of the grid
    const solveSudoku = (grid: SudokuCell[][]): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col].value === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValidMove(grid, row, col, num)) {
                grid[row][col].value = num
                grid[row][col].isFixed = true

                if (solveSudoku(grid)) {
                  return true
                }

                grid[row][col].value = 0
                grid[row][col].isFixed = false
              }
            }
            return false
          }
        }
      }
      return true
    }

    // Check if a number placement is valid
    const isValidMove = (grid: SudokuCell[][], row: number, col: number, num: number): boolean => {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (grid[row][x].value === num) return false
      }

      // Check column
      for (let x = 0; x < 9; x++) {
        if (grid[x][col].value === num) return false
      }

      // Check 3x3 box
      const startRow = row - (row % 3)
      const startCol = col - (col % 3)
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[i + startRow][j + startCol].value === num) return false
        }
      }

      return true
    }

    // Generate complete solution
    fillDiagonalBoxes()
    solveSudoku(newGrid)

    // Remove numbers based on difficulty
    const cellsToRemove = Math.floor(81 * config.difficultyMultiplier * 0.6) // 60% of difficulty multiplier
    const cellsToRemoveList: { row: number; col: number }[] = []

    // Create list of all cells
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        cellsToRemoveList.push({ row: i, col: j })
      }
    }

    // Shuffle and remove cells
    shuffleArray(cellsToRemoveList)
    for (let i = 0; i < Math.min(cellsToRemove, cellsToRemoveList.length); i++) {
      const { row, col } = cellsToRemoveList[i]
      newGrid[row][col].value = 0
      newGrid[row][col].isFixed = false
    }

    return newGrid
  }, [config.difficultyMultiplier])

  // Initialize game
  useEffect(() => {
    const newGrid = generateSudoku()
    setGrid(newGrid)
    setIsGameActive(true)
    setTimeElapsed(0)
    setGameCompleted(false)
    setScore(0)
    setHintsUsed(0)
    setMistakes(0)
    playSound("gameStart")
  }, [level, generateSudoku, playSound])

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
  const handleCellClick = (row: number, col: number) => {
    if (!isGameActive || grid[row][col].isFixed) return

    playSound("buttonClick")
    setSelectedCell({ row, col })

    // Update grid selection
    setGrid((prev) =>
      prev.map((gridRow, r) =>
        gridRow.map((cell, c) => ({
          ...cell,
          isSelected: r === row && c === col,
        })),
      ),
    )
  }

  // Handle number input
  const handleNumberInput = (num: number) => {
    if (!selectedCell || !isGameActive) return

    const { row, col } = selectedCell
    if (grid[row][col].isFixed) return

    // Check if move is valid
    const isValid = isValidSudokuMove(row, col, num)

    if (!isValid && num !== 0) {
      setMistakes((prev) => prev + 1)
      playSound("error")

      // Show error briefly
      setGrid((prev) =>
        prev.map((gridRow, r) =>
          gridRow.map((cell, c) => ({
            ...cell,
            isError: r === row && c === col,
          })),
        ),
      )

      setTimeout(() => {
        setGrid((prev) => prev.map((gridRow) => gridRow.map((cell) => ({ ...cell, isError: false }))))
      }, 500)
      return
    }

    playSound("place")

    // Update grid with new number
    setGrid((prev) => {
      const newGrid = prev.map((gridRow, r) =>
        gridRow.map((cell, c) => ({
          ...cell,
          value: r === row && c === col ? num : cell.value,
          isError: false,
        })),
      )

      // Check if puzzle is completed
      if (isPuzzleComplete(newGrid)) {
        setGameCompleted(true)
        setIsGameActive(false)

        // Calculate score
        const timeBonus = Math.max(0, config.timeLimit - timeElapsed)
        const mistakePenalty = mistakes * 50
        const hintPenalty = hintsUsed * 25
        const finalScore = Math.max(100, config.basePoints + timeBonus - mistakePenalty - hintPenalty)

        setScore(finalScore)
        playSound("gameComplete")

        setTimeout(() => {
          onComplete(finalScore, timeElapsed)
        }, 2000)
      }

      return newGrid
    })
  }

  // Check if Sudoku move is valid
  const isValidSudokuMove = (row: number, col: number, num: number): boolean => {
    if (num === 0) return true // Allow clearing cells

    // Check row
    for (let x = 0; x < 9; x++) {
      if (x !== col && grid[row][x].value === num) return false
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (x !== row && grid[x][col].value === num) return false
    }

    // Check 3x3 box
    const startRow = row - (row % 3)
    const startCol = col - (col % 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const currentRow = i + startRow
        const currentCol = j + startCol
        if (currentRow !== row && currentCol !== col && grid[currentRow][currentCol].value === num) {
          return false
        }
      }
    }

    return true
  }

  // Check if puzzle is complete
  const isPuzzleComplete = (currentGrid: SudokuCell[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentGrid[row][col].value === 0) return false
      }
    }
    return true
  }

  // Use hint
  const useHint = () => {
    if (!selectedCell || hintsUsed >= 3) return

    const { row, col } = selectedCell
    if (grid[row][col].isFixed || grid[row][col].value !== 0) return

    // Find correct number for this cell
    for (let num = 1; num <= 9; num++) {
      if (isValidSudokuMove(row, col, num)) {
        handleNumberInput(num)
        setHintsUsed((prev) => prev + 1)
        playSound("powerup")
        break
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeColor = () => {
    const remaining = config.timeLimit - timeElapsed
    if (remaining < 30) return "text-red-400"
    if (remaining < 60) return "text-yellow-400"
    return "text-green-400"
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
            <p className="text-purple-300">{config.difficulty} Sudoku</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm md:text-base">
          <Badge className={`${getTimeColor()} bg-black/20 border border-white/20`}>
            ⏱️ {formatTime(config.timeLimit - timeElapsed)}
          </Badge>
          <Badge className="text-yellow-400 bg-black/20 border border-white/20">💰 {config.lumReward} $LUM</Badge>
          <Badge className="text-blue-400 bg-black/20 border border-white/20">🎯 {config.basePoints} pts</Badge>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-red-900/30 border-red-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-red-300">{mistakes}</div>
            <div className="text-xs text-red-400">Mistakes</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/30 border-blue-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-300">{hintsUsed}/3</div>
            <div className="text-xs text-blue-400">Hints Used</div>
          </CardContent>
        </Card>
        <Card className="bg-green-900/30 border-green-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-300">{score}</div>
            <div className="text-xs text-green-400">Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Sudoku Grid */}
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-9 gap-1 max-w-md mx-auto aspect-square">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    aspect-square flex items-center justify-center text-lg font-bold rounded transition-all
                    ${cell.isFixed ? "bg-gray-600 text-white" : "bg-white/20 text-white hover:bg-white/30"}
                    ${cell.isSelected ? "ring-2 ring-blue-400 bg-blue-500/30" : ""}
                    ${cell.isError ? "bg-red-500/50 animate-pulse" : ""}
                    ${(rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? "border-b-2 border-white/40" : ""}
                    ${(colIndex + 1) % 3 === 0 && colIndex !== 8 ? "border-r-2 border-white/40" : ""}
                  `}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={!isGameActive}
                >
                  {cell.value !== 0 ? cell.value : ""}
                </button>
              )),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Number Input */}
      <Card className="bg-purple-900/30 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <Button
                key={num}
                className="aspect-square text-lg font-bold bg-white/20 hover:bg-white/30 text-white border border-white/20"
                onClick={() => handleNumberInput(num)}
                disabled={!isGameActive || !selectedCell}
              >
                {num === 0 ? "❌" : num}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={useHint}
          disabled={!isGameActive || !selectedCell || hintsUsed >= 3}
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
                <div>❌ Mistakes: {mistakes}</div>
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

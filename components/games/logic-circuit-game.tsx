"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGameLevels } from "@/hooks/use-game-levels"
import { useSound } from "@/hooks/use-sound"

interface LogicCircuitGameProps {
  level: number
  onComplete: (score: number, timeElapsed: number) => void
  onBack: () => void
}

interface Gate {
  id: string
  type: "AND" | "OR" | "NOT" | "XOR" | "NAND" | "NOR"
  inputs: (boolean | null)[]
  output: boolean | null
  x: number
  y: number
}

interface Connection {
  from: string
  to: string
  inputIndex: number
}

export default function LogicCircuitGame({ level, onComplete, onBack }: LogicCircuitGameProps) {
  const { getLevelConfig } = useGameLevels()
  const { playSound } = useSound()
  const config = getLevelConfig(level)

  const [gates, setGates] = useState<Gate[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [inputs, setInputs] = useState<boolean[]>([])
  const [targetOutput, setTargetOutput] = useState<boolean[]>([])
  const [currentOutput, setCurrentOutput] = useState<boolean | null>(null)
  const [selectedGate, setSelectedGate] = useState<string | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [testCaseIndex, setTestCaseIndex] = useState(0)

  // Gate logic functions
  const gateLogic = {
    AND: (inputs: boolean[]) => inputs.every((i) => i),
    OR: (inputs: boolean[]) => inputs.some((i) => i),
    NOT: (inputs: boolean[]) => !inputs[0],
    XOR: (inputs: boolean[]) => inputs.filter((i) => i).length % 2 === 1,
    NAND: (inputs: boolean[]) => !inputs.every((i) => i),
    NOR: (inputs: boolean[]) => !inputs.some((i) => i),
  }

  // Generate puzzle based on level
  const generatePuzzle = useCallback(() => {
    const numInputs = Math.min(4, 2 + Math.floor(config.grade / 3))
    const complexity = Math.min(5, 1 + Math.floor(config.grade / 2))

    // Generate test cases
    const testCases: { inputs: boolean[]; output: boolean }[] = []
    for (let i = 0; i < Math.pow(2, numInputs); i++) {
      const inputValues = []
      for (let j = 0; j < numInputs; j++) {
        inputValues.push((i & (1 << j)) !== 0)
      }

      // Generate target output based on complexity
      let output = false
      if (complexity === 1) {
        // Simple AND
        output = inputValues.every((i) => i)
      } else if (complexity === 2) {
        // Simple OR
        output = inputValues.some((i) => i)
      } else if (complexity === 3) {
        // XOR of first two inputs
        output = inputValues[0] !== inputValues[1]
      } else if (complexity === 4) {
        // (A AND B) OR (C AND D)
        output = (inputValues[0] && inputValues[1]) || (inputValues[2] && inputValues[3])
      } else {
        // Complex: (A XOR B) AND (C OR D)
        output = inputValues[0] !== inputValues[1] && (inputValues[2] || inputValues[3])
      }

      testCases.push({ inputs: inputValues, output })
    }

    setInputs(testCases[0].inputs)
    setTargetOutput(testCases.map((tc) => tc.output))
    setTestCaseIndex(0)

    // Initialize available gates
    const availableGates: Gate[] = [
      { id: "gate1", type: "AND", inputs: [null, null], output: null, x: 200, y: 100 },
      { id: "gate2", type: "OR", inputs: [null, null], output: null, x: 200, y: 200 },
      { id: "gate3", type: "NOT", inputs: [null], output: null, x: 200, y: 300 },
    ]

    if (complexity >= 3) {
      availableGates.push({ id: "gate4", type: "XOR", inputs: [null, null], output: null, x: 300, y: 100 })
    }
    if (complexity >= 4) {
      availableGates.push({ id: "gate5", type: "NAND", inputs: [null, null], output: null, x: 300, y: 200 })
    }
    if (complexity >= 5) {
      availableGates.push({ id: "gate6", type: "NOR", inputs: [null, null], output: null, x: 300, y: 300 })
    }

    setGates(availableGates)
    setConnections([])
  }, [config.grade])

  // Initialize game
  useEffect(() => {
    generatePuzzle()
    setIsGameActive(true)
    setTimeElapsed(0)
    setGameCompleted(false)
    setScore(0)
    setHintsUsed(0)
    setCurrentOutput(null)
    playSound("gameStart")
  }, [level, generatePuzzle, playSound])

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

  // Calculate circuit output
  const calculateOutput = useCallback(() => {
    // Reset all gate outputs
    const updatedGates = gates.map((gate) => ({ ...gate, output: null }))

    // Set input values for gates connected to inputs
    connections.forEach((conn) => {
      if (conn.from.startsWith("input")) {
        const inputIndex = Number.parseInt(conn.from.replace("input", ""))
        const gateIndex = updatedGates.findIndex((g) => g.id === conn.to)
        if (gateIndex !== -1) {
          updatedGates[gateIndex].inputs[conn.inputIndex] = inputs[inputIndex]
        }
      }
    })

    // Calculate gate outputs iteratively
    let changed = true
    let iterations = 0
    while (changed && iterations < 10) {
      changed = false
      iterations++

      updatedGates.forEach((gate) => {
        if (gate.inputs.every((input) => input !== null)) {
          const newOutput = gateLogic[gate.type](gate.inputs as boolean[])
          if (gate.output !== newOutput) {
            gate.output = newOutput
            changed = true

            // Propagate to connected gates
            connections.forEach((conn) => {
              if (conn.from === gate.id) {
                const targetGateIndex = updatedGates.findIndex((g) => g.id === conn.to)
                if (targetGateIndex !== -1) {
                  updatedGates[targetGateIndex].inputs[conn.inputIndex] = newOutput
                }
              }
            })
          }
        }
      })
    }

    setGates(updatedGates)

    // Find output gate (last gate in chain or manually designated)
    const outputGate = updatedGates.find(
      (gate) => !connections.some((conn) => conn.from === gate.id) && gate.output !== null,
    )

    if (outputGate) {
      setCurrentOutput(outputGate.output)
    }
  }, [gates, connections, inputs])

  // Update circuit when connections or inputs change
  useEffect(() => {
    calculateOutput()
  }, [connections, inputs, calculateOutput])

  // Connect gates
  const connectGates = (fromId: string, toId: string, inputIndex: number) => {
    // Remove existing connection to this input
    const filteredConnections = connections.filter((conn) => !(conn.to === toId && conn.inputIndex === inputIndex))

    // Add new connection
    const newConnection = { from: fromId, to: toId, inputIndex }
    setConnections([...filteredConnections, newConnection])
    playSound("buttonClick")
  }

  // Test circuit with all test cases
  const testCircuit = () => {
    if (!isGameActive) return

    let allCorrect = true
    const testResults: boolean[] = []
    const tempInputs = inputs // Declare tempInputs variable

    // Test each input combination
    for (let i = 0; i < targetOutput.length; i++) {
      const testInputs = []
      for (let j = 0; j < inputs.length; j++) {
        testInputs.push((i & (1 << j)) !== 0)
      }

      // Temporarily set inputs and calculate
      setInputs(testInputs)

      // Calculate output for this test case
      // This is simplified - in a real implementation, you'd need to recalculate
      const isCorrect = currentOutput === targetOutput[i]
      testResults.push(isCorrect)

      if (!isCorrect) {
        allCorrect = false
      }
    }

    // Restore original inputs
    setInputs(tempInputs)

    if (allCorrect) {
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
    } else {
      playSound("error")
    }
  }

  // Use hint
  const useHint = () => {
    if (hintsUsed >= 3 || !isGameActive) return

    // Provide a hint about the expected output
    setHintsUsed((prev) => prev + 1)
    playSound("powerup")

    // Show expected output for current inputs
    alert(
      `Hint: For inputs ${inputs.map((i) => (i ? "1" : "0")).join(", ")}, the expected output is ${targetOutput[testCaseIndex] ? "1" : "0"}`,
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getGateSymbol = (type: string) => {
    const symbols = {
      AND: "&",
      OR: "≥1",
      NOT: "1",
      XOR: "=1",
      NAND: "&̄",
      NOR: "≥1̄",
    }
    return symbols[type as keyof typeof symbols] || type
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
            <p className="text-purple-300">{config.difficulty} Logic Circuit</p>
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
        <Card className="bg-blue-900/30 border-blue-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-300">{connections.length}</div>
            <div className="text-xs text-blue-400">Connections</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Circuit Canvas */}
        <div className="lg:col-span-3">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardContent className="p-4">
              <div className="relative bg-gray-900/50 rounded-lg p-4 min-h-96">
                {/* Input nodes */}
                <div className="absolute left-4 top-4 space-y-4">
                  {inputs.map((input, index) => (
                    <div key={`input-${index}`} className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${input ? "bg-green-500" : "bg-red-500"}`}
                      >
                        {input ? "1" : "0"}
                      </div>
                      <span className="text-white text-sm">Input {String.fromCharCode(65 + index)}</span>
                    </div>
                  ))}
                </div>

                {/* Gates */}
                {gates.map((gate) => (
                  <div
                    key={gate.id}
                    className={`absolute w-16 h-12 bg-blue-500/70 rounded border-2 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-blue-600/70 ${selectedGate === gate.id ? "border-yellow-400" : "border-blue-300"}`}
                    style={{ left: gate.x, top: gate.y }}
                    onClick={() => setSelectedGate(selectedGate === gate.id ? null : gate.id)}
                  >
                    <div className="text-xs text-center">
                      <div>{gate.type}</div>
                      <div className="text-xs">{getGateSymbol(gate.type)}</div>
                    </div>
                  </div>
                ))}

                {/* Output display */}
                <div className="absolute right-4 top-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">Output:</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${currentOutput === null ? "bg-gray-500" : currentOutput ? "bg-green-500" : "bg-red-500"}`}
                    >
                      {currentOutput === null ? "?" : currentOutput ? "1" : "0"}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-white">Expected: {targetOutput[testCaseIndex] ? "1" : "0"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Input Controls */}
          <Card className="bg-green-900/30 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {inputs.map((input, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    const newInputs = [...inputs]
                    newInputs[index] = !newInputs[index]
                    setInputs(newInputs)
                    playSound("buttonClick")
                  }}
                  className={`w-full ${input ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white font-bold`}
                  disabled={!isGameActive}
                >
                  {String.fromCharCode(65 + index)}: {input ? "1" : "0"}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Gate Info */}
          {selectedGate && (
            <Card className="bg-blue-900/30 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  {gates.find((g) => g.id === selectedGate)?.type} Gate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white text-sm space-y-2">
                  <div>
                    Inputs:{" "}
                    {gates
                      .find((g) => g.id === selectedGate)
                      ?.inputs.map((i) => (i === null ? "?" : i ? "1" : "0"))
                      .join(", ")}
                  </div>
                  <div>
                    Output:{" "}
                    {gates.find((g) => g.id === selectedGate)?.output === null
                      ? "?"
                      : gates.find((g) => g.id === selectedGate)?.output
                        ? "1"
                        : "0"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="bg-purple-900/30 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={testCircuit}
                disabled={!isGameActive}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                🧪 Test Circuit
              </Button>
              <Button
                onClick={useHint}
                disabled={hintsUsed >= 3 || !isGameActive}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                💡 Hint ({3 - hintsUsed} left)
              </Button>
            </CardContent>
          </Card>

          {/* Truth Table */}
          <Card className="bg-gray-900/30 border-gray-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">Truth Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-white space-y-1">
                <div className="grid grid-cols-3 gap-2 font-bold border-b border-white/20 pb-1">
                  <div>Inputs</div>
                  <div>Expected</div>
                  <div>Actual</div>
                </div>
                {targetOutput.slice(0, 4).map((expected, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <div>
                      {Array.from({ length: inputs.length }, (_, i) => (index & (1 << i) ? "1" : "0")).join("")}
                    </div>
                    <div>{expected ? "1" : "0"}</div>
                    <div>?</div>
                  </div>
                ))}
              </div>
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
                <span>Circuit Complete!</span>
                <span className="text-3xl animate-bounce">🎉</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="text-4xl font-bold text-green-400">{score} Points!</div>
              <div className="text-white space-y-2">
                <div>⏱️ Time: {formatTime(timeElapsed)}</div>
                <div>🔗 Connections: {connections.length}</div>
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

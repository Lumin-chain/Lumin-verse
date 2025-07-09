"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSound } from "@/hooks/use-sound"

interface LogicCircuitGameProps {
  level: number
  onComplete: (score: number) => void
  onBack: () => void
}

type GateType = "AND" | "OR" | "NOT" | "XOR"

interface Gate {
  id: string
  type: GateType
  inputs: boolean[]
  output: boolean
  x: number
  y: number
}

interface Challenge {
  description: string
  inputs: boolean[]
  expectedOutput: boolean
  gates: GateType[]
}

const CHALLENGES: Challenge[] = [
  {
    description: "Create an AND gate: Output true only when both inputs are true",
    inputs: [true, true],
    expectedOutput: true,
    gates: ["AND"],
  },
  {
    description: "Create an OR gate: Output true when at least one input is true",
    inputs: [false, true],
    expectedOutput: true,
    gates: ["OR"],
  },
  {
    description: "Create a NOT gate: Output the opposite of the input",
    inputs: [true],
    expectedOutput: false,
    gates: ["NOT"],
  },
  {
    description: "Create an XOR gate: Output true when inputs are different",
    inputs: [true, false],
    expectedOutput: true,
    gates: ["XOR"],
  },
  {
    description: "Combine AND and NOT: Create a NAND gate",
    inputs: [true, true],
    expectedOutput: false,
    gates: ["AND", "NOT"],
  },
]

export function LogicCircuitGame({ level, onComplete, onBack }: LogicCircuitGameProps) {
  const { playSound } = useSound()
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(CHALLENGES[0])
  const [placedGates, setPlacedGates] = useState<Gate[]>([])
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null)
  const [score, setScore] = useState(0)
  const [completedChallenges, setCompletedChallenges] = useState(0)

  useEffect(() => {
    const challengeIndex = Math.min(level - 1, CHALLENGES.length - 1)
    setCurrentChallenge(CHALLENGES[challengeIndex])
  }, [level])

  const calculateGateOutput = (gate: Gate): boolean => {
    switch (gate.type) {
      case "AND":
        return gate.inputs.every((input) => input)
      case "OR":
        return gate.inputs.some((input) => input)
      case "NOT":
        return !gate.inputs[0]
      case "XOR":
        return gate.inputs.filter((input) => input).length === 1
      default:
        return false
    }
  }

  const placeGate = (x: number, y: number) => {
    if (!selectedGate) return

    const newGate: Gate = {
      id: `gate-${Date.now()}`,
      type: selectedGate,
      inputs: selectedGate === "NOT" ? [currentChallenge.inputs[0]] : currentChallenge.inputs,
      output: false,
      x,
      y,
    }

    newGate.output = calculateGateOutput(newGate)
    setPlacedGates((prev) => [...prev, newGate])
    setSelectedGate(null)
  }

  const checkSolution = () => {
    if (placedGates.length === 0) return

    const finalOutput = placedGates[placedGates.length - 1].output

    if (finalOutput === currentChallenge.expectedOutput) {
      const challengeScore = 100 + currentChallenge.gates.length * 50
      setScore((prev) => prev + challengeScore)
      setCompletedChallenges((prev) => prev + 1)
      playSound("success")

      if (completedChallenges + 1 >= Math.min(level, CHALLENGES.length)) {
        setTimeout(() => onComplete(score + challengeScore), 500)
      } else {
        // Move to next challenge
        const nextIndex = Math.min(completedChallenges + 1, CHALLENGES.length - 1)
        setCurrentChallenge(CHALLENGES[nextIndex])
        setPlacedGates([])
      }
    } else {
      playSound("error")
    }
  }

  const resetCircuit = () => {
    setPlacedGates([])
    setSelectedGate(null)
  }

  const getGateSymbol = (type: GateType): string => {
    switch (type) {
      case "AND":
        return "&"
      case "OR":
        return "|"
      case "NOT":
        return "!"
      case "XOR":
        return "⊕"
      default:
        return "?"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                ⚡ LumCode - Level {level}
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
                Challenge: {completedChallenges + 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Challenge Description */}
            <Card className="bg-black/30 border-purple-500/30">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Challenge:</h3>
                <p className="text-purple-200 mb-4">{currentChallenge.description}</p>
                <div className="flex gap-4 items-center">
                  <div className="text-white">
                    Inputs:{" "}
                    {currentChallenge.inputs.map((input, i) => (
                      <span key={i} className={`ml-2 px-2 py-1 rounded ${input ? "bg-green-500" : "bg-red-500"}`}>
                        {input ? "1" : "0"}
                      </span>
                    ))}
                  </div>
                  <div className="text-white">
                    Expected Output:
                    <span
                      className={`ml-2 px-2 py-1 rounded ${currentChallenge.expectedOutput ? "bg-green-500" : "bg-red-500"}`}
                    >
                      {currentChallenge.expectedOutput ? "1" : "0"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gate Palette */}
              <Card className="bg-black/30 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Logic Gates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentChallenge.gates.map((gateType) => (
                    <Button
                      key={gateType}
                      onClick={() => setSelectedGate(gateType)}
                      variant={selectedGate === gateType ? "default" : "outline"}
                      className="w-full justify-start"
                    >
                      {getGateSymbol(gateType)} {gateType}
                    </Button>
                  ))}
                  <Button onClick={resetCircuit} variant="destructive" className="w-full">
                    Reset Circuit
                  </Button>
                </CardContent>
              </Card>

              {/* Circuit Board */}
              <Card className="lg:col-span-2 bg-black/30 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Circuit Board</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="relative w-full h-96 bg-black/20 border-2 border-dashed border-purple-500/50 rounded-lg cursor-crosshair"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top
                      placeGate(x, y)
                    }}
                  >
                    {placedGates.map((gate) => (
                      <div
                        key={gate.id}
                        className="absolute w-16 h-16 bg-purple-500/30 border-2 border-purple-400 rounded-lg flex flex-col items-center justify-center text-white font-bold"
                        style={{ left: gate.x - 32, top: gate.y - 32 }}
                      >
                        <div className="text-lg">{getGateSymbol(gate.type)}</div>
                        <div className={`text-xs px-1 rounded ${gate.output ? "bg-green-500" : "bg-red-500"}`}>
                          {gate.output ? "1" : "0"}
                        </div>
                      </div>
                    ))}

                    {selectedGate && (
                      <div className="absolute top-2 left-2 text-purple-200 text-sm">
                        Click to place {selectedGate} gate
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-4">
                    <Button onClick={checkSolution} className="bg-green-600 hover:bg-green-700">
                      Test Circuit
                    </Button>
                    {placedGates.length > 0 && (
                      <div className="flex items-center gap-2 text-white">
                        Current Output:
                        <span
                          className={`px-2 py-1 rounded ${placedGates[placedGates.length - 1]?.output ? "bg-green-500" : "bg-red-500"}`}
                        >
                          {placedGates[placedGates.length - 1]?.output ? "1" : "0"}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

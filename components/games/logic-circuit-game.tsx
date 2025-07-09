"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Timer, RotateCcw, CheckCircle, Play } from "lucide-react"

interface LogicCircuitGameProps {
  onComplete: (score: number, timeElapsed: number) => void
}

interface Gate {
  id: string
  type: "AND" | "OR" | "NOT" | "XOR"
  x: number
  y: number
  inputs: boolean[]
  output: boolean
}

interface Connection {
  from: string
  to: string
  fromPort: number
  toPort: number
}

export default function LogicCircuitGame({ onComplete }: LogicCircuitGameProps) {
  const [gates, setGates] = useState<Gate[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [inputs, setInputs] = useState<boolean[]>([false, false])
  const [targetOutput, setTargetOutput] = useState<boolean[]>([])
  const [currentOutput, setCurrentOutput] = useState<boolean[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [selectedGate, setSelectedGate] = useState<string | null>(null)
  const [level, setLevel] = useState(1)

  const gateTypes = ["AND", "OR", "NOT", "XOR"] as const

  const generateLevel = (levelNum: number) => {
    // Generate target truth table based on level
    const truthTable: boolean[][] = []

    switch (levelNum) {
      case 1: // Simple AND gate
        truthTable.push([false, false, false])
        truthTable.push([false, true, false])
        truthTable.push([true, false, false])
        truthTable.push([true, true, true])
        break
      case 2: // OR gate
        truthTable.push([false, false, false])
        truthTable.push([false, true, true])
        truthTable.push([true, false, true])
        truthTable.push([true, true, true])
        break
      case 3: // XOR gate
        truthTable.push([false, false, false])
        truthTable.push([false, true, true])
        truthTable.push([true, false, true])
        truthTable.push([true, true, false])
        break
      default: // Complex combination
        truthTable.push([false, false, true])
        truthTable.push([false, true, false])
        truthTable.push([true, false, false])
        truthTable.push([true, true, true])
        break
    }

    setTargetOutput(truthTable.map((row) => row[2]))
    setGates([])
    setConnections([])
    setInputs([false, false])
    calculateOutput()
  }

  useEffect(() => {
    generateLevel(level)
  }, [level])

  useEffect(() => {
    if (gates.length > 0) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gates])

  const calculateGateOutput = (gate: Gate): boolean => {
    const { type, inputs } = gate

    switch (type) {
      case "AND":
        return inputs.every((input) => input)
      case "OR":
        return inputs.some((input) => input)
      case "NOT":
        return !inputs[0]
      case "XOR":
        return inputs.filter((input) => input).length === 1
      default:
        return false
    }
  }

  const calculateOutput = () => {
    // Simulate circuit for all input combinations
    const outputs: boolean[] = []

    for (let i = 0; i < 4; i++) {
      const inputA = Boolean(i & 2)
      const inputB = Boolean(i & 1)

      // Simple simulation - in a real implementation, this would be more complex
      let output = false

      if (gates.length > 0) {
        const updatedGates = gates.map((gate) => {
          const newInputs = [...gate.inputs]
          // This is simplified - real circuit simulation would trace connections
          if (gate.type === "AND") {
            newInputs[0] = inputA
            newInputs[1] = inputB
          }
          return { ...gate, inputs: newInputs, output: calculateGateOutput({ ...gate, inputs: newInputs }) }
        })

        output = updatedGates[updatedGates.length - 1]?.output || false
      }

      outputs.push(output)
    }

    setCurrentOutput(outputs)

    // Check if solution is correct
    if (outputs.length === targetOutput.length && outputs.every((output, index) => output === targetOutput[index])) {
      if (!isComplete) {
        setIsComplete(true)
        const score = Math.max(0, 1000 - timeElapsed * 10 + level * 200)
        onComplete(score, timeElapsed)
      }
    }
  }

  useEffect(() => {
    calculateOutput()
  }, [gates, connections, targetOutput])

  const addGate = (type: Gate["type"]) => {
    const newGate: Gate = {
      id: `gate-${Date.now()}`,
      type,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50,
      inputs: type === "NOT" ? [false] : [false, false],
      output: false,
    }

    setGates((prev) => [...prev, newGate])
  }

  const removeGate = (gateId: string) => {
    setGates((prev) => prev.filter((gate) => gate.id !== gateId))
    setConnections((prev) => prev.filter((conn) => conn.from !== gateId && conn.to !== gateId))
  }

  const testCircuit = () => {
    calculateOutput()
  }

  const resetLevel = () => {
    generateLevel(level)
    setTimeElapsed(0)
    setIsComplete(false)
    setSelectedGate(null)
  }

  const nextLevel = () => {
    setLevel((prev) => prev + 1)
    setTimeElapsed(0)
    setIsComplete(false)
    setSelectedGate(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              ⚡ LumCode - Logic Circuits
              {isComplete && <CheckCircle className="h-5 w-5 text-green-400" />}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge className="bg-purple-500/20 text-purple-400">Level {level}</Badge>
              <Badge className="bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Circuit Canvas */}
        <div className="lg:col-span-3">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Circuit Designer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-900/50 rounded-lg p-4 h-96 border border-white/10">
                {/* Input nodes */}
                <div className="absolute left-4 top-8">
                  <div className="text-white text-sm mb-2">Input A</div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    A
                  </div>
                </div>
                <div className="absolute left-4 top-24">
                  <div className="text-white text-sm mb-2">Input B</div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    B
                  </div>
                </div>

                {/* Output node */}
                <div className="absolute right-4 top-16">
                  <div className="text-white text-sm mb-2">Output</div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    O
                  </div>
                </div>

                {/* Gates */}
                {gates.map((gate) => (
                  <div
                    key={gate.id}
                    className={`absolute w-16 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer border-2 ${
                      selectedGate === gate.id
                        ? "border-yellow-400 bg-yellow-500/20"
                        : "border-white/30 bg-white/10 hover:bg-white/20"
                    }`}
                    style={{ left: gate.x, top: gate.y }}
                    onClick={() => setSelectedGate(gate.id)}
                  >
                    {gate.type}
                  </div>
                ))}

                {/* Placeholder text when no gates */}
                {gates.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50 text-lg">
                    Add logic gates to build your circuit
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls and Truth Table */}
        <div className="space-y-4">
          {/* Gate Palette */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Logic Gates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {gateTypes.map((gateType) => (
                <Button
                  key={gateType}
                  onClick={() => addGate(gateType)}
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  variant="outline"
                >
                  {gateType}
                </Button>
              ))}
              {selectedGate && (
                <Button
                  onClick={() => {
                    removeGate(selectedGate)
                    setSelectedGate(null)
                  }}
                  className="w-full bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                  variant="outline"
                >
                  Remove Selected
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Truth Table */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Truth Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-white text-sm font-bold">
                  <div>A</div>
                  <div>B</div>
                  <div>Target</div>
                  <div>Current</div>
                </div>
                {[
                  [false, false],
                  [false, true],
                  [true, false],
                  [true, true],
                ].map((inputs, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 text-white text-sm">
                    <div>{inputs[0] ? "1" : "0"}</div>
                    <div>{inputs[1] ? "1" : "0"}</div>
                    <div className="text-green-400">{targetOutput[index] ? "1" : "0"}</div>
                    <div
                      className={`${currentOutput[index] === targetOutput[index] ? "text-green-400" : "text-red-400"}`}
                    >
                      {currentOutput[index] ? "1" : "0"}
                    </div>
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
            <CardContent className="space-y-2">
              <Button
                onClick={testCircuit}
                className="w-full bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30 flex items-center gap-2"
                variant="outline"
              >
                <Play className="h-4 w-4" />
                Test Circuit
              </Button>
              <Button
                onClick={resetLevel}
                className="w-full bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 flex items-center gap-2"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Level
              </Button>
              {isComplete && (
                <Button
                  onClick={nextLevel}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Next Level
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 text-sm space-y-2">
              <p>• Add logic gates to build a circuit</p>
              <p>• Match the target truth table</p>
              <p>• Click gates to select/remove them</p>
              <p>• Test your circuit to verify output</p>
            </CardContent>
          </Card>

          {/* Completion Message */}
          {isComplete && (
            <Card className="bg-green-500/20 border-green-500/30">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-green-300 font-semibold">Circuit Complete!</div>
                <div className="text-green-400 text-sm">
                  Level {level} solved in {formatTime(timeElapsed)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

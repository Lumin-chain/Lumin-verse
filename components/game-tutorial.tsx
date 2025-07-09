"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface GameTutorialProps {
  game: {
    id: string
    name: string
    icon: string
    emoji: string
    color: string
    tutorial: string
  }
  onComplete: () => void
  onSkip: () => void
}

export default function GameTutorial({ game, onComplete, onSkip }: GameTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const tutorialSteps = [
    {
      title: `Welcome to ${game.name}! ${game.emoji}`,
      content: game.tutorial,
      action: "Let's start learning!",
    },
    {
      title: "Game Controls 🎮",
      content:
        "Use your mouse or touch to interact with the game elements. Each game has intuitive controls designed for both desktop and mobile.",
      action: "Got it!",
    },
    {
      title: "Scoring System ⭐",
      content:
        "Earn points based on speed, accuracy, and difficulty. Bonus points for streaks and perfect games. Convert points to $LUM tokens!",
      action: "Understood!",
    },
    {
      title: "Ready to Play! 🚀",
      content: "You're all set! Remember, practice makes perfect. Good luck in the galaxy!",
      action: "Start Playing!",
    },
  ]

  const currentTutorial = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse text-yellow-300"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${Math.random() * 8 + 4}px`,
            }}
          >
            ✨
          </div>
        ))}
      </div>

      <Card className={`w-full max-w-2xl bg-gradient-to-br ${game.color} p-1 shadow-2xl relative z-10`}>
        <div className="bg-slate-900/90 rounded-lg p-6 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4 animate-bounce">{game.icon}</div>
            <CardTitle className="text-white text-2xl mb-2">{currentTutorial.title}</CardTitle>
            <Progress value={progress} className="h-2 bg-white/20" />
            <div className="text-purple-300 text-sm mt-2">
              Step {currentStep + 1} of {tutorialSteps.length}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-white text-lg leading-relaxed text-center">{currentTutorial.content}</div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={onSkip}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                ⏭️ Skip Tutorial
              </Button>
              <Button onClick={handleNext} className={`bg-gradient-to-r ${game.color} hover:scale-105 font-bold px-8`}>
                {currentTutorial.action}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}

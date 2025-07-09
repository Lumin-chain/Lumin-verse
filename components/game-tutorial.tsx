"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Play, SkipForward } from "lucide-react"

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
      title: `Welcome to ${game.name}!`,
      content: game.tutorial,
      visual: game.icon,
    },
    {
      title: "Level System",
      content: "Progress through 30 levels across 10 grades. Each grade gets progressively harder with bigger rewards!",
      visual: "🎯",
    },
    {
      title: "Rewards & NFTs",
      content:
        "Earn $LUM tokens for completing levels. Reach Grade 5 to automatically mint a valuable NFT worth 3000 $LUM!",
      visual: "🎨",
    },
    {
      title: "Ready to Play?",
      content: "You're all set! Start with Level 1 and work your way up through the cosmic challenges.",
      visual: "🚀",
    },
  ]

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            ⭐
          </div>
        ))}
      </div>

      <Card className="w-full max-w-2xl bg-white/10 border-white/20 backdrop-blur-sm relative z-10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle
              className={`text-white flex items-center gap-3 bg-gradient-to-r ${game.color} bg-clip-text text-transparent`}
            >
              <span className="text-3xl">{tutorialSteps[currentStep].visual}</span>
              {tutorialSteps[currentStep].title}
            </CardTitle>
            <Button
              variant="outline"
              onClick={onSkip}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
          </div>
          <Progress value={progress} className="h-2 bg-white/10" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-8xl mb-4 animate-bounce">{tutorialSteps[currentStep].visual}</div>
            <p className="text-white text-lg leading-relaxed">{tutorialSteps[currentStep].content}</p>
          </div>

          {currentStep === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((grade) => (
                <div
                  key={grade}
                  className={`p-3 rounded-lg border text-center ${
                    grade === 5
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50"
                      : "bg-white/5 border-white/20"
                  }`}
                >
                  <div className="text-white font-bold">Grade {grade}</div>
                  <div className="text-xs text-white/70">
                    Levels {(grade - 1) * 3 + 1}-{grade * 3}
                  </div>
                  {grade === 5 && <div className="text-yellow-400 text-xs mt-1">🎨 NFT Reward!</div>}
                </div>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <div className="text-3xl">💰</div>
                <div className="text-white">
                  <div className="font-semibold">$LUM Tokens</div>
                  <div className="text-sm text-green-300">Earn more tokens with each level completion</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <div className="text-3xl">🎨</div>
                <div className="text-white">
                  <div className="font-semibold">Grade 5 NFT</div>
                  <div className="text-sm text-purple-300">Automatically minted and worth 3000 $LUM</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-white/70 text-sm">
              {currentStep + 1} of {tutorialSteps.length}
            </div>

            <Button
              onClick={nextStep}
              className={`bg-gradient-to-r ${game.color} hover:scale-105 text-white font-bold`}
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Playing
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

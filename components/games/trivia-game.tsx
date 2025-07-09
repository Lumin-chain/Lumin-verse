"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useSound } from "@/hooks/use-sound"

interface TriviaGameProps {
  level: number
  onComplete: (score: number) => void
  onBack: () => void
}

interface Question {
  question: string
  options: string[]
  correct: number
  category: string
  difficulty: "easy" | "medium" | "hard"
}

const QUESTIONS: Question[] = [
  {
    question: "What is the closest star to Earth?",
    options: ["Alpha Centauri", "The Sun", "Sirius", "Betelgeuse"],
    correct: 1,
    category: "Space",
    difficulty: "easy",
  },
  {
    question: "How many planets are in our solar system?",
    options: ["7", "8", "9", "10"],
    correct: 1,
    category: "Space",
    difficulty: "easy",
  },
  {
    question: "What is the largest planet in our solar system?",
    options: ["Saturn", "Jupiter", "Neptune", "Earth"],
    correct: 1,
    category: "Space",
    difficulty: "easy",
  },
  {
    question: "What galaxy do we live in?",
    options: ["Andromeda", "Whirlpool", "Milky Way", "Sombrero"],
    correct: 2,
    category: "Space",
    difficulty: "medium",
  },
  {
    question: "What is a light-year?",
    options: ["A unit of time", "A unit of distance", "A unit of speed", "A unit of mass"],
    correct: 1,
    category: "Space",
    difficulty: "medium",
  },
  {
    question: "What is the temperature of absolute zero?",
    options: ["-273.15°C", "-300°C", "-250°C", "-200°C"],
    correct: 0,
    category: "Science",
    difficulty: "hard",
  },
  {
    question: "What is a quasar?",
    options: ["A type of star", "A galaxy with an active black hole", "A planet", "A comet"],
    correct: 1,
    category: "Space",
    difficulty: "hard",
  },
  {
    question: "How long does it take light from the Sun to reach Earth?",
    options: ["8 minutes", "1 hour", "1 day", "1 second"],
    correct: 0,
    category: "Space",
    difficulty: "medium",
  },
]

export function TriviaGame({ level, onComplete, onBack }: TriviaGameProps) {
  const { playSound } = useSound()
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameQuestions, setGameQuestions] = useState<Question[]>([])

  const questionsPerLevel = Math.min(3 + Math.floor(level / 3), 8)

  const initializeGame = useCallback(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, questionsPerLevel)
    setGameQuestions(selected)
    setCurrentQuestion(selected[0])
    setQuestionIndex(0)
    setScore(0)
    setCorrectAnswers(0)
    setTimeLeft(30)
    setSelectedAnswer(null)
    setShowResult(false)
  }, [questionsPerLevel])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  useEffect(() => {
    if (timeLeft > 0 && !showResult && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(null)
    }
  }, [timeLeft, showResult, currentQuestion])

  const handleAnswer = (answerIndex: number | null) => {
    if (showResult) return

    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const isCorrect = answerIndex === currentQuestion?.correct

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 5)
      const difficultyMultiplier =
        currentQuestion?.difficulty === "hard" ? 3 : currentQuestion?.difficulty === "medium" ? 2 : 1
      const questionScore = (10 + timeBonus) * difficultyMultiplier

      setScore((prev) => prev + questionScore)
      setCorrectAnswers((prev) => prev + 1)
      playSound("success")
    } else {
      playSound("error")
    }

    setTimeout(() => {
      if (questionIndex + 1 < gameQuestions.length) {
        // Next question
        setQuestionIndex((prev) => prev + 1)
        setCurrentQuestion(gameQuestions[questionIndex + 1])
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeLeft(30)
      } else {
        // Game complete
        const finalScore =
          score +
          (isCorrect
            ? (10 + Math.floor(timeLeft / 5)) *
              (currentQuestion?.difficulty === "hard" ? 3 : currentQuestion?.difficulty === "medium" ? 2 : 1)
            : 0)
        setTimeout(() => onComplete(finalScore), 500)
      }
    }, 2000)
  }

  const progress = ((questionIndex + 1) / gameQuestions.length) * 100

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                🧠 LumTrivia - Level {level}
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
                Question: {questionIndex + 1}/{gameQuestions.length}
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-200">
                Correct: {correctAnswers}
              </Badge>
              <Badge
                variant="secondary"
                className={`${timeLeft <= 10 ? "bg-red-500/20 text-red-200" : "bg-yellow-500/20 text-yellow-200"}`}
              >
                Time: {timeLeft}s
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="bg-black/30 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="border-purple-500/50 text-purple-200">
                    {currentQuestion.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`border-purple-500/50 ${
                      currentQuestion.difficulty === "hard"
                        ? "text-red-200"
                        : currentQuestion.difficulty === "medium"
                          ? "text-yellow-200"
                          : "text-green-200"
                    }`}
                  >
                    {currentQuestion.difficulty.toUpperCase()}
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold text-white mb-6">{currentQuestion.question}</h3>

                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                      variant="outline"
                      className={`
                        p-4 h-auto text-left justify-start border-purple-500/30 text-white
                        ${
                          showResult && index === currentQuestion.correct
                            ? "bg-green-500/30 border-green-500"
                            : showResult && index === selectedAnswer && index !== currentQuestion.correct
                              ? "bg-red-500/30 border-red-500"
                              : "hover:bg-purple-500/20"
                        }
                      `}
                    >
                      <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>

                {showResult && (
                  <div className="mt-4 p-4 rounded-lg bg-black/30 border border-purple-500/30">
                    <p
                      className={`font-semibold ${
                        selectedAnswer === currentQuestion.correct ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {selectedAnswer === currentQuestion.correct ? "✅ Correct!" : "❌ Incorrect!"}
                    </p>
                    {selectedAnswer !== currentQuestion.correct && (
                      <p className="text-purple-200 mt-2">
                        The correct answer was: {currentQuestion.options[currentQuestion.correct]}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

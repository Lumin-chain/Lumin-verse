"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Timer, RotateCcw, CheckCircle, Zap, Brain } from "lucide-react"

interface TriviaGameProps {
  onComplete: (score: number, timeElapsed: number) => void
}

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
}

export default function TriviaGame({ onComplete }: TriviaGameProps) {
  const [questions] = useState<Question[]>([
    {
      id: 1,
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 1,
      difficulty: "Easy",
      category: "Computer Science",
    },
    {
      id: 2,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1,
      difficulty: "Easy",
      category: "Science",
    },
    {
      id: 3,
      question: "What does 'HTTP' stand for?",
      options: [
        "HyperText Transfer Protocol",
        "High Tech Transfer Protocol",
        "Home Tool Transfer Protocol",
        "Hyper Transfer Text Protocol",
      ],
      correctAnswer: 0,
      difficulty: "Medium",
      category: "Technology",
    },
    {
      id: 4,
      question: "In which year was Bitcoin created?",
      options: ["2008", "2009", "2010", "2007"],
      correctAnswer: 1,
      difficulty: "Medium",
      category: "Cryptocurrency",
    },
    {
      id: 5,
      question: "What is the maximum supply of Bitcoin?",
      options: ["21 million", "100 million", "50 million", "Unlimited"],
      correctAnswer: 0,
      difficulty: "Hard",
      category: "Cryptocurrency",
    },
    {
      id: 6,
      question: "Which sorting algorithm has the best average-case time complexity?",
      options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Selection Sort"],
      correctAnswer: 2,
      difficulty: "Hard",
      category: "Computer Science",
    },
    {
      id: 7,
      question: "What is the chemical symbol for Gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctAnswer: 2,
      difficulty: "Medium",
      category: "Science",
    },
    {
      id: 8,
      question: "Which blockchain consensus mechanism does Ethereum 2.0 use?",
      options: ["Proof of Work", "Proof of Stake", "Delegated Proof of Stake", "Proof of Authority"],
      correctAnswer: 1,
      difficulty: "Hard",
      category: "Cryptocurrency",
    },
  ])

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30)
  const [isComplete, setIsComplete] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  useEffect(() => {
    if (gameStarted && !isComplete) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameStarted, isComplete])

  useEffect(() => {
    if (gameStarted && !showAnswer && questionTimeLeft > 0) {
      const timer = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameStarted, showAnswer, questionTimeLeft])

  const startGame = () => {
    setGameStarted(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setCorrectAnswers(0)
    setStreak(0)
    setMaxStreak(0)
    setTimeElapsed(0)
    setQuestionTimeLeft(30)
    setIsComplete(false)
    setShowAnswer(false)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showAnswer) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    setShowAnswer(true)

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1)
      setStreak((prev) => {
        const newStreak = prev + 1
        setMaxStreak((current) => Math.max(current, newStreak))
        return newStreak
      })
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const handleTimeUp = () => {
    setShowAnswer(true)
    setStreak(0)

    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      // Game complete
      setIsComplete(true)
      const accuracy = (correctAnswers / totalQuestions) * 100
      const speedBonus = Math.max(0, 1000 - timeElapsed * 5)
      const streakBonus = maxStreak * 100
      const accuracyBonus = accuracy * 10
      const totalScore = Math.round(speedBonus + streakBonus + accuracyBonus)
      onComplete(totalScore, timeElapsed)
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowAnswer(false)
      setQuestionTimeLeft(30)
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setCorrectAnswers(0)
    setStreak(0)
    setMaxStreak(0)
    setTimeElapsed(0)
    setQuestionTimeLeft(30)
    setIsComplete(false)
    setShowAnswer(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "Hard":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl">
              🎮 LumTrivia - Knowledge Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-white/70">
              <p className="text-lg mb-4">Test your knowledge across multiple categories!</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{totalQuestions}</div>
                  <div className="text-sm">Questions</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">30s</div>
                  <div className="text-sm">Per Question</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">Mixed</div>
                  <div className="text-sm">Difficulty</div>
                </div>
              </div>
            </div>
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3 text-lg"
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    const accuracy = (correctAnswers / totalQuestions) * 100

    return (
      <div className="space-y-6">
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl">
              <CheckCircle className="h-8 w-8 text-green-400" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {correctAnswers}/{totalQuestions}
                </div>
                <div className="text-sm text-white/70">Correct</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{accuracy.toFixed(1)}%</div>
                <div className="text-sm text-white/70">Accuracy</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">{maxStreak}</div>
                <div className="text-sm text-white/70">Best Streak</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-white/70">Time</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={resetGame}
                className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 flex items-center gap-2"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">🎮 LumTrivia</CardTitle>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </Badge>
              <Badge className="bg-green-500/20 text-green-400">
                {correctAnswers}/{totalQuestions}
              </Badge>
              <Badge className="bg-orange-500/20 text-orange-400 flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Streak: {streak}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Card */}
        <div className="lg:col-span-3">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-purple-500/20 text-purple-400">
                    Question {currentQuestionIndex + 1}/{totalQuestions}
                  </Badge>
                  <Badge className={getDifficultyColor(currentQuestion.difficulty)}>{currentQuestion.difficulty}</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">{currentQuestion.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 font-bold">{questionTimeLeft}s</span>
                </div>
              </div>
              <Progress value={(questionTimeLeft / 30) * 100} className="h-2 bg-white/10" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-white text-xl font-semibold">{currentQuestion.question}</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showAnswer}
                    className={`p-4 h-auto text-left justify-start ${
                      showAnswer
                        ? index === currentQuestion.correctAnswer
                          ? "bg-green-500/30 border-green-400 text-green-200"
                          : selectedAnswer === index
                            ? "bg-red-500/30 border-red-400 text-red-200"
                            : "bg-white/5 border-white/20 text-white/50"
                        : selectedAnswer === index
                          ? "bg-blue-500/30 border-blue-400 text-white"
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div>{option}</div>
                    </div>
                  </Button>
                ))}
              </div>

              {!showAnswer && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
                >
                  Submit Answer
                </Button>
              )}

              {showAnswer && (
                <div className="text-center">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <div className="text-green-400 font-semibold text-lg">
                      ✅ Correct! +
                      {currentQuestion.difficulty === "Easy" ? 10 : currentQuestion.difficulty === "Medium" ? 20 : 30}{" "}
                      points
                    </div>
                  ) : (
                    <div className="text-red-400 font-semibold text-lg">
                      ❌ Incorrect. The correct answer was {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats and Progress */}
        <div className="space-y-4">
          {/* Current Stats */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-white">
                <span>Progress:</span>
                <span className="text-blue-400">
                  {currentQuestionIndex + 1}/{totalQuestions}
                </span>
              </div>
              <div className="flex justify-between text-white">
                <span>Correct:</span>
                <span className="text-green-400">{correctAnswers}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Current Streak:</span>
                <span className="text-orange-400">{streak}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Best Streak:</span>
                <span className="text-yellow-400">{maxStreak}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Accuracy:</span>
                <span className="text-purple-400">
                  {currentQuestionIndex > 0
                    ? Math.round((correctAnswers / (currentQuestionIndex + (showAnswer ? 1 : 0))) * 100)
                    : 0}
                  %
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress
                value={((currentQuestionIndex + (showAnswer ? 1 : 0)) / totalQuestions) * 100}
                className="h-3 bg-white/10"
              />
              <div className="text-white/70 text-sm mt-2 text-center">
                {Math.round(((currentQuestionIndex + (showAnswer ? 1 : 0)) / totalQuestions) * 100)}% Complete
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
                className="w-full bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 flex items-center gap-2"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4" />
                Quit Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

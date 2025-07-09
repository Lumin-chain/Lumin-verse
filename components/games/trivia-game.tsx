"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useGameLevels } from "@/hooks/use-game-levels"
import { useSound } from "@/hooks/use-sound"

interface TriviaGameProps {
  level: number
  onComplete: (score: number, timeElapsed: number) => void
  onBack: () => void
}

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: string
}

export default function TriviaGame({ level, onComplete, onBack }: TriviaGameProps) {
  const { getLevelConfig } = useGameLevels()
  const { playSound } = useSound()
  const config = getLevelConfig(level)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)

  // Question database organized by difficulty and category
  const questionDatabase = {
    space: {
      easy: [
        {
          question: "What is the closest planet to the Sun?",
          options: ["Venus", "Mercury", "Earth", "Mars"],
          correctAnswer: 1,
          category: "Space",
          difficulty: "Easy",
        },
        {
          question: "How many moons does Earth have?",
          options: ["0", "1", "2", "3"],
          correctAnswer: 1,
          category: "Space",
          difficulty: "Easy",
        },
        {
          question: "What is the largest planet in our solar system?",
          options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
          correctAnswer: 1,
          category: "Space",
          difficulty: "Easy",
        },
      ],
      medium: [
        {
          question: "What is the name of the galaxy that contains our solar system?",
          options: ["Andromeda", "Milky Way", "Whirlpool", "Sombrero"],
          correctAnswer: 1,
          category: "Space",
          difficulty: "Medium",
        },
        {
          question: "Which planet has the most moons?",
          options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
          correctAnswer: 1,
          category: "Space",
          difficulty: "Medium",
        },
        {
          question: "What is the speed of light in a vacuum?",
          options: ["299,792,458 m/s", "300,000,000 m/s", "186,000 mph", "150,000,000 km/s"],
          correctAnswer: 0,
          category: "Space",
          difficulty: "Medium",
        },
      ],
      hard: [
        {
          question: "What is the Schwarzschild radius of a black hole?",
          options: ["Event horizon", "Photon sphere", "Ergosphere", "Singularity"],
          correctAnswer: 0,
          category: "Space",
          difficulty: "Hard",
        },
        {
          question: "Which spacecraft was the first to leave the solar system?",
          options: ["Voyager 1", "Voyager 2", "Pioneer 10", "Pioneer 11"],
          correctAnswer: 0,
          category: "Space",
          difficulty: "Hard",
        },
      ],
    },
    science: {
      easy: [
        {
          question: "What is the chemical symbol for water?",
          options: ["H2O", "CO2", "O2", "H2"],
          correctAnswer: 0,
          category: "Science",
          difficulty: "Easy",
        },
        {
          question: "What gas do plants absorb from the atmosphere?",
          options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
          correctAnswer: 2,
          category: "Science",
          difficulty: "Easy",
        },
      ],
      medium: [
        {
          question: "What is the atomic number of carbon?",
          options: ["4", "6", "8", "12"],
          correctAnswer: 1,
          category: "Science",
          difficulty: "Medium",
        },
        {
          question: "What type of bond holds water molecules together?",
          options: ["Ionic", "Covalent", "Hydrogen", "Metallic"],
          correctAnswer: 2,
          category: "Science",
          difficulty: "Medium",
        },
      ],
      hard: [
        {
          question: "What is the half-life of Carbon-14?",
          options: ["5,730 years", "1,600 years", "24,000 years", "4.5 billion years"],
          correctAnswer: 0,
          category: "Science",
          difficulty: "Hard",
        },
      ],
    },
    technology: {
      easy: [
        {
          question: "What does 'WWW' stand for?",
          options: ["World Wide Web", "World Wide Wire", "Web Wide World", "Wide World Web"],
          correctAnswer: 0,
          category: "Technology",
          difficulty: "Easy",
        },
        {
          question: "What does 'CPU' stand for?",
          options: [
            "Computer Processing Unit",
            "Central Processing Unit",
            "Core Processing Unit",
            "Central Program Unit",
          ],
          correctAnswer: 1,
          category: "Technology",
          difficulty: "Easy",
        },
      ],
      medium: [
        {
          question: "What programming language is known for blockchain development?",
          options: ["Python", "JavaScript", "Solidity", "Java"],
          correctAnswer: 2,
          category: "Technology",
          difficulty: "Medium",
        },
        {
          question: "What does 'API' stand for?",
          options: [
            "Application Programming Interface",
            "Advanced Programming Interface",
            "Application Program Integration",
            "Advanced Program Integration",
          ],
          correctAnswer: 0,
          category: "Technology",
          difficulty: "Medium",
        },
      ],
      hard: [
        {
          question: "What consensus mechanism does Ethereum 2.0 use?",
          options: ["Proof of Work", "Proof of Stake", "Delegated Proof of Stake", "Proof of Authority"],
          correctAnswer: 1,
          category: "Technology",
          difficulty: "Hard",
        },
      ],
    },
  }

  // Generate questions based on level difficulty
  const generateQuestions = useCallback(() => {
    const categories = ["space", "science", "technology"]
    const difficulties =
      config.grade <= 3 ? ["easy"] : config.grade <= 6 ? ["easy", "medium"] : ["easy", "medium", "hard"]
    const numQuestions = Math.min(10, 5 + config.grade)

    const allQuestions: Question[] = []

    categories.forEach((category) => {
      difficulties.forEach((difficulty) => {
        const categoryQuestions = questionDatabase[category as keyof typeof questionDatabase]
        const difficultyQuestions = categoryQuestions[difficulty as keyof typeof categoryQuestions] || []
        allQuestions.push(...difficultyQuestions)
      })
    })

    // Shuffle and select questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, numQuestions)

    setQuestions(selectedQuestions)
  }, [config.grade])

  // Initialize game
  useEffect(() => {
    generateQuestions()
    setIsGameActive(true)
    setTimeElapsed(0)
    setQuestionTimeLeft(30)
    setCurrentQuestionIndex(0)
    setGameCompleted(false)
    setCorrectAnswers(0)
    setScore(0)
    setHintsUsed(0)
    setSelectedAnswer(null)
    setShowAnswer(false)
    playSound("gameStart")
  }, [level, generateQuestions, playSound])

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGameActive && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isGameActive, gameCompleted])

  // Question timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGameActive && !gameCompleted && !showAnswer) {
      interval = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp()
            return 30
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isGameActive, gameCompleted, showAnswer, currentQuestionIndex])

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    if (!isGameActive || showAnswer) return

    setSelectedAnswer(answerIndex)
    setShowAnswer(true)

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = answerIndex === currentQuestion.correctAnswer

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1)
      playSound("success")
    } else {
      playSound("error")
    }

    // Move to next question after delay
    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  // Handle time up
  const handleTimeUp = () => {
    if (!isGameActive || showAnswer) return

    setShowAnswer(true)
    playSound("error")

    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
      // Game completed
      setGameCompleted(true)
      setIsGameActive(false)

      const accuracy = (correctAnswers / questions.length) * 100
      const timeBonus = Math.max(0, (questions.length * 30 - timeElapsed) * 2)
      const accuracyBonus = correctAnswers * 50
      const hintPenalty = hintsUsed * 25
      const finalScore = Math.max(100, config.basePoints + timeBonus + accuracyBonus - hintPenalty)

      setScore(finalScore)
      playSound("gameComplete")

      setTimeout(() => {
        onComplete(finalScore, timeElapsed)
      }, 2000)
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowAnswer(false)
      setQuestionTimeLeft(30)
    }
  }

  // Use hint (eliminate 2 wrong answers)
  const useHint = () => {
    if (hintsUsed >= 3 || !isGameActive || showAnswer) return

    setHintsUsed((prev) => prev + 1)
    playSound("powerup")

    // This would eliminate wrong answers in a real implementation
    // For now, just show a hint message
    const currentQuestion = questions[currentQuestionIndex]
    alert(`Hint: The answer is related to ${currentQuestion.category.toLowerCase()}!`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100
  }

  const getTimeColor = () => {
    if (questionTimeLeft <= 5) return "text-red-400"
    if (questionTimeLeft <= 10) return "text-yellow-400"
    return "text-green-400"
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white text-xl">Loading questions...</div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

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
            <p className="text-purple-300">{config.difficulty} Trivia Challenge</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm md:text-base">
          <Badge className={`${getTimeColor()} bg-black/20 border border-white/20`}>⏱️ {questionTimeLeft}s</Badge>
          <Badge className="text-yellow-400 bg-black/20 border border-white/20">💰 {config.lumReward} $LUM</Badge>
          <Badge className="text-blue-400 bg-black/20 border border-white/20">🎯 {config.basePoints} pts</Badge>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-purple-900/30 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex justify-between text-white mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-green-400">{correctAnswers} correct</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-3" />
        </CardContent>
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-green-900/30 border-green-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-300">{correctAnswers}</div>
            <div className="text-xs text-green-400">Correct</div>
          </CardContent>
        </Card>
        <Card className="bg-red-900/30 border-red-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-red-300">{currentQuestionIndex - correctAnswers}</div>
            <div className="text-xs text-red-400">Wrong</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/30 border-blue-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-300">{hintsUsed}/3</div>
            <div className="text-xs text-blue-400">Hints</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/30 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-300">{score}</div>
            <div className="text-xs text-purple-400">Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Question Card */}
      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Badge className="bg-blue-500/20 text-blue-300">{currentQuestion.category}</Badge>
            <Badge
              className={`${
                currentQuestion.difficulty === "Easy"
                  ? "bg-green-500/20 text-green-300"
                  : currentQuestion.difficulty === "Medium"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-red-500/20 text-red-300"
              }`}
            >
              {currentQuestion.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-white text-xl md:text-2xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={!isGameActive || showAnswer}
              className={`w-full p-4 text-left justify-start text-wrap h-auto ${
                showAnswer
                  ? index === currentQuestion.correctAnswer
                    ? "bg-green-500/50 border-green-400 text-white"
                    : selectedAnswer === index
                      ? "bg-red-500/50 border-red-400 text-white"
                      : "bg-white/10 border-white/20 text-white/70"
                  : selectedAnswer === index
                    ? "bg-blue-500/50 border-blue-400 text-white"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
              variant="outline"
            >
              <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={useHint}
          disabled={hintsUsed >= 3 || !isGameActive || showAnswer}
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
                <span>Trivia Complete!</span>
                <span className="text-3xl animate-bounce">🎉</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="text-4xl font-bold text-green-400">{score} Points!</div>
              <div className="text-white space-y-2">
                <div>⏱️ Total Time: {formatTime(timeElapsed)}</div>
                <div>
                  ✅ Correct: {correctAnswers}/{questions.length}
                </div>
                <div>📊 Accuracy: {Math.round((correctAnswers / questions.length) * 100)}%</div>
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

"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  reward: string
}

interface AchievementsPanelProps {
  achievements: Achievement[]
}

export default function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  const [visibleAchievements, setVisibleAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    if (achievements.length > 0) {
      setVisibleAchievements(achievements)

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisibleAchievements([])
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [achievements])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-600"
      case "rare":
        return "from-blue-400 to-blue-600"
      case "epic":
        return "from-purple-400 to-purple-600"
      case "legendary":
        return "from-yellow-400 to-orange-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-400/50"
      case "rare":
        return "border-blue-400/50"
      case "epic":
        return "border-purple-400/50"
      case "legendary":
        return "border-yellow-400/50"
      default:
        return "border-gray-400/50"
    }
  }

  if (visibleAchievements.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {visibleAchievements.map((achievement, index) => (
        <Card
          key={achievement.id}
          className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} p-1 animate-in slide-in-from-right duration-500 shadow-2xl`}
          style={{ animationDelay: `${index * 200}ms` }}
        >
          <div
            className={`bg-slate-900/90 rounded-lg p-4 border ${getRarityBorder(achievement.rarity)} backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-bounce">{achievement.icon}</div>
                <div>
                  <div className="text-white font-bold text-sm">{achievement.title}</div>
                  <div className="text-white/70 text-xs">{achievement.description}</div>
                  <Badge className={`mt-1 bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white text-xs`}>
                    {achievement.reward}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => setVisibleAchievements([])}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  rarity: "common" | "rare" | "epic" | "legendary"
  reward: string
}

interface AchievementsPanelProps {
  achievements: Achievement[]
}

export default function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (achievements.length > 0) {
      // Play achievement sound
      const achievementSound = (window as any).sounds?.achievement
      if (achievementSound) {
        achievementSound.play().catch(() => {})
      }

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [achievements])

  if (!visible || achievements.length === 0) return null

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-500 to-gray-600"
      case "rare":
        return "from-blue-500 to-blue-600"
      case "epic":
        return "from-purple-500 to-purple-600"
      case "legendary":
        return "from-yellow-500 to-yellow-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {achievements.map((achievement) => (
        <Card
          key={achievement.id}
          className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} p-1 animate-slide-in-right shadow-2xl`}
        >
          <div className="bg-slate-900/90 rounded-lg p-4 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-bounce">{achievement.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-sm">{achievement.title}</h3>
                    <Badge className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white text-xs`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-xs">{achievement.description}</p>
                  <p className="text-yellow-400 text-xs mt-1">🎁 {achievement.reward}</p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  )
}

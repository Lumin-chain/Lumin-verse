"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NFTItem {
  id: string
  name: string
  description: string
  price: number
  rarity: "Common" | "Rare" | "Epic" | "Legendary"
  category: "Avatar" | "Power-up" | "Badge" | "Puzzle Pack"
  image: string
  emoji: string
  owned?: boolean
}

export default function NFTMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const nftItems: NFTItem[] = [
    {
      id: "1",
      name: "Cyber Puzzle Master",
      description: "Exclusive avatar with +10% point bonus",
      price: 15.5,
      rarity: "Epic",
      category: "Avatar",
      image: "/placeholder.svg?height=200&width=200",
      emoji: "🤖",
    },
    {
      id: "2",
      name: "Time Freeze Power",
      description: "Pause the timer for 30 seconds",
      price: 5.0,
      rarity: "Rare",
      category: "Power-up",
      image: "/placeholder.svg?height=200&width=200",
      emoji: "⏰",
    },
    {
      id: "3",
      name: "Logic Champion Badge",
      description: "Proof of completing 100 logic puzzles",
      price: 25.0,
      rarity: "Legendary",
      category: "Badge",
      image: "/placeholder.svg?height=200&width=200",
      emoji: "🏆",
      owned: true,
    },
    {
      id: "4",
      name: "Premium Sudoku Pack",
      description: "50 expert-level Sudoku puzzles",
      price: 8.0,
      rarity: "Rare",
      category: "Puzzle Pack",
      image: "/placeholder.svg?height=200&width=200",
      emoji: "🧩",
    },
    {
      id: "5",
      name: "Golden Hint Crystal",
      description: "Reveals one correct answer per puzzle",
      price: 3.5,
      rarity: "Common",
      category: "Power-up",
      image: "/placeholder.svg?height=200&width=200",
      emoji: "💎",
    },
    {
      id: "6",
      name: "Neon Gamer Avatar",
      description: "Glowing avatar with special effects",
      price: 12.0,
      rarity: "Epic",
      category: "Avatar",
      image: "/placeholder.svg?height=200&width=200",
      emoji: "🌟",
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "from-gray-500 to-gray-600"
      case "Rare":
        return "from-blue-500 to-blue-600"
      case "Epic":
        return "from-purple-500 to-purple-600"
      case "Legendary":
        return "from-yellow-500 to-yellow-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getRarityEmoji = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "⚪"
      case "Rare":
        return "🔵"
      case "Epic":
        return "🟣"
      case "Legendary":
        return "🟡"
      default:
        return "⚪"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Avatar":
        return "👤"
      case "Power-up":
        return "⚡"
      case "Badge":
        return "🏆"
      case "Puzzle Pack":
        return "🧩"
      default:
        return "⭐"
    }
  }

  const filteredItems = nftItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <span className="text-3xl">🛒</span>
            <span>Galactic NFT Marketplace</span>
            <span className="text-2xl animate-bounce">✨</span>
          </CardTitle>
          <CardDescription className="text-purple-300">
            Discover, collect, and trade unique puzzle NFTs from across the galaxy! 🌌
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">🔍</span>
            <Input
              placeholder="Search NFTs across the galaxy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-300 backdrop-blur-sm"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-purple-900/30 border-purple-500/30 text-white backdrop-blur-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🌟 All Categories</SelectItem>
            <SelectItem value="avatar">👤 Avatars</SelectItem>
            <SelectItem value="power-up">⚡ Power-ups</SelectItem>
            <SelectItem value="badge">🏆 Badges</SelectItem>
            <SelectItem value="puzzle pack">🧩 Puzzle Packs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
          <TabsTrigger value="marketplace" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            🛒 Marketplace
          </TabsTrigger>
          <TabsTrigger value="owned" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            🎨 My NFTs
          </TabsTrigger>
          <TabsTrigger value="create" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            ✨ Create
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`bg-gradient-to-br ${getRarityColor(item.rarity)} p-1 hover:scale-105 transition-all duration-300 shadow-xl`}
              >
                <div className="bg-slate-900/90 rounded-lg p-4 h-full backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-3 flex items-center justify-center border border-purple-500/30">
                      <div className="text-6xl animate-pulse">{item.emoji}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                      <Badge className={`bg-gradient-to-r ${getRarityColor(item.rarity)} text-white font-bold`}>
                        {getRarityEmoji(item.rarity)} {item.rarity}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                          <span>💰</span>
                          <span>Price</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                          {item.price} $LUM
                          <span className="text-lg animate-pulse">✨</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-purple-400/50 text-purple-300">
                        {getCategoryIcon(item.category)} {item.category}
                      </Badge>
                    </div>
                    {item.owned ? (
                      <Button disabled className="w-full bg-green-500/20 text-green-400 font-bold">
                        ✅ Owned
                      </Button>
                    ) : (
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold">
                        🚀 Buy Now
                      </Button>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="owned" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nftItems
              .filter((item) => item.owned)
              .map((item) => (
                <Card
                  key={item.id}
                  className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 backdrop-blur-sm hover:scale-105 transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="aspect-square bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg mb-3 flex items-center justify-center border border-green-500/30">
                      <div className="text-6xl animate-bounce">{item.emoji}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                      <Badge className={`bg-gradient-to-r ${getRarityColor(item.rarity)} text-white font-bold`}>
                        {getRarityEmoji(item.rarity)} {item.rarity}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                          <span>💎</span>
                          <span>Market Value</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                          {item.price} $LUM
                          <span className="text-lg animate-pulse">✨</span>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-bold">
                        ✅ Owned
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-blue-900/30 border-blue-500/30 text-blue-300 hover:bg-blue-800/40 font-bold"
                      >
                        🎮 Use
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-orange-900/30 border-orange-500/30 text-orange-300 hover:bg-orange-800/40 font-bold"
                      >
                        💰 Sell
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-3xl">✨</span>
                <span>Create Your Own NFT</span>
              </CardTitle>
              <CardDescription className="text-indigo-300">
                Submit puzzle designs and earn royalties when they're played across the galaxy! 🌌
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12 border-2 border-dashed border-purple-500/30 rounded-lg bg-purple-900/10">
                <div className="text-purple-300 mb-4">
                  <div className="text-6xl mb-4 animate-bounce">🚀</div>
                  <p className="text-lg">Upload your puzzle design</p>
                  <p className="text-sm">Supported formats: JSON, PNG, SVG 📁</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-bold">
                  📂 Choose File
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <span>🏷️</span>
                    <span>Puzzle Name</span>
                  </label>
                  <Input
                    placeholder="Enter puzzle name"
                    className="bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-300 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <span>📂</span>
                    <span>Category</span>
                  </label>
                  <Select>
                    <SelectTrigger className="bg-purple-900/30 border-purple-500/30 text-white backdrop-blur-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lumlogic">🧠 LumLogic</SelectItem>
                      <SelectItem value="lumword">📝 LumWord</SelectItem>
                      <SelectItem value="lummatch">🎯 LumMatch</SelectItem>
                      <SelectItem value="lumcode">⚡ LumCode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <span>📝</span>
                  <span>Description</span>
                </label>
                <textarea
                  placeholder="Describe your puzzle..."
                  className="w-full h-24 p-3 bg-purple-900/30 border border-purple-500/30 rounded-md text-white placeholder:text-purple-300 resize-none backdrop-blur-sm"
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 font-bold text-lg py-3">
                🚀 Submit for Review
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

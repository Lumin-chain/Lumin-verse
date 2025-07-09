"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Star, Search, Zap, Trophy, Puzzle, Crown } from "lucide-react"

interface NFTItem {
  id: string
  name: string
  description: string
  price: number
  rarity: "Common" | "Rare" | "Epic" | "Legendary"
  category: "Avatar" | "Power-up" | "Badge" | "Puzzle Pack"
  image: string
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
    },
    {
      id: "2",
      name: "Time Freeze Power",
      description: "Pause the timer for 30 seconds",
      price: 5.0,
      rarity: "Rare",
      category: "Power-up",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "3",
      name: "Logic Champion Badge",
      description: "Proof of completing 100 logic puzzles",
      price: 25.0,
      rarity: "Legendary",
      category: "Badge",
      image: "/placeholder.svg?height=200&width=200",
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
    },
    {
      id: "5",
      name: "Golden Hint Crystal",
      description: "Reveals one correct answer per puzzle",
      price: 3.5,
      rarity: "Common",
      category: "Power-up",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "6",
      name: "Neon Gamer Avatar",
      description: "Glowing avatar with special effects",
      price: 12.0,
      rarity: "Epic",
      category: "Avatar",
      image: "/placeholder.svg?height=200&width=200",
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500"
      case "Rare":
        return "bg-blue-500"
      case "Epic":
        return "bg-purple-500"
      case "Legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Avatar":
        return Crown
      case "Power-up":
        return Zap
      case "Badge":
        return Trophy
      case "Puzzle Pack":
        return Puzzle
      default:
        return Star
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
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-purple-400" />
            NFT Marketplace
          </CardTitle>
          <CardDescription className="text-white/70">Discover, collect, and trade unique puzzle NFTs</CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search NFTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="avatar">Avatars</SelectItem>
            <SelectItem value="power-up">Power-ups</SelectItem>
            <SelectItem value="badge">Badges</SelectItem>
            <SelectItem value="puzzle pack">Puzzle Packs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20">
          <TabsTrigger value="marketplace" className="text-white data-[state=active]:bg-white/20">
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="owned" className="text-white data-[state=active]:bg-white/20">
            My NFTs
          </TabsTrigger>
          <TabsTrigger value="create" className="text-white data-[state=active]:bg-white/20">
            Create
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const IconComponent = getCategoryIcon(item.category)
              return (
                <Card key={item.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-3 flex items-center justify-center">
                      <IconComponent className="h-16 w-16 text-white/50" />
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                      <Badge className={`${getRarityColor(item.rarity)} text-white`}>{item.rarity}</Badge>
                    </div>
                    <CardDescription className="text-white/70">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <div className="text-sm text-white/70">Price</div>
                        <div className="text-xl font-bold text-yellow-400">{item.price} $LUM</div>
                      </div>
                      <Badge variant="outline" className="border-white/20 text-white">
                        {item.category}
                      </Badge>
                    </div>
                    {item.owned ? (
                      <Button disabled className="w-full bg-green-500/20 text-green-400">
                        Owned
                      </Button>
                    ) : (
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Buy Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="owned" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nftItems
              .filter((item) => item.owned)
              .map((item) => {
                const IconComponent = getCategoryIcon(item.category)
                return (
                  <Card key={item.id} className="bg-white/10 border-white/20">
                    <CardHeader className="pb-3">
                      <div className="aspect-square bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg mb-3 flex items-center justify-center">
                        <IconComponent className="h-16 w-16 text-white/50" />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                        <Badge className={`${getRarityColor(item.rarity)} text-white`}>{item.rarity}</Badge>
                      </div>
                      <CardDescription className="text-white/70">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-white">
                          <div className="text-sm text-white/70">Market Value</div>
                          <div className="text-xl font-bold text-yellow-400">{item.price} $LUM</div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">Owned</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          Use
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          Sell
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Create Your Own NFT</CardTitle>
              <CardDescription className="text-white/70">
                Submit puzzle designs and earn royalties when they're played
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
                <div className="text-white/50 mb-4">
                  <Puzzle className="h-16 w-16 mx-auto mb-4" />
                  <p>Upload your puzzle design</p>
                  <p className="text-sm">Supported formats: JSON, PNG, SVG</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  Choose File
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Puzzle Name</label>
                  <Input
                    placeholder="Enter puzzle name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Category</label>
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lumlogic">LumLogic</SelectItem>
                      <SelectItem value="lumword">LumWord</SelectItem>
                      <SelectItem value="lummatch">LumMatch</SelectItem>
                      <SelectItem value="lumcode">LumCode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe your puzzle..."
                  className="w-full h-24 p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/50 resize-none"
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                Submit for Review
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, Wallet, CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface GameStats {
  totalPoints: number
  lumTokens: number
  level: number
  streak: number
  nftsOwned: number
  puzzlesSolved: number
}

interface DEXWithdrawalProps {
  userStats: GameStats
}

interface Transaction {
  id: string
  type: "swap" | "withdrawal"
  from: string
  to: string
  amount: number
  status: "pending" | "completed" | "failed"
  timestamp: string
  fee: number
}

export default function DEXWithdrawal({ userStats }: DEXWithdrawalProps) {
  const [activeTab, setActiveTab] = useState("swap")
  const [swapAmount, setSwapAmount] = useState("")
  const [swapTo, setSwapTo] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("")
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    routingNumber: "",
    accountName: "",
  })

  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "swap",
      from: "LUM",
      to: "ETH",
      amount: 100,
      status: "completed",
      timestamp: "2024-01-15 14:30",
      fee: 2.5,
    },
    {
      id: "2",
      type: "withdrawal",
      from: "LUM",
      to: "Bank Account",
      amount: 50,
      status: "pending",
      timestamp: "2024-01-15 12:15",
      fee: 5.0,
    },
    {
      id: "3",
      type: "swap",
      from: "LUM",
      to: "USDC",
      amount: 200,
      status: "completed",
      timestamp: "2024-01-14 16:45",
      fee: 1.8,
    },
  ])

  const exchangeRates = {
    ETH: 0.00025,
    BTC: 0.0000015,
    USDC: 0.85,
    USD: 0.82,
  }

  const withdrawalMethods = [
    { id: "ach", name: "ACH Transfer", fee: "2.5%", time: "3-5 business days", icon: "🏦" },
    { id: "wire", name: "Wire Transfer", fee: "5%", time: "1-2 business days", icon: "⚡" },
    { id: "paypal", name: "PayPal", fee: "3.5%", time: "1-2 business days", icon: "💳" },
    { id: "crypto", name: "Crypto Exchange", fee: "1%", time: "Instant", icon: "₿" },
  ]

  const handleSwap = () => {
    if (!swapAmount || !swapTo) return

    const amount = Number.parseFloat(swapAmount)
    const rate = exchangeRates[swapTo as keyof typeof exchangeRates]
    const fee = amount * 0.025 // 2.5% fee

    console.log(`Swapping ${amount} LUM to ${(amount * rate).toFixed(6)} ${swapTo}`)
    console.log(`Fee: ${fee.toFixed(2)} LUM`)

    // Reset form
    setSwapAmount("")
    setSwapTo("")
  }

  const handleWithdrawal = () => {
    if (!withdrawAmount || !withdrawMethod) return

    const amount = Number.parseFloat(withdrawAmount)
    const method = withdrawalMethods.find((m) => m.id === withdrawMethod)
    const feePercent = Number.parseFloat(method?.fee.replace("%", "") || "0") / 100
    const fee = amount * feePercent

    console.log(`Withdrawing ${amount} LUM via ${method?.name}`)
    console.log(`Fee: ${fee.toFixed(2)} LUM`)

    // Reset form
    setWithdrawAmount("")
    setWithdrawMethod("")
    setBankDetails({ accountNumber: "", routingNumber: "", accountName: "" })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* DEX Header */}
      <Card className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <span className="text-2xl">💱</span>
            <span>LUMIN DEX & Withdrawal</span>
            <span className="text-xl animate-pulse">💰</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-yellow-300">{userStats.lumTokens.toFixed(2)}</div>
              <div className="text-sm text-yellow-400">Available $LUM</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-green-300">${(userStats.lumTokens * 0.82).toFixed(2)}</div>
              <div className="text-sm text-green-400">USD Value</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-300">
                {transactions.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-sm text-blue-400">Completed Trades</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-purple-300">
                {transactions.filter((t) => t.status === "pending").length}
              </div>
              <div className="text-sm text-purple-400">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
          <TabsTrigger value="swap" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            🔄 Token Swap
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            💸 Withdraw
          </TabsTrigger>
          <TabsTrigger value="history" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            📊 History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swap" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Swap Interface */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Token Swap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="swap-amount" className="text-white">
                    Amount to Swap
                  </Label>
                  <div className="relative">
                    <Input
                      id="swap-amount"
                      type="number"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      className="bg-white/10 border-white/20 text-white pr-16"
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 font-bold">
                      $LUM
                    </div>
                  </div>
                  <div className="text-xs text-white/60 mt-1">Available: {userStats.lumTokens.toFixed(2)} $LUM</div>
                </div>

                <div>
                  <Label htmlFor="swap-to" className="text-white">
                    Swap To
                  </Label>
                  <Select value={swapTo} onValueChange={setSwapTo}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">🔷 Ethereum (ETH)</SelectItem>
                      <SelectItem value="BTC">₿ Bitcoin (BTC)</SelectItem>
                      <SelectItem value="USDC">💵 USD Coin (USDC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {swapAmount && swapTo && (
                  <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <div className="text-white text-sm">
                      <div className="flex justify-between">
                        <span>You'll receive:</span>
                        <span className="font-bold">
                          {(
                            Number.parseFloat(swapAmount) * exchangeRates[swapTo as keyof typeof exchangeRates]
                          ).toFixed(6)}{" "}
                          {swapTo}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Exchange rate:</span>
                        <span>
                          1 LUM = {exchangeRates[swapTo as keyof typeof exchangeRates]} {swapTo}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Fee (2.5%):</span>
                        <span>{(Number.parseFloat(swapAmount) * 0.025).toFixed(2)} LUM</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSwap}
                  disabled={!swapAmount || !swapTo || Number.parseFloat(swapAmount) > userStats.lumTokens}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Swap Tokens
                </Button>
              </CardContent>
            </Card>

            {/* Exchange Rates */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Current Exchange Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(exchangeRates).map(([token, rate]) => (
                    <div key={token} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {token === "ETH" ? "🔷" : token === "BTC" ? "₿" : token === "USDC" ? "💵" : "💰"}
                        </div>
                        <div>
                          <div className="text-white font-semibold">1 LUM</div>
                          <div className="text-white/60 text-sm">
                            = {rate} {token}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Live</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Withdrawal Interface */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Withdraw to Bank
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="withdraw-amount" className="text-white">
                    Amount to Withdraw
                  </Label>
                  <div className="relative">
                    <Input
                      id="withdraw-amount"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-white/10 border-white/20 text-white pr-16"
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 font-bold">
                      $LUM
                    </div>
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    Available: {userStats.lumTokens.toFixed(2)} $LUM (~${(userStats.lumTokens * 0.82).toFixed(2)} USD)
                  </div>
                </div>

                <div>
                  <Label htmlFor="withdraw-method" className="text-white">
                    Withdrawal Method
                  </Label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {withdrawalMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.icon} {method.name} - {method.fee} fee ({method.time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {withdrawMethod && (withdrawMethod === "ach" || withdrawMethod === "wire") && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="account-name" className="text-white">
                        Account Name
                      </Label>
                      <Input
                        id="account-name"
                        value={bankDetails.accountName}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-number" className="text-white">
                        Account Number
                      </Label>
                      <Input
                        id="account-number"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="routing-number" className="text-white">
                        Routing Number
                      </Label>
                      <Input
                        id="routing-number"
                        value={bankDetails.routingNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="021000021"
                      />
                    </div>
                  </div>
                )}

                {withdrawAmount && withdrawMethod && (
                  <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="text-white text-sm">
                      <div className="flex justify-between">
                        <span>Withdrawal amount:</span>
                        <span className="font-bold">{withdrawAmount} LUM</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>USD equivalent:</span>
                        <span>${(Number.parseFloat(withdrawAmount) * 0.82).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Fee:</span>
                        <span>
                          {(
                            Number.parseFloat(withdrawAmount) *
                            (Number.parseFloat(
                              withdrawalMethods.find((m) => m.id === withdrawMethod)?.fee.replace("%", "") || "0",
                            ) /
                              100)
                          ).toFixed(2)}{" "}
                          LUM
                        </span>
                      </div>
                      <div className="flex justify-between mt-1 font-bold">
                        <span>You'll receive:</span>
                        <span>
                          $
                          {(
                            Number.parseFloat(withdrawAmount) *
                            0.82 *
                            (1 -
                              Number.parseFloat(
                                withdrawalMethods.find((m) => m.id === withdrawMethod)?.fee.replace("%", "") || "0",
                              ) /
                                100)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleWithdrawal}
                  disabled={
                    !withdrawAmount || !withdrawMethod || Number.parseFloat(withdrawAmount) > userStats.lumTokens
                  }
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Withdraw Funds
                </Button>
              </CardContent>
            </Card>

            {/* Withdrawal Methods */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Withdrawal Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {withdrawalMethods.map((method) => (
                    <div key={method.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{method.icon}</div>
                        <div>
                          <div className="text-white font-semibold">{method.name}</div>
                          <div className="text-white/60 text-sm">Fee: {method.fee}</div>
                        </div>
                      </div>
                      <div className="text-white/70 text-sm">Processing time: {method.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{tx.type === "swap" ? "🔄" : "💸"}</div>
                      <div>
                        <div className="text-white font-semibold">
                          {tx.type === "swap" ? "Token Swap" : "Withdrawal"}
                        </div>
                        <div className="text-white/60 text-sm">
                          {tx.amount} {tx.from} → {tx.to}
                        </div>
                        <div className="text-white/40 text-xs">
                          {tx.timestamp} • Fee: {tx.fee} LUM
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(tx.status)} flex items-center gap-1`}>
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface DEXWithdrawalProps {
  userStats: {
    lumTokens: number
  }
}

export default function DEXWithdrawal({ userStats }: DEXWithdrawalProps) {
  const [swapAmount, setSwapAmount] = useState("")
  const [swapTo, setSwapTo] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("")
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    routingNumber: "",
    accountName: "",
  })

  const exchangeRates = {
    ETH: 0.000025, // 1 LUM = 0.000025 ETH
    USDC: 0.45, // 1 LUM = 0.45 USDC
    BTC: 0.000001, // 1 LUM = 0.000001 BTC
    USD: 0.45, // 1 LUM = $0.45
  }

  const supportedExchanges = [
    { name: "Uniswap", icon: "🦄", fee: "0.3%" },
    { name: "SushiSwap", icon: "🍣", fee: "0.25%" },
    { name: "PancakeSwap", icon: "🥞", fee: "0.2%" },
    { name: "Binance", icon: "🔶", fee: "0.1%" },
    { name: "Coinbase", icon: "🔵", fee: "0.5%" },
  ]

  const calculateSwapOutput = (amount: string, token: string) => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return "0"
    return (numAmount * exchangeRates[token as keyof typeof exchangeRates]).toFixed(6)
  }

  const calculateUSDValue = (amount: string) => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return "0"
    return (numAmount * exchangeRates.USD).toFixed(2)
  }

  const handleSwap = () => {
    console.log("Swapping", swapAmount, "LUM to", swapTo)
  }

  const handleWithdraw = () => {
    console.log("Withdrawing", withdrawAmount, "LUM via", withdrawMethod)
  }

  return (
    <div className="space-y-6">
      {/* DEX Header */}
      <Card className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <span className="text-3xl">💱</span>
            <span>LUMIN DEX & Withdrawal</span>
            <span className="text-2xl animate-pulse">💰</span>
          </CardTitle>
          <CardDescription className="text-green-300">
            Swap your $LUM tokens or withdraw to your bank account! 🌌
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-800/20 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-2xl font-bold text-green-300">{userStats.lumTokens.toFixed(2)}</div>
              <div className="text-sm text-green-400">Available $LUM</div>
            </div>
            <div className="text-center p-4 bg-blue-800/20 rounded-lg">
              <div className="text-2xl mb-2">💵</div>
              <div className="text-2xl font-bold text-blue-300">
                ${calculateUSDValue(userStats.lumTokens.toString())}
              </div>
              <div className="text-sm text-blue-400">USD Value</div>
            </div>
            <div className="text-center p-4 bg-purple-800/20 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-2xl font-bold text-purple-300">+12.5%</div>
              <div className="text-sm text-purple-400">24h Change</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="swap" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm">
          <TabsTrigger value="swap" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            🔄 Swap
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            🏦 Withdraw
          </TabsTrigger>
          <TabsTrigger value="history" className="text-purple-100 data-[state=active]:bg-purple-600/50">
            📜 History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swap" className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-3xl">🔄</span>
                <span>Token Swap</span>
              </CardTitle>
              <CardDescription className="text-blue-300">
                Swap your $LUM tokens for other cryptocurrencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">From: $LUM</label>
                  <Input
                    placeholder="Enter amount to swap"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    className="bg-blue-900/30 border-blue-500/30 text-white placeholder:text-blue-300"
                  />
                  <div className="text-xs text-blue-400 mt-1">Available: {userStats.lumTokens.toFixed(2)} $LUM</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl animate-bounce">⬇️</div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">To:</label>
                  <Select value={swapTo} onValueChange={setSwapTo}>
                    <SelectTrigger className="bg-blue-900/30 border-blue-500/30 text-white">
                      <SelectValue placeholder="Select token to receive" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">🔷 Ethereum (ETH)</SelectItem>
                      <SelectItem value="USDC">💵 USD Coin (USDC)</SelectItem>
                      <SelectItem value="BTC">₿ Bitcoin (BTC)</SelectItem>
                    </SelectContent>
                  </Select>
                  {swapAmount && swapTo && (
                    <div className="text-sm text-green-400 mt-1">
                      You'll receive: {calculateSwapOutput(swapAmount, swapTo)} {swapTo}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-800/20 rounded-lg">
                <h3 className="text-white font-semibold mb-3">📊 Exchange Rates</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-sm">
                    <span className="text-blue-300">1 $LUM = </span>
                    <span className="text-white">{exchangeRates.ETH} ETH</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-blue-300">1 $LUM = </span>
                    <span className="text-white">{exchangeRates.USDC} USDC</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-blue-300">1 $LUM = </span>
                    <span className="text-white">{exchangeRates.BTC} BTC</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-blue-300">1 $LUM = </span>
                    <span className="text-white">${exchangeRates.USD} USD</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSwap}
                disabled={!swapAmount || !swapTo || Number.parseFloat(swapAmount) > userStats.lumTokens}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-bold py-3"
              >
                🚀 Execute Swap
              </Button>
            </CardContent>
          </Card>

          {/* Supported Exchanges */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-2xl">🏪</span>
                <span>Supported Exchanges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportedExchanges.map((exchange) => (
                  <div
                    key={exchange.name}
                    className="p-3 bg-purple-800/20 rounded-lg border border-purple-500/20 text-center"
                  >
                    <div className="text-3xl mb-2">{exchange.icon}</div>
                    <div className="text-white font-semibold">{exchange.name}</div>
                    <Badge className="bg-green-500/20 text-green-400 mt-1">Fee: {exchange.fee}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <Card className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-3xl">🏦</span>
                <span>Bank Withdrawal</span>
              </CardTitle>
              <CardDescription className="text-green-300">
                Convert $LUM to USD and withdraw to your bank account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">💰 Amount to Withdraw ($LUM)</label>
                  <Input
                    placeholder="Enter $LUM amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-green-900/30 border-green-500/30 text-white placeholder:text-green-300"
                  />
                  {withdrawAmount && (
                    <div className="text-sm text-green-400 mt-1">USD Value: ${calculateUSDValue(withdrawAmount)}</div>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">🏦 Withdrawal Method</label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger className="bg-green-900/30 border-green-500/30 text-white">
                      <SelectValue placeholder="Select withdrawal method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank-transfer">🏦 Bank Transfer (ACH)</SelectItem>
                      <SelectItem value="wire-transfer">⚡ Wire Transfer</SelectItem>
                      <SelectItem value="paypal">💙 PayPal</SelectItem>
                      <SelectItem value="crypto-card">💳 Crypto Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {withdrawMethod === "bank-transfer" && (
                  <div className="space-y-3 p-4 bg-green-800/20 rounded-lg">
                    <h3 className="text-white font-semibold">🏦 Bank Account Details</h3>
                    <div>
                      <label className="block text-green-300 text-sm mb-1">Account Name</label>
                      <Input
                        placeholder="Full name on account"
                        value={bankDetails.accountName}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                        className="bg-green-900/30 border-green-500/30 text-white placeholder:text-green-300"
                      />
                    </div>
                    <div>
                      <label className="block text-green-300 text-sm mb-1">Account Number</label>
                      <Input
                        placeholder="Bank account number"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        className="bg-green-900/30 border-green-500/30 text-white placeholder:text-green-300"
                      />
                    </div>
                    <div>
                      <label className="block text-green-300 text-sm mb-1">Routing Number</label>
                      <Input
                        placeholder="Bank routing number"
                        value={bankDetails.routingNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                        className="bg-green-900/30 border-green-500/30 text-white placeholder:text-green-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-yellow-800/20 rounded-lg border border-yellow-500/30">
                <h3 className="text-yellow-300 font-semibold mb-2">⚠️ Withdrawal Fees & Limits</h3>
                <div className="text-sm text-yellow-200 space-y-1">
                  <div>• Bank Transfer: $2.50 fee, 1-3 business days</div>
                  <div>• Wire Transfer: $15 fee, same day</div>
                  <div>• PayPal: 2.5% fee, instant</div>
                  <div>• Daily limit: $10,000 USD</div>
                  <div>• Monthly limit: $50,000 USD</div>
                </div>
              </div>

              <Button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || !withdrawMethod || Number.parseFloat(withdrawAmount) > userStats.lumTokens}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 font-bold py-3"
              >
                💸 Initiate Withdrawal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-900/30 to-purple-900/30 border border-slate-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <span>Transaction History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: "Swap", from: "100 $LUM", to: "45 USDC", date: "2024-01-28", status: "completed", icon: "🔄" },
                {
                  type: "Withdrawal",
                  amount: "$225.50",
                  method: "Bank Transfer",
                  date: "2024-01-25",
                  status: "pending",
                  icon: "🏦",
                },
                {
                  type: "Swap",
                  from: "50 $LUM",
                  to: "0.00125 ETH",
                  date: "2024-01-22",
                  status: "completed",
                  icon: "🔄",
                },
                {
                  type: "Withdrawal",
                  amount: "$500.00",
                  method: "PayPal",
                  date: "2024-01-20",
                  status: "completed",
                  icon: "💙",
                },
              ].map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800/20 rounded-lg border border-slate-500/20 hover:bg-slate-700/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tx.icon}</span>
                    <div className="text-white">
                      <div className="font-semibold">{tx.type}</div>
                      <div className="text-sm text-slate-400">
                        {tx.type === "Swap" ? `${tx.from} → ${tx.to}` : `${tx.amount} via ${tx.method}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`${
                        tx.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : tx.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {tx.status === "completed"
                        ? "✅ Completed"
                        : tx.status === "pending"
                          ? "⏳ Pending"
                          : "❌ Failed"}
                    </Badge>
                    <div className="text-sm text-slate-400 mt-1">{tx.date}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

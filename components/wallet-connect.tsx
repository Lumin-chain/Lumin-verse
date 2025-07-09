"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Copy, ExternalLink } from "lucide-react"

interface WalletConnectProps {
  isConnected: boolean
  onConnect: (connected: boolean) => void
}

export default function WalletConnect({ isConnected, onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress] = useState("0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4")

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate wallet connection
    setTimeout(() => {
      onConnect(true)
      setIsConnecting(false)
    }, 2000)
  }

  const handleDisconnect = () => {
    onConnect(false)
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold"
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <Card className="bg-white/10 border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/70 hover:text-white">
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/70 hover:text-white">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <Badge className="bg-green-500/20 text-green-400 text-xs">Connected</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="ml-auto bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

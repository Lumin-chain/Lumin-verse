"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface WalletConnectProps {
  isConnected: boolean
  onConnect: (connected: boolean) => void
}

export default function WalletConnect({ isConnected, onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress] = useState("0x742d...8f3a")

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

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <Card className="bg-green-900/30 border-green-500/30 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-pulse">🛸</div>
              <div>
                <div className="text-green-300 font-semibold text-sm">Connected</div>
                <div className="text-green-400 text-xs font-mono">{walletAddress}</div>
              </div>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="bg-red-900/30 border-red-500/30 text-red-300 hover:bg-red-800/40"
              >
                🚀 Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 shadow-lg hover:scale-105 transition-all duration-300"
      >
        {isConnecting ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin text-lg">🌀</div>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-lg">🛸</span>
            <span>Connect Wallet</span>
          </div>
        )}
      </Button>
    </div>
  )
}

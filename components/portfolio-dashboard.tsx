"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCcw, Scale } from "lucide-react"
import { ModifyAllocationSheet } from "./modify-allocation-sheet"
import { RebalancePreviewSheet } from "./rebalance-preview-sheet"
import { PortfolioChart } from "./portfolio-chart"
import { toast } from "sonner"

interface Position {
  ticker: string
  name: string
  quantity: number
  currentPrice: number
  totalValue: number
  percentage: number
  logoUrl?: string
  color?: string
}

interface Order {
  ticker: string
  action: "BUY" | "SELL" | "NO ACTION"
  quantity: number
  estimatedPrice: number
  reason: string
  totalValue?: number
}

export function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<{
    totalValue: number
    positions: Position[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showModifySheet, setShowModifySheet] = useState(false)
  const [showPreviewSheet, setShowPreviewSheet] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [orderSummary, setOrderSummary] = useState<{
    totalSell: number
    totalBuy: number
    netCashChange: number
  } | null>(null)
  const [isBalanced, setIsBalanced] = useState(false)

  const loadPortfolio = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/portfolio/init")
      const data = await res.json()
      setPortfolio(data.data)
      setIsBalanced(false)

    } catch (error) {
      console.error("[v0] Error loading portfolio:", error)
      toast.error("Failed to load portfolio")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPortfolio()
  }, [])

  const handleCalculateRebalance = async (allocation: Record<string, number>) => {
    try {
      const res = await fetch("/api/portfolio/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocation }),
      })
      const data = await res.json()
      setOrders(data.orders)
      setOrderSummary(data.summary)
      setShowModifySheet(false)
      setShowPreviewSheet(true)
    } catch (error) {
      console.error("[v0] Error calculating rebalance:", error)
      toast.error("Failed to calculate rebalance")
    }
  }

  const handleExecuteRebalance = async () => {
    try {
      const res = await fetch("/api/portfolio/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      })
      const data = await res.json()
      setPortfolio(data.data)
      setShowPreviewSheet(false)
      setIsBalanced(true)
      toast.success("Portfolio rebalanced successfully!")
    } catch (error) {
      console.error("[v0] Error executing rebalance:", error)
      toast.error("Failed to execute rebalance")
    }
  }

  if (isLoading || !portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0E1A]">
        <div className="text-muted-foreground">Loading portfolio...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] p-4 pb-safe md:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-base text-gray-400 font-medium">Total Portfolio Value</p>
            <h2 className="text-5xl font-bold tracking-tight text-white">
              ${portfolio.totalValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h2>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-2xl bg-[#1A1F2E] text-[#5B9FFF] hover:bg-[#252b3b] hover:text-[#5B9FFF]"
            onClick={loadPortfolio}
          >
            <RefreshCcw className="h-6 w-6" />
          </Button>
        </div>

        {/* Donut Chart */}
        <PortfolioChart positions={portfolio.positions} totalValue={portfolio.totalValue} />

        {/* Your Assets */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white">Your Assets</h3>
          {portfolio.positions.map((pos) => (
            <Card key={pos.ticker} className="border-gray-800 bg-[#1A1F2E] p-4 transition-colors hover:bg-[#1F2533]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {pos.logoUrl ? (
                    <img
                      src={pos.logoUrl}
                      alt={pos.ticker}
                      style={{ width: 40, height: 40, objectFit: 'contain' }}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center bg-gray-700 text-white rounded-full font-bold" style={{ width: 40, height: 40 }}>
                      {pos.ticker.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-white">{pos.ticker}</h4>
                    <p className="text-sm text-gray-400">
                      ${pos.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                      • {pos.quantity % 1 === 0 ? pos.quantity : `~${pos.quantity.toFixed(2)}`} shares
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-semibold" style={{ color: pos.color || '#4DFFB8' }}>
                    {Math.round(pos.percentage)}%
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full gap-2 bg-[#2F70FF] text-white shadow-[0_0_20px_rgba(47,112,255,0.5)] hover:bg-[#2F70FF]/90 h-14 rounded-2xl text-base font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(47,112,255,0.6)]"
            onClick={() => setShowModifySheet(true)}
            disabled={isBalanced}
          >
            {isBalanced ? (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Portfolio Balanced
              </>
            ) : (
              <>
                <Scale className="h-5 w-5" />
                Rebalance Portfolio
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sheets */}
      <ModifyAllocationSheet
        open={showModifySheet}
        onOpenChange={setShowModifySheet}
        positions={portfolio.positions}
        onCalculate={handleCalculateRebalance}
      />

      <RebalancePreviewSheet
        open={showPreviewSheet}
        onOpenChange={setShowPreviewSheet}
        orders={orders}
        summary={orderSummary}
        onExecute={handleExecuteRebalance}
      />
    </div>
  )
}

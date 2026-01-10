"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCcw, Scale, TrendingUp, Pencil } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"
import { ModifyAllocationSheet } from "./modify-allocation-sheet"
import { RebalancePreviewSheet } from "./rebalance-preview-sheet"
import { toast } from "sonner"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

interface Position {
  ticker: string
  quantity: number
  currentPrice: number
  totalValue: number
  percentage: number
}

interface Order {
  ticker: string
  action: "BUY" | "SELL" | "NO ACTION"
  quantity: number
  estimatedPrice: number
  reason: string
  totalValue?: number
}

const STOCK_COLORS: Record<string, string> = {
  AAPL: "#5B9FFF",
  GOOGL: "#FF8A4D",
  TSLA: "#4DFFB8",
}

const StockLogo = ({ ticker, size = 40 }: { ticker: string; size?: number }) => {
  const logos: Record<string, JSX.Element> = {
    AAPL: (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      </div>
    ),
    GOOGL: (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-3.15c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23 7.7 23 3.99 20.53 2.18 17.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      </div>
    ),
    TSLA: (
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: "#E82127" }}
      >
        <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
          <path d="M12 5.362l2.475-3.026s4.245.09 8.471 2.054c-1.082 1.636-3.231 2.438-3.231 2.438-.146-1.439-1.154-1.79-4.354-1.79L12 24 8.619 5.034c-3.18 0-4.188.354-4.335 1.792 0 0-2.146-.795-3.229-2.43C5.28 2.431 9.525 2.34 9.525 2.34L12 5.362z" />
        </svg>
      </div>
    ),
  }

  return logos[ticker] || <div style={{ width: size, height: size }} />
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
      const totalValue = data.data.totalValue
      const positionsWithPercentage = data.data.positions.map((pos: Position) => ({
        ...pos,
        percentage: (pos.totalValue / totalValue) * 100,
      }))
      setPortfolio({
        totalValue,
        positions: positionsWithPercentage,
      })
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
      const totalValue = data.data.totalValue
      const positionsWithPercentage = data.data.positions.map((pos: Position) => ({
        ...pos,
        percentage: (pos.totalValue / totalValue) * 100,
      }))
      setPortfolio({
        totalValue,
        positions: positionsWithPercentage,
      })
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

  const chartData = portfolio.positions.map((pos) => ({
    name: pos.ticker,
    value: pos.totalValue,
    percentage: pos.percentage,
  }))

  const dayChange = 1.5

  return (
    <div className="min-h-screen bg-[#0A0E1A] p-4 pb-safe md:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Total Portfolio Value</p>
            <h2 className="text-4xl font-bold tracking-tight text-white">
              ${portfolio.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="flex items-center gap-1 text-sm font-medium text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />+{dayChange}% Today
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-lg text-blue-400 hover:bg-blue-500/10 hover:text-blue-400"
            onClick={loadPortfolio}
          >
            <RefreshCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Donut Chart */}
        <div className="relative mx-auto my-12 h-64 w-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {Object.entries(STOCK_COLORS).map(([key, color]) => (
                  <filter key={key} id={`glow-${key}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STOCK_COLORS[entry.name] || "#666"}
                    style={{ filter: `url(#glow-${entry.name})` }}
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 8} className="fill-gray-400 text-xs">
                            Total
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 12} className="fill-white text-xl font-semibold">
                            ${(portfolio.totalValue / 1000).toFixed(1)}k
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {portfolio.positions.map((pos, idx) => {
            const angle = idx * (360 / portfolio.positions.length) - 90
            const radius = 130
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius

            return (
              <div
                key={pos.ticker}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <div className="text-xs font-medium text-white">{pos.ticker}</div>
                <div className="text-xs font-semibold" style={{ color: STOCK_COLORS[pos.ticker] }}>
                  ({Math.round(pos.percentage)}%)
                </div>
              </div>
            )
          })}
        </div>

        {/* Your Assets */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white">Your Assets</h3>
          {portfolio.positions.map((pos) => (
            <Card key={pos.ticker} className="border-gray-800 bg-[#1A1F2E] p-4 transition-colors hover:bg-[#1F2533]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StockLogo ticker={pos.ticker} size={40} />
                  <div>
                    <h4 className="font-semibold text-white">{pos.ticker}</h4>
                    <p className="text-sm text-gray-400">
                      ${pos.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                      • {pos.quantity % 1 === 0 ? pos.quantity : `~${pos.quantity.toFixed(2)}`} shares
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-semibold" style={{ color: STOCK_COLORS[pos.ticker] }}>
                    {Math.round(pos.percentage)}%
                  </p>
                  <Pencil className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full border-gray-700 bg-[#1A1F2E] text-gray-300 hover:bg-[#1F2533] hover:text-white disabled:opacity-50"
            onClick={() => setShowModifySheet(true)}
            disabled={isBalanced}
          >
            Modify Allocation
          </Button>
          <Button
            size="lg"
            className="w-full gap-2 bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none"
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

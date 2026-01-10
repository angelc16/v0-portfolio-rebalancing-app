"use client"

import { useState, useEffect } from "react"
import { Drawer } from "vaul"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { X, Calculator } from "lucide-react"

interface Position {
  ticker: string
  quantity: number
  currentPrice: number
  totalValue: number
  percentage: number
}

interface ModifyAllocationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  positions: Position[]
  onCalculate: (allocation: Record<string, number>) => void
}

const STOCK_COLORS: Record<string, string> = {
  AAPL: "#5B9FFF",
  GOOGL: "#FF8A4D",
  TSLA: "#4DFFB8",
}

export function ModifyAllocationSheet({ open, onOpenChange, positions, onCalculate }: ModifyAllocationSheetProps) {
  const [allocations, setAllocations] = useState<Record<string, number>>({})

  useEffect(() => {
    // Initialize with current allocations
    const initial: Record<string, number> = {}
    positions.forEach((pos) => {
      initial[pos.ticker] = Math.round(pos.percentage)
    })
    setAllocations(initial)
  }, [positions, open])

  const total = Object.values(allocations).reduce((sum, val) => sum + val, 0)
  const isValid = total === 100

  const handleSliderChange = (ticker: string, value: number[]) => {
    setAllocations((prev) => ({ ...prev, [ticker]: value[0] }))
  }

  const handleInputChange = (ticker: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setAllocations((prev) => ({ ...prev, [ticker]: Math.min(100, Math.max(0, numValue)) }))
  }

  const handleCalculate = () => {
    if (!isValid) return

    const allocation: Record<string, number> = {}
    Object.entries(allocations).forEach(([ticker, percentage]) => {
      allocation[ticker] = percentage / 100
    })
    onCalculate(allocation)
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-2xl flex-col rounded-t-3xl bg-[#1A1F2E] outline-none">
          <div className="flex-1 overflow-y-auto rounded-t-3xl bg-[#1A1F2E] p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <Drawer.Title className="text-xl font-semibold text-white">Set Target Allocation</Drawer.Title>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Allocation Controls */}
            <div className="space-y-6">
              {positions.map((pos) => (
                <div key={pos.ticker} className="space-y-3">
                  <div className="flex items-baseline justify-between text-sm">
                    <Label className="font-medium text-white">
                      {pos.ticker}: <span className="text-gray-400">Current {Math.round(pos.percentage)}%</span>
                      <span className="mx-2 text-gray-600">→</span>
                      <span className="text-gray-400">Target</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={allocations[pos.ticker] || 0}
                          onChange={(e) => handleInputChange(pos.ticker, e.target.value)}
                          className="h-9 w-20 border-gray-700 bg-[#0F1419] pr-7 text-right text-base font-semibold text-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-2">
                    <div
                      className="absolute inset-0 rounded-full opacity-30"
                      style={{
                        background: `linear-gradient(to right, ${STOCK_COLORS[pos.ticker]}, ${STOCK_COLORS[pos.ticker]}40)`,
                      }}
                    />
                    <Slider
                      value={[allocations[pos.ticker] || 0]}
                      onValueChange={(value) => handleSliderChange(pos.ticker, value)}
                      max={100}
                      step={1}
                      className="relative z-10 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-4 [&_[role=slider]]:border-[#1A1F2E] [&_[role=slider]]:shadow-lg"
                      style={{
                        // @ts-ignore
                        "--slider-thumb": STOCK_COLORS[pos.ticker],
                      }}
                    />
                    <style jsx>{`
                      :global([role="slider"]) {
                        background: ${STOCK_COLORS[pos.ticker]} !important;
                      }
                    `}</style>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Indicator */}
            <div className="mt-8 flex items-center justify-between rounded-xl bg-[#0F1419] p-4">
              <span className="font-semibold text-white">Total: {total}%</span>
              {isValid ? (
                <span className="text-sm font-semibold text-emerald-400">Chang = 100%</span>
              ) : (
                <span className="text-sm font-semibold text-red-400">Must equal 100%</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                className="flex-1 gap-2 bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none"
                onClick={handleCalculate}
                disabled={!isValid}
              >
                <Calculator className="h-5 w-5" />
                Calculate Rebalance
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

"use client"

import { Drawer } from "vaul"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Check, X, CheckCircle2 } from "lucide-react"

interface Order {
  ticker: string
  action: "BUY" | "SELL" | "NO ACTION"
  quantity: number
  estimatedPrice: number
  reason: string
  totalValue?: number
}

interface RebalancePreviewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: Order[]
  summary: {
    totalSell: number
    totalBuy: number
    netCashChange: number
  } | null
  onExecute: () => void
}

const STOCK_LOGOS: Record<string, string> = {
  AAPL: "🍎",
  GOOGL: "🔍",
  TSLA: "⚡",
}

export function RebalancePreviewSheet({ open, onOpenChange, orders, summary, onExecute }: RebalancePreviewSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[90vh] max-w-2xl flex-col rounded-t-3xl bg-[#1A1F2E] outline-none">
          <div className="flex flex-1 flex-col overflow-hidden rounded-t-3xl bg-[#1A1F2E]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 p-6">
              <Drawer.Title className="text-xl font-semibold text-white">Rebalance Preview</Drawer.Title>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="mb-4 text-base font-semibold text-white">Proposed Orders</h3>

              <div className="space-y-3">
                {orders.map((order, index) => (
                  <Card
                    key={`${order.ticker}-${index}`}
                    className={`border p-4 ${
                      order.action === "SELL"
                        ? "border-red-900/50 bg-red-950/20"
                        : order.action === "BUY"
                          ? "border-emerald-900/50 bg-emerald-950/20"
                          : "border-gray-800 bg-[#0F1419]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${
                          order.action === "SELL"
                            ? "bg-red-500/20"
                            : order.action === "BUY"
                              ? "bg-emerald-500/20"
                              : "bg-gray-700/30"
                        }`}
                      >
                        {order.action === "SELL" && <ArrowDown className="h-5 w-5 text-red-400" strokeWidth={2.5} />}
                        {order.action === "BUY" && <ArrowUp className="h-5 w-5 text-emerald-400" strokeWidth={2.5} />}
                        {order.action === "NO ACTION" && <Check className="h-5 w-5 text-gray-400" strokeWidth={2.5} />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-white">
                              <span
                                className={
                                  order.action === "SELL"
                                    ? "text-red-400"
                                    : order.action === "BUY"
                                      ? "text-emerald-400"
                                      : "text-gray-400"
                                }
                              >
                                {order.action}
                              </span>{" "}
                              {order.ticker}
                            </h4>
                            {order.action !== "NO ACTION" && (
                              <>
                                <p className="mt-0.5 text-sm text-gray-400">
                                  Quantity: {order.action === "SELL" ? "~" : "~"}
                                  {Math.abs(order.quantity).toFixed(2)} shares
                                </p>
                                <p className="text-sm text-gray-400">Est. Price: ${order.estimatedPrice.toFixed(2)}</p>
                              </>
                            )}
                          </div>
                          {order.totalValue !== undefined && order.totalValue > 0 && (
                            <div className="text-right">
                              <span className="text-sm text-gray-400">Total:</span>
                              <p className="font-semibold text-white">
                                $
                                {order.totalValue.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          )}
                        </div>

                        <p
                          className={`text-sm ${
                            order.action === "SELL"
                              ? "text-red-400"
                              : order.action === "BUY"
                                ? "text-emerald-400"
                                : "text-gray-400"
                          }`}
                        >
                          <ArrowUp className="mr-1 inline h-3 w-3" />
                          {order.reason}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Summary - Better formatting for money values */}
              {summary && (
                <div className="mt-6 space-y-3 rounded-xl bg-[#0F1419] p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Sell:</span>
                    <span className="font-semibold text-white">
                      $
                      {summary.totalSell.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Buy:</span>
                    <span className="font-semibold text-white">
                      $
                      {summary.totalBuy.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-800 pt-3 text-base">
                    <span className="font-semibold text-white">Net Cash Change:</span>
                    <span className="font-bold text-white">
                      $
                      {Math.abs(summary.netCashChange).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Added checkmark icon to execute button */}
            <div className="border-t border-gray-800 p-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
                  onClick={() => onOpenChange(false)}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1 gap-2 bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
                  onClick={onExecute}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Execute Rebalance
                </Button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

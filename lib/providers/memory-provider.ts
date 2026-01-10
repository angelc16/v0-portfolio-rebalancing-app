import type { IDataProvider, Position, Order, PortfolioData, RebalanceResult } from "../data-provider"

// Mock data stored in memory
let mockPositions = [
  { ticker: "AAPL", quantity: 50, currentPrice: 200 },
  { ticker: "GOOGL", quantity: 50, currentPrice: 200 },
  { ticker: "TSLA", quantity: 20, currentPrice: 500 },
]

export class MemoryDataProvider implements IDataProvider {
  async getPortfolio(): Promise<PortfolioData> {
    // Simulate price fluctuations (±5%)
    mockPositions = mockPositions.map((pos) => {
      const priceChange = (Math.random() - 0.5) * 0.1
      return {
        ...pos,
        currentPrice: pos.currentPrice * (1 + priceChange),
      }
    })

    const positions: Position[] = mockPositions.map((pos) => ({
      ticker: pos.ticker,
      quantity: pos.quantity,
      currentPrice: pos.currentPrice,
      totalValue: pos.quantity * pos.currentPrice,
    }))

    const totalValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0)

    // Add percentages
    const positionsWithPercentages = positions.map((pos) => ({
      ...pos,
      percentage: (pos.totalValue / totalValue) * 100,
    }))

    return {
      totalValue,
      positions: positionsWithPercentages,
    }
  }

  async calculateRebalance(allocation: Record<string, number>): Promise<RebalanceResult> {
    const totalValue = mockPositions.reduce((sum, pos) => sum + pos.quantity * pos.currentPrice, 0)

    // Calculate current allocations
    const currentAllocations: Record<string, number> = {}
    mockPositions.forEach((pos) => {
      const value = pos.quantity * pos.currentPrice
      currentAllocations[pos.ticker] = (value / totalValue) * 100
    })

    // Generate orders
    const orders: Order[] = []

    // Handle existing positions
    mockPositions.forEach((pos) => {
      const targetPercentage = allocation[pos.ticker] * 100 || 0
      const currentPercentage = currentAllocations[pos.ticker]
      const targetValue = totalValue * (targetPercentage / 100)
      const currentValue = pos.quantity * pos.currentPrice
      const difference = targetValue - currentValue

      if (Math.abs(difference) < 0.01) {
        orders.push({
          ticker: pos.ticker,
          action: "NO ACTION",
          quantity: 0,
          estimatedPrice: pos.currentPrice,
          reason: `On target at ${targetPercentage.toFixed(0)}%`,
        })
      } else if (targetPercentage === 0) {
        orders.push({
          ticker: pos.ticker,
          action: "SELL",
          quantity: pos.quantity,
          estimatedPrice: pos.currentPrice,
          reason: "Total liquidation (not in allocation)",
          totalValue: pos.quantity * pos.currentPrice,
        })
      } else if (difference > 0) {
        const quantityToBuy = difference / pos.currentPrice
        orders.push({
          ticker: pos.ticker,
          action: "BUY",
          quantity: quantityToBuy,
          estimatedPrice: pos.currentPrice,
          reason: `Increase from ${currentPercentage.toFixed(0)}% to ${targetPercentage.toFixed(0)}%`,
          totalValue: difference,
        })
      } else {
        const quantityToSell = Math.abs(difference) / pos.currentPrice
        orders.push({
          ticker: pos.ticker,
          action: "SELL",
          quantity: quantityToSell,
          estimatedPrice: pos.currentPrice,
          reason: `Reduce from ${currentPercentage.toFixed(0)}% to ${targetPercentage.toFixed(0)}%`,
          totalValue: Math.abs(difference),
        })
      }
    })

    // Handle new positions not in current portfolio
    Object.keys(allocation).forEach((ticker) => {
      if (!mockPositions.find((p) => p.ticker === ticker)) {
        const targetPercentage = allocation[ticker] * 100
        const targetValue = totalValue * (targetPercentage / 100)
        const mockPrice = 150
        const quantityToBuy = targetValue / mockPrice

        orders.push({
          ticker,
          action: "BUY",
          quantity: quantityToBuy,
          estimatedPrice: mockPrice,
          reason: `New position at ${targetPercentage.toFixed(0)}%`,
          totalValue: targetValue,
        })
      }
    })

    const totalSell = orders.filter((o) => o.action === "SELL").reduce((sum, o) => sum + (o.totalValue || 0), 0)
    const totalBuy = orders.filter((o) => o.action === "BUY").reduce((sum, o) => sum + (o.totalValue || 0), 0)

    return {
      orders,
      summary: {
        totalSell,
        totalBuy,
        netCashChange: totalSell - totalBuy,
      },
    }
  }

  async executeRebalance(orders: Order[]): Promise<PortfolioData> {
    // Execute each order
    orders.forEach((order) => {
      if (order.action === "NO ACTION") return

      const existingIndex = mockPositions.findIndex((p) => p.ticker === order.ticker)

      if (order.action === "SELL") {
        if (existingIndex !== -1) {
          const newQuantity = mockPositions[existingIndex].quantity - order.quantity
          if (newQuantity <= 0.01) {
            mockPositions.splice(existingIndex, 1)
          } else {
            mockPositions[existingIndex] = {
              ...mockPositions[existingIndex],
              quantity: newQuantity,
              currentPrice: order.estimatedPrice,
            }
          }
        }
      } else if (order.action === "BUY") {
        if (existingIndex !== -1) {
          mockPositions[existingIndex] = {
            ...mockPositions[existingIndex],
            quantity: mockPositions[existingIndex].quantity + order.quantity,
            currentPrice: order.estimatedPrice,
          }
        } else {
          mockPositions.push({
            ticker: order.ticker,
            quantity: order.quantity,
            currentPrice: order.estimatedPrice,
          })
        }
      }
    })

    // Return updated portfolio
    return this.getPortfolio()
  }
}

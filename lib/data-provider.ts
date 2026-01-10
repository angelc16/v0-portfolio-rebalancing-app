export interface Position {
  ticker: string
  quantity: number
  currentPrice: number
  totalValue: number
  percentage?: number
}

export interface Order {
  ticker: string
  action: "BUY" | "SELL" | "NO ACTION"
  quantity: number
  estimatedPrice: number
  reason: string
  totalValue?: number
}

export interface PortfolioData {
  totalValue: number
  positions: Position[]
}

export interface RebalanceResult {
  orders: Order[]
  summary: {
    totalSell: number
    totalBuy: number
    netCashChange: number
  }
}

// Interface for data provider implementations
export interface IDataProvider {
  getPortfolio(): Promise<PortfolioData>
  calculateRebalance(allocation: Record<string, number>): Promise<RebalanceResult>
  executeRebalance(orders: Order[]): Promise<PortfolioData>
}

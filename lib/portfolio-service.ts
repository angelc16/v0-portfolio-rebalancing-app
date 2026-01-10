import type { IDataProvider } from "./data-provider"
import { MemoryDataProvider } from "./providers/memory-provider"

// Singleton instance - using only memory provider for now
let portfolioService: IDataProvider | null = null

export function getPortfolioService(): IDataProvider {
  if (!portfolioService) {
    portfolioService = new MemoryDataProvider()
  }
  return portfolioService
}

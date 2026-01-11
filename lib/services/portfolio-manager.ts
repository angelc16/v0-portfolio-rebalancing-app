import { AllocationTarget, RebalanceOrder } from '../domain-types';
import { PortfolioStore } from '../store'; // Persistence
import { Portfolio } from '../models/portfolio';
import { Stock } from '../models/stock';

// Application Service
export class PortfolioManager {
  private portfolio: Portfolio;

  constructor() {
    const state = PortfolioStore.load();
    const stocks = state.positions.map(Stock.create);
    this.portfolio = new Portfolio(stocks, state.cashAvailable);
  }


  public getPortfolioData() {
    // 1. Refresh Prices (Disabled for stability)
    this.portfolio.refreshMarketPrices();

    // 2. Save state
    this.save();

    // 3. Return DTO for UI
    return this.portfolio.toDTO();
  }


  public calculateRebalance(allocation: AllocationTarget) {
    // this.portfolio.refreshMarketPrices();

    const { orders, totalBuy, totalSell } = this.portfolio.calculateRebalanceOrders(allocation);

    return {
      orders,
      summary: {
        totalSell,
        totalBuy,
        netCashChange: totalSell - totalBuy
      }
    };
  }


  public executeRebalance(orders: RebalanceOrder[]) {
    this.portfolio.executeOrders(orders);

    // Save state
    this.save();

    // Return DTO for UI
    return this.portfolio.toDTO();
  }


  private save() {
    // Update the global store
    const newState = this.portfolio.toState();
    PortfolioStore.save(newState);
  }
}

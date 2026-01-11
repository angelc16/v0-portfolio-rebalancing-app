import { StockData } from '../domain-types';

export class Stock implements StockData {

  static create(data: StockData): Stock {
    return new Stock(
      data.ticker,
      data.name,
      data.quantity,
      data.currentPrice,
      data.logoUrl,
      data.color
    );
  }

  constructor(
    public ticker: string,
    public name: string,
    public quantity: number,
    public currentPrice: number,
    public logoUrl?: string,
    public color?: string
  ) {}

  get totalValue(): number {
    return this.quantity * this.currentPrice;
  }

  /**
   * Simula la fluctuación del precio de mercado
   */
  public fluctuatePrice(): void {
    const change = this.currentPrice * (Math.random() * 0.3 - 0.15); // +/- 15%
    this.currentPrice = parseFloat((this.currentPrice + change).toFixed(2));
  }

  public addShares(quantity: number): void {
    this.quantity += quantity;
  }

  public removeShares(quantity: number): void {
    // this.quantity = Math.max(0, this.quantity - quantity);
    this.quantity = Math.max(0, this.quantity - quantity);
  }

  public updatePrice(price: number): void {
    this.currentPrice = price;
  }

  public isEmpty(): boolean {
    return this.quantity <= 0.0001;
  }

  // Returns data formatted for the API/View
  public toDTO(totalPortfolioValue: number) {
    return {
      ticker: this.ticker,
      name: this.name,
      quantity: this.quantity,
      currentPrice: this.currentPrice,
      totalValue: this.totalValue,
      percentage: totalPortfolioValue > 0 ? (this.totalValue / totalPortfolioValue) * 100 : 0,
      logoUrl: this.logoUrl,
      color: this.color
    };
  }
}

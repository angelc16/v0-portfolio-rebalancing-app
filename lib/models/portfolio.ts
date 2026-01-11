import { Stock } from "./stock";
import {
  PortfolioState,
  RebalanceOrder,
  AllocationTarget,
} from "../domain-types";

export class Portfolio {
  private stocks: Stock[];
  private cashAvailable: number = 0;

  constructor(stocks: Stock[] = [], initialCash: number = 0) {
    this.stocks = stocks;
    this.cashAvailable = initialCash;
  }

  get totalValue(): number {
    return this.stocks.reduce((sum, s) => sum + s.totalValue, 0);
  }

  public getStock(ticker: string): Stock | undefined {
    return this.stocks.find((s) => s.ticker === ticker);
  }

  public getAllStocks(): Stock[] {
    return [...this.stocks];
  }

  public addStock(stock: Stock) {
    this.stocks.push(stock);
  }

  public removeStock(ticker: string) {
    this.stocks = this.stocks.filter((s) => s.ticker !== ticker);
  }

  public refreshMarketPrices() {
    this.stocks.forEach((stock) => stock.fluctuatePrice());
  }

  public calculateRebalanceOrders(targetAllocation: AllocationTarget): {
    orders: RebalanceOrder[];
    totalBuy: number;
    totalSell: number;
  } {
    const orders: RebalanceOrder[] = [];
    let totalBuy = 0;
    let totalSell = 0;
    const totalValue = this.totalValue;

    // 1. Get all involved tickers (Existing + Target)
    const currentStocks = this.getAllStocks();
    const currentTickers = currentStocks.map((s) => s.ticker);
    const targetTickers = Object.keys(targetAllocation);
    const allTickers = new Set([...currentTickers, ...targetTickers]);

    allTickers.forEach((ticker) => {
      const order = this.calculateOrderForTicker(
        ticker,
        targetAllocation,
        totalValue
      );
      if (order) {
        orders.push(order);
        if (order.action === "BUY") {
          totalBuy += order.totalValue || 0;
        } else {
          totalSell += order.totalValue || 0;
        }
      }
    });

    return { orders, totalBuy, totalSell };
  }

  private calculateOrderForTicker(
    ticker: string,
    targetAllocation: AllocationTarget,
    totalPortfolioValue: number
  ): RebalanceOrder | null {
    const stock = this.getStock(ticker);
    const MIN_ORDER_VALUE = 1;

    const currentQty = stock ? stock.quantity : 0;
    const price = stock ? stock.currentPrice : 150; // Mock price for new stocks
    const currentVal = currentQty * price;

    const targetPct = targetAllocation[ticker] || 0; // 0 if not in target
    const targetVal = totalPortfolioValue * targetPct;

    const deltaValue = targetVal - currentVal;

    // Threshold to avoid micro-transactions
    if (Math.abs(deltaValue) > MIN_ORDER_VALUE) {
      const action = deltaValue > 0 ? "BUY" : "SELL";
      const quantity = Math.abs(deltaValue / price);
      const totalAmount = parseFloat(Math.abs(deltaValue).toFixed(2));

      return {
        ticker,
        action,
        quantity: parseFloat(quantity.toFixed(4)),
        estimatedPrice: price,
        totalAmount: totalAmount,
        totalValue: totalAmount,
        reason:
          targetPct === 0
            ? "Liquidation: Not in target allocation"
            : `Rebalance: ${((currentVal / totalPortfolioValue) * 100).toFixed(
                1
              )}% -> ${(targetPct * 100).toFixed(1)}%`,
      };
    }
    return null;
  }


  public executeOrders(orders: RebalanceOrder[]) {
    // 1. Fase de VENTA: Generar liquidez primero
    const sellOrders = orders.filter((o) => o.action === "SELL");
    const buyOrders = orders.filter((o) => o.action === "BUY");

    // Usamos una variable temporal para el dinero de esta transacción
    // (Asumimos que cashAvailable es 0 o lo que tengas en caja)
    let transactionCash = this.cashAvailable;

    console.log("--- INICIO EJECUCIÓN ---");
    console.log(`Caja Inicial: ${transactionCash}`);

    sellOrders.forEach((order) => {
      const stock = this.getStock(order.ticker);
      if (stock) {
        // SEGURIDAD: No vender más de lo que existe
        const quantityToSell = Math.min(stock.quantity, order.quantity);
        const executionPrice = order.estimatedPrice;

        const cashGenerated = quantityToSell * executionPrice;
        transactionCash += cashGenerated;

        // Ejecutar la venta en el modelo
        stock.removeShares(quantityToSell);
        stock.updatePrice(executionPrice);

        console.log(
          `VENTA ${order.ticker}: -${quantityToSell} acciones a $${executionPrice}. Cash generado: $${cashGenerated}`
        );

        // Limpieza si quedó vacío (solo si es < 0.0001)
        if (stock.isEmpty()) {
          this.removeStock(stock.ticker);
        }
      }
    });

    console.log(`Caja tras Ventas: ${transactionCash}`);

    // 2. Fase de COMPRA: Consumir liquidez
    buyOrders.forEach((order) => {
      let stock = this.getStock(order.ticker);
      if (!stock) {
        throw new Error(`Stock ${order.ticker} no encontrado para compra.`);
      }
      const executionPrice = order.estimatedPrice;

      // Costo teórico total de la orden
      const intendedCost = order.quantity * executionPrice;

      // SEGURIDAD CRÍTICA: Ajustar cantidad al dinero disponible real
      // Si no hay dinero suficiente, recalculamos la cantidad máxima posible
      let finalQuantity = order.quantity;

      if (transactionCash < intendedCost) {
        // Evitamos números negativos o NaN
        if (executionPrice > 0) {
          // Redondeamos hacia abajo para no pasarnos
          finalQuantity = Math.floor(transactionCash / executionPrice);
          console.warn(
            `[ALERTA] Fondos insuficientes para ${order.ticker}. Solicitado: ${order.quantity}, Ajustado a: ${finalQuantity}`
          );
        } else {
          finalQuantity = 0;
        }
      }

      if (finalQuantity > 0) {
        const actualCost = finalQuantity * executionPrice;

        // Si la acción no existe (compra nueva), la creamos
        if (!stock) {
          stock = new Stock(order.ticker, order.ticker, 0, executionPrice);
          this.addStock(stock);
        }

        // Ejecutar la compra
        stock.addShares(finalQuantity);
        stock.updatePrice(executionPrice);

        // Restar dinero de la caja
        transactionCash -= actualCost;

        console.log(
          `COMPRA ${order.ticker}: +${finalQuantity} acciones a $${executionPrice}. Costo: $${actualCost}`
        );
      }
    });

    this.cashAvailable = Math.max(0, parseFloat(transactionCash.toFixed(2)));
    console.log(`Caja Final: ${this.cashAvailable}`);
    console.log("--- FIN EJECUCIÓN ---");
  }

  // Converts Domain State --> Persistence State
  public toState(): PortfolioState {
    return {
      totalValue: this.totalValue,
      cashAvailable: this.cashAvailable,
      positions: this.stocks.map((s) => ({
        ticker: s.ticker,
        name: s.name,
        quantity: s.quantity,
        currentPrice: s.currentPrice,
        totalValue: s.totalValue,
        logoUrl: s.logoUrl,
        color: s.color,
      })),
    };
  }

  // Converts Domain State --> API Response (Formatted with percentages etc)
  public toDTO() {
    const total = this.totalValue + this.cashAvailable;
    return {
      totalValue: total,
      positions: this.stocks.map((stock) => stock.toDTO(total)),
    };
  }
}

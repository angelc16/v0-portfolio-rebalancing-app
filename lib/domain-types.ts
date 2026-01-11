// Definimos los datos puros de una acción (sin métodos)
export interface StockData {
  ticker: string;
  name: string;
  quantity: number;
  currentPrice: number;
  logoUrl?: string;
  color?: string;
}

// Position hereda los datos de StockData y agrega campos de UI
export interface Position extends StockData {
  totalValue: number;
  percentage?: number;
}

// Representa la intención del usuario (Input)
// Ejemplo: { "META": 0.4, "AAPL": 0.6 }
export type AllocationTarget = Record<string, number>;

// La orden resultante del cálculo
export interface RebalanceOrder {
  ticker: string;
  action: "BUY" | "SELL" | "NO ACTION";
  quantity: number; // Siempre positivo
  estimatedPrice: number;
  totalAmount: number; // Dinero estimado a mover
  totalValue?: number; // Alias de totalAmount para compatibilidad con UI
  reason: string;
}

// Estado del Portafolio
export interface PortfolioState {
  positions: Position[];
  totalValue: number;
  cashAvailable: number;
}

import { PortfolioState } from './domain-types';
import fs from 'fs';
import path from 'path';

const DEFAULT_STATE: PortfolioState = {
  totalValue: 20000,
  cashAvailable: 0,
  positions: [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      quantity: 120,
      currentPrice: 50,
      totalValue: 6000,
      color: "#5B9FFF",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
    },
    {
      ticker: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 50,
      currentPrice: 80,
      totalValue: 4000,
      color: "#FF8A4D",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
    },
    {
      ticker: 'TSLA',
      name: 'Tesla Inc.',
      quantity: 200,
      currentPrice: 30,
      totalValue: 6000,
      color: "#4DFFB8",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png"
    },
    {
      ticker: 'IBM',
      name: 'IBM Corp',
      quantity: 200,
      currentPrice: 20,
      totalValue: 4000,
      color: "#A78BFA"
    }
  ]
};


const DB_PATH = path.join(process.cwd(), 'portfolio-db.json');

export const PortfolioStore = {
  // Cargar estado desde el archivo
  load: (): PortfolioState => {
    try {
      if (!fs.existsSync(DB_PATH)) {
        // Si no existe, creamos uno con los datos default
        PortfolioStore.save(DEFAULT_STATE);
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error cargando DB:", error);
      return DEFAULT_STATE;
    }
  },

  // Guardar estado en el archivo
  save: (state: PortfolioState): void => {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error("Error guardando DB:", error);
    }
  },

  // Reiniciar a valores de fábrica (útil para pruebas)
  reset: (): PortfolioState => {
      PortfolioStore.save(DEFAULT_STATE);
      return DEFAULT_STATE;
  }
};
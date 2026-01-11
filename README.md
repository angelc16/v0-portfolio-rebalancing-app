# Portfolio rebalancing app

## Getting Started

To run this project locally:

1.  Install dependencies:
    ```bash
    pnpm install
    ```

2.  Start the development server:
    ```bash
    pnpm dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Solution Architecture & Key Decisions

This application follows a **Domain-Driven Design (DDD)** approach to separate business logic from the UI and infrastructure.

### Core Concepts

1.  **Domain Models (`lib/models/`)**:
    *   **Portfolio**: The aggregate root. It encapsulates the state (list of Stocks) and business actions (calculation of total value, rebalancing logic).
    *   **Stock**: Value object representing a single holding. Contains logic for price updates and DTO conversion.

2.  **Application Service (`lib/services/portfolio-manager.ts`)**:
    *   Acts as a facade. It orchestrates the flow between the API, the Domain Models, and the Persistence layer (Store).
    *   Handles "transactions" (calculating rebalance -> returning summary).

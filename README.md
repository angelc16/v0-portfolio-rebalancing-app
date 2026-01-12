# Portfolio rebalancing app

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://v0-portfolio-rebalancing-app-plum.vercel.app/)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/qtwYSoHPgJ4)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[[https://vercel.com/angelc16s-projects/v0-portfolio-rebalancing-app](https://vercel.com/angelc16s-projects/v0-portfolio-rebalancing-app)](https://v0-portfolio-rebalancing-app-plum.vercel.app/)**


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

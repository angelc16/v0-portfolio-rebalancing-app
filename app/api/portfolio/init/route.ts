import { NextResponse } from "next/server"
import { getPortfolioService } from "@/lib/portfolio-service"

export async function GET() {
  try {
    const service = getPortfolioService()
    const data = await service.getPortfolio()

    return NextResponse.json({
      message: "Portfolio initialized",
      data,
    })
  } catch (error) {
    console.error("[v0] Error initializing portfolio:", error)
    return NextResponse.json({ error: "Failed to initialize portfolio" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getPortfolioService } from "@/lib/portfolio-service"

export async function POST(request: Request) {
  try {
    const { allocation } = await request.json()

    if (!allocation || typeof allocation !== "object") {
      return NextResponse.json({ error: "Invalid allocation format" }, { status: 400 })
    }

    const service = getPortfolioService()
    const result = await service.calculateRebalance(allocation)

    return NextResponse.json({
      message: "Rebalance calculated successfully",
      ...result,
    })
  } catch (error) {
    console.error("[v0] Error calculating rebalance:", error)
    return NextResponse.json({ error: "Failed to calculate rebalance" }, { status: 500 })
  }
}

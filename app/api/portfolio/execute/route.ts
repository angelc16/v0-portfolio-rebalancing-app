import { NextResponse } from "next/server"
import { getPortfolioService } from "@/lib/portfolio-service"
import type { Order } from "@/lib/data-provider"

export async function POST(request: Request) {
  try {
    const { orders } = await request.json()

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: "Invalid orders format" }, { status: 400 })
    }

    const service = getPortfolioService()
    const data = await service.executeRebalance(orders as Order[])

    return NextResponse.json({
      message: "Rebalance executed. Portfolio updated.",
      data,
    })
  } catch (error) {
    console.error("[v0] Error executing rebalance:", error)
    return NextResponse.json({ error: "Failed to execute rebalance" }, { status: 500 })
  }
}

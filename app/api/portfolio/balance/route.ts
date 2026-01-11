import { NextResponse } from "next/server"
import { PortfolioManager } from "@/lib/services/portfolio-manager"
import { AllocationTarget } from "@/lib/domain-types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const allocation: AllocationTarget = body.allocation

    if (!allocation || typeof allocation !== "object") {
      return NextResponse.json({ error: "Invalid allocation format" }, { status: 400 })
    }

    const manager = new PortfolioManager()
    const result = manager.calculateRebalance(allocation)

    return NextResponse.json({
      message: "Rebalance calculated successfully",
      ...result,
    })
  } catch (error) {
    console.error("[v0] Error calculating rebalance:", error)
    return NextResponse.json({ error: "Failed to calculate rebalance" }, { status: 500 })
  }
}

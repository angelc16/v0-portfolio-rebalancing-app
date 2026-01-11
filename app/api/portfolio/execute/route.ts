import { NextResponse } from "next/server"
import { PortfolioManager } from "@/lib/services/portfolio-manager"
import { RebalanceOrder } from "@/lib/domain-types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orders: RebalanceOrder[] = body.orders.map((o: any) => ({
        ...o,
        totalAmount: o.totalValue
    }))

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: "Invalid orders format" }, { status: 400 })
    }

    const manager = new PortfolioManager()
    const data = manager.executeRebalance(orders)

    return NextResponse.json({
      message: "Rebalance executed. Portfolio updated.",
      data,
    })
  } catch (error) {
    console.error("[v0] Error executing rebalance:", error)
    return NextResponse.json({ error: "Failed to execute rebalance" }, { status: 500 })
  }
}

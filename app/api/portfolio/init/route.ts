import { NextResponse } from "next/server"
import { PortfolioManager } from "@/lib/services/portfolio-manager"

export async function GET() {
  try {
    const manager = new PortfolioManager()
    const data = manager.getPortfolioData()

    return NextResponse.json({
      message: "Portfolio initialized",
      data,
    })
  } catch (error) {
    console.error("[v0] Error initializing portfolio:", error)
    return NextResponse.json({ error: "Failed to initialize portfolio" }, { status: 500 })
  }
}

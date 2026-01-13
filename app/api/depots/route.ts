import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET() {
  try {
    console.log("[v0] Fetching depots from Neon...")
    console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)

    const depots = await sql`
      SELECT * FROM depots 
      WHERE status = 'active'
      ORDER BY name
    `

    console.log("[v0] Depots fetched successfully:", depots.length)
    return NextResponse.json(depots)
  } catch (error) {
    console.error("[v0] Depots fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch depots",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

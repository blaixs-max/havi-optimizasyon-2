import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET() {
  try {
    const depots = await sql`
      SELECT * FROM depots 
      WHERE status = 'active'
      ORDER BY name
    `
    return NextResponse.json(depots)
  } catch (error) {
    console.error("[v0] Depots fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch depots" }, { status: 500 })
  }
}

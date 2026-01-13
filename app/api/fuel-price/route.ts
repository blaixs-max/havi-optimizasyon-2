import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET() {
  try {
    const result = await sql`
      SELECT price_per_liter 
      FROM fuel_prices 
      WHERE fuel_type = 'diesel'
      ORDER BY effective_date DESC 
      LIMIT 1
    `

    const fuelPrice = result[0]?.price_per_liter || 47.5
    return NextResponse.json({ price: fuelPrice })
  } catch (error) {
    console.error("[v0] Fuel price fetch error:", error)
    return NextResponse.json({ price: 47.5 })
  }
}

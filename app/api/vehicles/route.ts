import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET() {
  try {
    const vehicles = await sql`
      SELECT v.*, d.name as depot_name, d.city as depot_city
      FROM vehicles v
      LEFT JOIN depots d ON v.depot_id = d.id
      WHERE v.status IN ('available', 'in_route')
      ORDER BY v.plate
    `
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("[v0] Vehicles fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

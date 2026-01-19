import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const depotId = searchParams.get("depot_id")
    
    console.log("[v0] Fetching vehicles from Neon...")
    console.log("[v0] Depot filter:", depotId || "all")
    console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)

    const vehicles = depotId
      ? await sql`
          SELECT v.*, d.name as depot_name, d.city as depot_city
          FROM vehicles v
          LEFT JOIN depots d ON v.depot_id = d.id
          WHERE v.status IN ('available', 'in_route') AND v.depot_id = ${depotId}
          ORDER BY v.plate
        `
      : await sql`
          SELECT v.*, d.name as depot_name, d.city as depot_city
          FROM vehicles v
          LEFT JOIN depots d ON v.depot_id = d.id
          WHERE v.status IN ('available', 'in_route')
          ORDER BY v.plate
        `

    console.log("[v0] Vehicles fetched successfully:", vehicles.length)
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("[v0] Vehicles fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch vehicles",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

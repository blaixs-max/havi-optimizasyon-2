import { type NextRequest, NextResponse } from "next/server"

console.log("[v0] OPTIMIZE ROUTE MODULE LOADED")
console.log("[v0] RAILWAY_API_URL:", process.env.RAILWAY_API_URL)

async function optimizeWithRailway(
  depots: any[],
  vehicles: any[],
  customers: any[],
  orders: any[],
  options: any,
): Promise<any> {
  console.log("[v0] ==========  RAILWAY OPTIMIZATION STARTING ==========")

  if (!process.env.RAILWAY_API_URL) {
    throw new Error("Railway API URL not configured")
  }

  const railwayRequest = {
    depots: depots.map((d) => ({
      id: d.id,
      name: d.name,
      location: { lat: d.lat, lng: d.lng },
    })),
    customers: customers.map((c) => ({
      id: c.id,
      name: c.name,
      location: { lat: c.lat, lng: c.lng },
      demand_pallets: c.demand_pallets || 1,
      business_type: c.business_type || "restaurant",
      service_duration: c.service_duration || 30,
      has_time_constraint: c.has_time_constraint || false,
      constraint_start_time: c.constraint_start_time || null,
      constraint_end_time: c.constraint_end_time || null,
      required_vehicle_types: c.required_vehicle_types || null,
    })),
    vehicles: vehicles.map((v) => ({
      id: v.id,
      type: 2,
      capacity_pallets: v.capacity_pallet || 12,
      fuel_consumption: v.fuel_consumption || 25,
      plate: v.plate || v.license_plate || `${v.id}`,
    })),
    fuel_price: options.fuelPricePerLiter || 47.5,
  }

  console.log("[v0] Railway request prepared, calling API...")

  const railwayResponse = await fetch(`${process.env.RAILWAY_API_URL}/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(railwayRequest),
    signal: AbortSignal.timeout(60000),
  })

  if (!railwayResponse.ok) {
    throw new Error(`Railway API error: ${railwayResponse.status}`)
  }

  const railwayResult = await railwayResponse.json()
  console.log("[v0] Railway optimization completed successfully")

  return {
    success: true,
    algorithm: "ortools",
    provider: "ortools-railway",
    routes: railwayResult.routes || [],
    summary: railwayResult.summary || {},
  }
}

export async function POST(req: NextRequest) {
  console.log("[v0] ========== POST /api/optimize CALLED ==========")

  try {
    const body = await req.json()
    console.log("[v0] Request body received")

    const { depots, vehicles, customers, orders = [], algorithm = "ortools" } = body

    if (!depots || !vehicles || !customers) {
      console.error("[v0] Missing required data")
      return NextResponse.json({ success: false, error: "Missing required data" }, { status: 400 })
    }

    console.log("[v0] Starting optimization...")

    const result = await optimizeWithRailway(depots, vehicles, customers, orders, { fuelPricePerLiter: 47.5 })

    console.log("[v0] Returning optimization result")
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[v0] Optimization error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export const maxDuration = 60

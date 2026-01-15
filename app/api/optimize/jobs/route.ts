import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

console.log("[v0] Jobs route module loaded")

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  console.log("[v0] GET /api/optimize/jobs called")
  return NextResponse.json({
    message: "Jobs API is working",
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: Request) {
  console.log("[v0] POST /api/optimize/jobs called - START")

  try {
    console.log("[v0] Reading request body...")
    const requestData = await request.json()

    console.log("[v0] Request data parsed successfully")
    console.log("[v0] Depots:", requestData.depots?.length)
    console.log("[v0] Vehicles:", requestData.vehicles?.length)
    console.log("[v0] Customers:", requestData.customers?.length)

    console.log("[v0] Inserting into database...")
    const result = await sql`
      INSERT INTO optimization_jobs (request_data, status)
      VALUES (${JSON.stringify(requestData)}, 'pending')
      RETURNING id, status, created_at
    `

    const job = result[0]
    console.log("[v0] Job created successfully:", job.id)

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      createdAt: job.created_at,
    })
  } catch (error) {
    console.error("[v0] POST handler error:", error)
    console.error("[v0] Error name:", error instanceof Error ? error.name : "unknown")
    console.error("[v0] Error message:", error instanceof Error ? error.message : "unknown")

    return NextResponse.json(
      { error: "Failed to create job", details: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    )
  }
}

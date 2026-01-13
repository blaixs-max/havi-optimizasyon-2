import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET() {
  try {
    const customers = await sql`
      SELECT c.*, d.name as depot_name
      FROM customers c
      LEFT JOIN depots d ON c.assigned_depot_id = d.id
      WHERE c.status = 'pending'
      ORDER BY c.name
    `
    return NextResponse.json(customers)
  } catch (error) {
    console.error("[v0] Customers fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

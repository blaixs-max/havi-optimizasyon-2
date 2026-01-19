import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import type { NextRequest } from "next/server"

const sql = neon(process.env.DATABASE_URL || "")

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const depotId = searchParams.get("depot_id")
    
    console.log("[v0] GET /api/orders called")
    console.log("[v0] Depot filter:", depotId || "all")
    
    const orders = depotId
      ? await sql`
          SELECT 
            o.id,
            o.customer_id,
            c.name as customer_name,
            c.city,
            c.district,
            o.order_date,
            o.pallets,
            o.status,
            o.delivery_date,
            o.notes,
            o.created_at
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.id
          WHERE c.assigned_depot_id = ${depotId}
          ORDER BY o.order_date DESC, o.created_at DESC
        `
      : await sql`
          SELECT 
            o.id,
            o.customer_id,
            c.name as customer_name,
            c.city,
            c.district,
            o.order_date,
            o.pallets,
            o.status,
            o.delivery_date,
            o.notes,
            o.created_at
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.id
          ORDER BY o.order_date DESC, o.created_at DESC
        `

    console.log("[v0] Orders fetched from DB:", orders.length)
    console.log(
      "[v0] First 3 orders:",
      orders.slice(0, 3).map((o) => ({ id: o.id, customer: o.customer_name, pallets: o.pallets })),
    )

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error("[v0] Failed to fetch orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer_id, pallets, order_date, notes } = body

    const [order] = await sql`
      INSERT INTO orders (customer_id, pallets, order_date, notes)
      VALUES (${customer_id}, ${pallets}, ${order_date || new Date().toISOString().split("T")[0]}, ${notes || null})
      RETURNING *
    `

    return NextResponse.json(order)
  } catch (error: any) {
    console.error("[v0] Failed to create order:", error)
    return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 })
    }

    await sql`DELETE FROM orders WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Failed to delete order:", error)
    return NextResponse.json({ error: "Failed to delete order", details: error.message }, { status: 500 })
  }
}

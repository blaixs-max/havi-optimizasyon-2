import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    tests: {}
  }

  // Test 1: Database Connection
  try {
    const result = await sql`SELECT 1 as test`
    diagnostics.tests.database_connection = {
      status: "✅ SUCCESS",
      result: result[0]
    }
  } catch (error) {
    diagnostics.tests.database_connection = {
      status: "❌ FAILED",
      error: error instanceof Error ? error.message : String(error)
    }
  }

  // Test 2: Depots Table
  try {
    const depots = await sql`SELECT id, name FROM depots LIMIT 3`
    diagnostics.tests.depots = {
      status: "✅ SUCCESS",
      count: depots.length,
      sample: depots
    }
  } catch (error) {
    diagnostics.tests.depots = {
      status: "❌ FAILED",
      error: error instanceof Error ? error.message : String(error)
    }
  }

  // Test 3: Customers Table
  try {
    const customers = await sql`SELECT id, name, assigned_depot_id FROM customers LIMIT 3`
    diagnostics.tests.customers = {
      status: "✅ SUCCESS",
      count: customers.length,
      sample: customers
    }
  } catch (error) {
    diagnostics.tests.customers = {
      status: "❌ FAILED",
      error: error instanceof Error ? error.message : String(error)
    }
  }

  // Test 4: Orders Table
  try {
    const orders = await sql`SELECT id, order_number, customer_id, status FROM orders LIMIT 3`
    diagnostics.tests.orders = {
      status: "✅ SUCCESS",
      count: orders.length,
      sample: orders
    }
  } catch (error) {
    diagnostics.tests.orders = {
      status: "❌ FAILED",
      error: error instanceof Error ? error.message : String(error)
    }
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    }
  })
}

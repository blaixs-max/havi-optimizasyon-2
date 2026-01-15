import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params

    const result = await sql`
      SELECT id, status, result_data, error_message, 
             created_at, started_at, completed_at, processing_time_seconds
      FROM optimization_jobs
      WHERE id = ${jobId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const job = result[0]

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      result: job.result_data,
      error: job.error_message,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      processingTimeSeconds: job.processing_time_seconds,
    })
  } catch (error) {
    console.error("Failed to get job status:", error)
    return NextResponse.json({ error: "Failed to get job status" }, { status: 500 })
  }
}

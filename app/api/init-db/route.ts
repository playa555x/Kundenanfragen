import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/database"

export async function GET() {
  try {
    const result = await initializeDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error initializing database",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}


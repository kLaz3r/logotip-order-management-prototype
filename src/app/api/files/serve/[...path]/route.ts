import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const { path } = await params
  const filePath = join(process.cwd(), "uploads", ...path)

  try {
    const buffer = await readFile(filePath)
    const ext = path[path.length - 1].split(".").pop()?.toLowerCase()

    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      svg: "image/svg+xml",
      ai: "application/postscript",
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeTypes[ext || ""] || "application/octet-stream",
        "Content-Disposition": `inline`,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch {
    return NextResponse.json({ error: "Fișier negăsit" }, { status: 404 })
  }
}

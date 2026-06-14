import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const orderId = formData.get("orderId") as string

    if (!file || !orderId) {
      return NextResponse.json(
        { error: "Fișier și ID comandă obligatorii" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: "Comandă negăsită" }, { status: 404 })
    }

    const ext = file.name.split(".").pop() || "bin"
    const storedName = `${uuidv4()}.${ext}`
    const uploadDir = join(process.cwd(), "uploads", orderId)
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = join(uploadDir, storedName)
    await writeFile(filePath, buffer)

    const created = await prisma.file.create({
      data: {
        orderId,
        filename: file.name,
        path: `uploads/${orderId}/${storedName}`,
        mimetype: file.type,
        size: buffer.length,
        uploadedBy: session.id,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Eroare la încărcarea fișierului" },
      { status: 500 }
    )
  }
}

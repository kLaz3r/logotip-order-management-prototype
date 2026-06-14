import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          createdBy: { select: { name: true } },
          _count: { select: { items: true, files: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!customer) {
    return NextResponse.json({ error: "Client negăsit" }, { status: 404 })
  }

  return NextResponse.json(customer)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const { id } = await params
  const data = await request.json()
  const customer = await prisma.customer.update({ where: { id }, data })
  return NextResponse.json(customer)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const { id } = await params
  await prisma.customer.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

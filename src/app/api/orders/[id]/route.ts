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
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { id: true, name: true, email: true } },
      items: {
        include: { product: true },
      },
      files: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Comandă negăsită" }, { status: 404 })
  }

  return NextResponse.json(order)
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
  const { items: itemsData, ...orderData } = data

  await prisma.orderItem.deleteMany({ where: { orderId: id } })

  const updateData: Record<string, unknown> = { ...orderData }

  if (itemsData && Array.isArray(itemsData)) {
    updateData.items = {
      create: itemsData.map((item: { productId: string; quantity: number; price: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    }
  }

  updateData.totalPrice = itemsData
    ? itemsData.reduce((sum: number, item: { price: number }) => sum + item.price, 0)
    : 0

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      customer: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      items: { include: { product: true } },
      files: true,
    },
  })

  return NextResponse.json(order)
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
  await prisma.order.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

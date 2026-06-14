import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession, hashPassword } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 })
  }

  const { name, email, password, role } = await request.json()

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nume, email și parolă obligatorii" },
      { status: 400 }
    )
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: "Email deja utilizat" },
      { status: 409 }
    )
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: role || "EMPLOYEE" },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}

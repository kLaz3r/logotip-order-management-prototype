import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createSession, verifyPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email și parola sunt obligatorii" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { error: "Email sau parolă incorecte" },
        { status: 401 }
      )
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "Cont dezactivat" },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)

    if (!valid) {
      return NextResponse.json(
        { error: "Parolă incorectă" },
        { status: 401 }
      )
    }

    await createSession(user.id, user.email, user.role)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch {
    return NextResponse.json(
      { error: "Eroare internă" },
      { status: 500 }
    )
  }
}

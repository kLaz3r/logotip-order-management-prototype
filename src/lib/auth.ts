import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const AUTH_SECRET = process.env.AUTH_SECRET || "fallback-secret"
const SESSION_COOKIE = "logotip_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

interface SessionPayload {
  id: string
  email: string
  role: string
  exp: number
}

function sign(payload: Omit<SessionPayload, "exp">): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  const data = JSON.stringify({ ...payload, exp })
  const encoded = Buffer.from(data).toString("base64url")
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encoded)
    .digest("base64url")
  return `${encoded}.${signature}`
}

function verify(token: string): SessionPayload | null {
  try {
    const [encoded, signature] = token.split(".")
    const expectedSig = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(encoded)
      .digest("base64url")
    if (signature !== expectedSig) return null

    const payload: SessionPayload = JSON.parse(
      Buffer.from(encoded, "base64url").toString()
    )
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export async function createSession(userId: string, email: string, role: string) {
  const token = sign({ id: userId, email, role })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<{
  id: string
  email: string
  role: string
} | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verify(token)
  if (!payload) return null
  return { id: payload.id, email: payload.email, role: payload.role }
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, active: true },
  })
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

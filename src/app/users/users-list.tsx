"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { Modal } from "@/components/ui/modal"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "@/components/ui/table"
import { cn, formatDate, ROLE_LABELS } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  createdAt: string
  _count: { orders: number }
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: ROLE_LABELS.ADMIN || "Administrator" },
  { value: "EMPLOYEE", label: ROLE_LABELS.EMPLOYEE || "Angajat" },
]

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [unauthorized, setUnauthorized] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("EMPLOYEE")
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState("")

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users")
        if (res.status === 403) {
          setUnauthorized(true)
          setLoading(false)
          return
        }
        if (!res.ok) throw new Error("Eroare la încărcare")
        setUsers(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Eroare la încărcare")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  async function handleToggleActive(user: User) {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      })
      if (!res.ok) {
        if (res.status === 403) {
          setError("Nu aveți permisiuni de administrator")
          return
        }
        throw new Error("Eroare la actualizare")
      }
      const updated = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la actualizare")
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    setAddError("")

    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setAddError("Toate câmpurile sunt obligatorii")
      return
    }

    setAddLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          role: newRole,
        }),
      })
      if (!res.ok) {
        if (res.status === 403) throw new Error("Nu aveți permisiuni de administrator")
        const data = await res.json()
        throw new Error(data.error || "Eroare la crearea utilizatorului")
      }
      const user = await res.json()
      setUsers((prev) => [...prev, { ...user, _count: { orders: 0 } }])
      setShowModal(false)
      setNewName("")
      setNewEmail("")
      setNewPassword("")
      setNewRole("EMPLOYEE")
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Eroare la crearea utilizatorului")
    } finally {
      setAddLoading(false)
    }
  }

  if (unauthorized) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Utilizatori</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16">
          <p className="text-sm text-gray-500">
            Nu aveți permisiuni de administrator pentru a vizualiza utilizatorii
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Utilizatori</h1>
        <Button onClick={() => setShowModal(true)}>Utilizator nou</Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            className="ml-2 underline"
            onClick={() => setError("")}
          >
            Închide
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16">
          <p className="text-sm text-gray-500">Niciun utilizator găsit</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nume</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Rol</TableHeaderCell>
              <TableHeaderCell className="text-center">Activ</TableHeaderCell>
              <TableHeaderCell className="text-right">Comenzi</TableHeaderCell>
              <TableHeaderCell>Creat</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-gray-900">
                  {user.name}
                </TableCell>
                <TableCell className="text-gray-500">{user.email}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "border-transparent",
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {ROLE_LABELS[user.role] || user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => handleToggleActive(user)}
                    className="inline-flex items-center gap-1 text-sm"
                  >
                    <Badge
                      className={
                        user.active
                          ? "border-transparent bg-green-100 text-green-700"
                          : "border-transparent bg-red-100 text-red-700"
                      }
                    >
                      {user.active ? "Activ" : "Inactiv"}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  {user._count.orders}
                </TableCell>
                <TableCell className="text-gray-500">
                  {formatDate(user.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setAddError("")
        }}
        title="Utilizator nou"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          {addError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {addError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nume <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nume complet"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="email@exemplu.ro"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Parolă <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              placeholder="Parola"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Rol
            </label>
            <Combobox
              options={ROLE_OPTIONS}
              value={newRole}
              placeholder="Selectează rolul"
              onChange={(v) => setNewRole(v)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setAddError("")
              }}
              disabled={addLoading}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={addLoading}>
              {addLoading ? "Se creează..." : "Creează utilizator"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

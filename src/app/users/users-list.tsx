"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  const [search, setSearch] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState("EMPLOYEE")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchUsers = useCallback(async (q: string) => {
    try {
      const qs = new URLSearchParams()
      if (q) qs.set("search", q)
      const res = await fetch(`/api/users?${qs.toString()}`)
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
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchUsers(search)
    }, 150)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, fetchUsers])

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

  function openAddModal() {
    setEditingUser(null)
    setFormName("")
    setFormEmail("")
    setFormPassword("")
    setFormRole("EMPLOYEE")
    setFormError("")
    setShowModal(true)
  }

  function openEditModal(user: User) {
    setEditingUser(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormPassword("")
    setFormRole(user.role)
    setFormError("")
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingUser(null)
    setFormError("")
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")

    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Numele și emailul sunt obligatorii")
      return
    }

    if (!editingUser && !formPassword.trim()) {
      setFormError("Parola este obligatorie pentru un utilizator nou")
      return
    }

    const isEdit = !!editingUser
    const url = isEdit ? `/api/users/${editingUser.id}` : "/api/users"
    const method = isEdit ? "PUT" : "POST"
    const body: Record<string, unknown> = {
      name: formName.trim(),
      email: formEmail.trim(),
      role: formRole,
    }
    if (formPassword.trim()) body.password = formPassword

    setFormLoading(true)
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        if (res.status === 403) throw new Error("Nu aveți permisiuni de administrator")
        const data = await res.json()
        throw new Error(data.error || "Eroare la salvare")
      }
      const user = await res.json()
      if (isEdit) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...user, _count: u._count } : u)))
      } else {
        setUsers((prev) => [...prev, { ...user, _count: { orders: 0 } }])
      }
      closeModal()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Eroare la salvare")
    } finally {
      setFormLoading(false)
    }
  }

  if (unauthorized) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-brand-purple">Utilizatori</h1>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 dark:border-gray-700 dark:bg-transparent">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nu aveți permisiuni de administrator pentru a vizualiza utilizatorii
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-brand-purple">Utilizatori</h1>
        <Button onClick={openAddModal}>Utilizator nou</Button>
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

      <Input
        placeholder="Caută după nume sau email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-sm"
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-purple" />
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
              <TableHeaderCell className="text-right">Acțiuni</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </TableCell>
                <TableCell className="text-gray-500 dark:text-gray-400">{user.email}</TableCell>
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
                <TableCell className="text-gray-500 dark:text-gray-400">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(user)}
                  >
                    Editează
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingUser ? "Editează utilizator" : "Utilizator nou"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nume <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nume complet"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="email@exemplu.ro"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Parolă {!editingUser && <span className="text-red-500">*</span>}
              {editingUser && <span className="text-xs text-gray-400 ml-1">(lasă gol pentru a păstra)</span>}
            </label>
            <Input
              type="password"
              placeholder={editingUser ? "Lasă gol pentru a păstra" : "Parola"}
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              required={!editingUser}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rol
            </label>
            <Combobox
              options={ROLE_OPTIONS}
              value={formRole}
              placeholder="Selectează rolul"
              onChange={(v) => setFormRole(v)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={formLoading}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading
                ? "Se salvează..."
                : editingUser
                  ? "Salvează modificările"
                  : "Creează utilizator"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

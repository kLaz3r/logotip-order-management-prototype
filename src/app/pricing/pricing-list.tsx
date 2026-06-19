"use client"

import { useState, useEffect, useMemo } from "react"
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
import { formatPrice } from "@/lib/utils"
import { fuzzyMatch } from "@/lib/search"

interface Product {
  id: string
  category: string
  subcategory: string | null
  name: string
  format: string | null
  quantityRange: string | null
  unit: string
  basePrice: number
  notes: string | null
  active: boolean
}

export function PricingList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  const [newCategory, setNewCategory] = useState("")
  const [newName, setNewName] = useState("")
  const [newUnit, setNewUnit] = useState("")
  const [newBasePrice, setNewBasePrice] = useState("")
  const [newActive, setNewActive] = useState(true)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState("")

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState("")
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?active=false")
        if (!res.ok) {
          if (res.status === 403) {
            setError("Nu aveți permisiuni de administrator")
            return
          }
          throw new Error("Eroare la încărcare")
        }
        setProducts(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Eroare la încărcare")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    products.forEach((p) => cats.add(p.category))
    return Array.from(cats).sort()
  }, [products])

  const categoryOptions = [
    { value: "", label: "Toate categoriile" },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ]

  const filtered = useMemo(() => {
    let result = products
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter)
    }
    if (search.trim()) {
      const q = search.trim()
      result = result.filter(
        (p) =>
          fuzzyMatch(q, p.name) ||
          fuzzyMatch(q, p.category) ||
          (p.subcategory && fuzzyMatch(q, p.subcategory)) ||
          (p.format && fuzzyMatch(q, p.format)) ||
          (p.quantityRange && fuzzyMatch(q, p.quantityRange)) ||
          fuzzyMatch(q, p.unit) ||
          (p.notes && fuzzyMatch(q, p.notes))
      )
    }
    return result
  }, [products, search, categoryFilter])

  async function handleToggleActive(product: Product) {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      })
      if (!res.ok) {
        if (res.status === 403) {
          setError("Nu aveți permisiuni de administrator")
          return
        }
        throw new Error("Eroare la actualizare")
      }
      const updated = await res.json()
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la actualizare")
    }
  }

  async function handleSavePrice(product: Product) {
    const price = parseFloat(editingPrice)
    if (isNaN(price) || price < 0) {
      setError("Preț invalid")
      return
    }

    setSaveLoading(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basePrice: price }),
      })
      if (!res.ok) throw new Error("Eroare la actualizarea prețului")
      const updated = await res.json()
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setEditingPriceId(null)
      setEditingPrice("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la actualizarea prețului")
    } finally {
      setSaveLoading(false)
    }
  }

  function startEditingPrice(product: Product) {
    setEditingPriceId(product.id)
    setEditingPrice(product.basePrice.toString())
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    setAddError("")

    if (!newCategory.trim() || !newName.trim() || !newUnit.trim()) {
      setAddError("Categorie, nume și unitate sunt obligatorii")
      return
    }
    const price = parseFloat(newBasePrice)
    if (isNaN(price) || price < 0) {
      setAddError("Preț invalid")
      return
    }

    setAddLoading(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory.trim(),
          name: newName.trim(),
          unit: newUnit.trim(),
          basePrice: price,
          active: newActive,
        }),
      })
      if (!res.ok) {
        if (res.status === 403) throw new Error("Nu aveți permisiuni de administrator")
        const data = await res.json()
        throw new Error(data.error || "Eroare la adăugare")
      }
      const product = await res.json()
      setProducts((prev) => [...prev, product])
      setShowAddModal(false)
      setNewCategory("")
      setNewName("")
      setNewUnit("")
      setNewBasePrice("")
      setNewActive(true)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Eroare la adăugare")
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Listă prețuri</h1>
        <Button onClick={() => setShowAddModal(true)}>Produs nou</Button>
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Caută după nume, categorie, format, unitate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Combobox
          options={categoryOptions}
          value={categoryFilter}
          placeholder="Toate categoriile"
          onChange={(v) => setCategoryFilter(v)}
          className="sm:max-w-[220px]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16">
          <p className="text-sm text-gray-500">Niciun produs găsit</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Categorie</TableHeaderCell>
              <TableHeaderCell>Nume</TableHeaderCell>
              <TableHeaderCell>Format</TableHeaderCell>
              <TableHeaderCell>Cantitate</TableHeaderCell>
              <TableHeaderCell>Unitate</TableHeaderCell>
              <TableHeaderCell className="text-right">Preț bază</TableHeaderCell>
              <TableHeaderCell className="text-center">Activ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="text-gray-500">{product.category}</TableCell>
                <TableCell className="font-medium text-gray-900">
                  {product.name}
                </TableCell>
                <TableCell className="text-gray-500">
                  {product.format || "—"}
                </TableCell>
                <TableCell className="text-gray-500">
                  {product.quantityRange || "—"}
                </TableCell>
                <TableCell className="text-gray-500">{product.unit}</TableCell>
                <TableCell className="text-right">
                  {editingPriceId === product.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePrice(product)
                          if (e.key === "Escape") {
                            setEditingPriceId(null)
                            setEditingPrice("")
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSavePrice(product)}
                        disabled={saveLoading}
                      >
                        Salvează
                      </Button>
                    </div>
                  ) : (
                    <span
                      className="cursor-pointer font-medium text-blue-600 hover:underline"
                      onClick={() => startEditingPrice(product)}
                    >
                      {formatPrice(product.basePrice)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="inline-flex items-center gap-1 text-sm"
                  >
                    <Badge
                      className={
                        product.active
                          ? "border-transparent bg-green-100 text-green-700"
                          : "border-transparent bg-gray-100 text-gray-500"
                      }
                    >
                      {product.active ? "Activ" : "Inactiv"}
                    </Badge>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setAddError("")
        }}
        title="Produs nou"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          {addError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {addError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Categorie <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="ex: Imprimare textile"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nume <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="ex: Tricou bumbac"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Unitate <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="ex: buc, mp, set"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Preț bază (RON)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={newBasePrice}
              onChange={(e) => setNewBasePrice(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newActive}
              onChange={(e) => setNewActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Produs activ
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setAddError("")
              }}
              disabled={addLoading}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={addLoading}>
              {addLoading ? "Se adaugă..." : "Adaugă produs"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

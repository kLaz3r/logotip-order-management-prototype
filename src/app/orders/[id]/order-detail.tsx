"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { Modal } from "@/components/ui/modal"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "@/components/ui/table"
import {
  cn,
  formatPrice,
  formatDate,
  formatDateTime,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/utils"
import { fuzzyScore } from "@/lib/search"

interface OrderItem {
  id?: string
  productId: string
  productName?: string
  quantity: number
  price: number
  unitPrice: number
  basePrice?: number
  selectedOptions?: ProductOption[] | null
}

interface ProductOption {
  name: string
  priceModifier: number
}

interface OrderFile {
  id: string
  name: string
  size: number
  mimetype: string
  path: string
  createdAt: string
}

interface Order {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  deadline: string | null
  notes: string | null
  customerId: string
  customer?: { id: string; name: string; phone?: string | null }
  items: OrderItem[]
  files: OrderFile[]
  createdAt: string
  updatedAt?: string
  createdBy?: { name: string } | null
}

interface Customer {
  id: string
  name: string
  phone?: string | null
}

interface Product {
  id: string
  name: string
  basePrice: number
  category: string
  subcategory: string | null
  format: string | null
  unit: string
  quantityRange: string | null
  notes: string | null
  options: ProductOption[] | null
  optionType: string | null
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

const STATUS_OPTIONS = [
  { value: "", label: "Selectează statusul" },
  ...Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v })),
]

const PRIORITY_OPTIONS = [
  { value: "", label: "Selectează prioritatea" },
  ...Object.entries(PRIORITY_LABELS).map(([k, v]) => ({ value: k, label: v })),
]

export function OrderDetail() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [order, setOrder] = useState<Order | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [deadline, setDeadline] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<OrderItem[]>([])
  const [files, setFiles] = useState<OrderFile[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [itemQuantity, setItemQuantity] = useState<number>(1)
  const [itemUnitPrice, setItemUnitPrice] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<ProductOption[]>([])

  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [orderRes, customersRes] = await Promise.all([
          fetch(`/api/orders/${id}`),
          fetch("/api/customers"),
        ])
        if (!orderRes.ok) {
          if (orderRes.status === 404) {
            router.push("/orders")
            return
          }
          throw new Error("Eroare la încărcarea comenzii")
        }
        const orderData: Order = await orderRes.json()
        setOrder(orderData)
        setTitle(orderData.title)
        setDescription(orderData.description || "")
        setCustomerId(orderData.customerId)
        setStatus(orderData.status)
        setPriority(orderData.priority)
        setDeadline(orderData.deadline ? orderData.deadline.split("T")[0] : "")
        setNotes(orderData.notes || "")
        const rawItems = orderData.items as unknown as {
          id: string
          productId: string
          quantity: number
          price: number
          selectedOptions?: ProductOption[] | null
          product?: { name?: string; basePrice?: number }
        }[]
        setItems(
          rawItems.map((item) => ({
            productId: item.productId,
            productName: item.product?.name,
            quantity: item.quantity,
            price: item.price,
            unitPrice: item.quantity > 0 ? item.price / item.quantity : (item.product?.basePrice ?? 0),
            basePrice: item.product?.basePrice,
            selectedOptions: item.selectedOptions ?? null,
            id: item.id,
          }))
        )
        const rawFiles = orderData.files as unknown as {
          id: string
          filename: string
          size: number
          mimetype: string
          path: string
          createdAt: string
        }[]
        setFiles(
          rawFiles.map((f) => ({
            id: f.id,
            name: f.filename,
            size: f.size,
            mimetype: f.mimetype,
            path: f.path,
            createdAt: f.createdAt,
          }))
        )

        if (customersRes.ok) {
          const customersData: Customer[] = await customersRes.json()
          setCustomers(customersData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Eroare la încărcare")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, router])

  const searchResults = useMemo(() => {
    if (!modalOpen || !searchQuery.trim()) return []
    const query = searchQuery.trim()
    return allProducts
      .map((p) => ({
        product: p,
        score: Math.max(
          fuzzyScore(query, p.name),
          fuzzyScore(query, p.category),
          p.subcategory ? fuzzyScore(query, p.subcategory) : 0,
          p.format ? fuzzyScore(query, p.format) : 0,
          p.quantityRange ? fuzzyScore(query, p.quantityRange) : 0,
          fuzzyScore(query, p.unit)
        ),
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((s) => s.product)
  }, [searchQuery, modalOpen, allProducts])

  async function fetchAllProducts() {
    if (allProducts.length > 0) return
    try {
      const res = await fetch("/api/products?active=true")
      if (res.ok) {
        const data: Product[] = await res.json()
        setAllProducts(data)
      }
    } catch {
      setAllProducts([])
    }
  }

  const customerOptions = [
    { value: "", label: "Selectează clientul" },
    ...customers.map((c) => ({ value: c.id, label: c.name })),
  ]

  const selectedCustomer = customers.find((c) => c.id === customerId)

  function handleAddItem() {
    if (!selectedProduct) return
    const existingIndex = items.findIndex(
      (i) => i.productId === selectedProduct.id
    )
    if (existingIndex >= 0) {
      const updated = [...items]
      const prev = updated[existingIndex]
      updated[existingIndex] = {
        ...prev,
        quantity: prev.quantity + itemQuantity,
        price: (prev.quantity + itemQuantity) * itemUnitPrice,
        unitPrice: itemUnitPrice,
        basePrice: selectedProduct.basePrice,
        productName: selectedProduct.name,
        selectedOptions: selectedOptions.length > 0 ? selectedOptions : null,
      }
      setItems(updated)
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: itemQuantity,
          price: itemQuantity * itemUnitPrice,
          unitPrice: itemUnitPrice,
          basePrice: selectedProduct.basePrice,
          selectedOptions: selectedOptions.length > 0 ? selectedOptions : null,
        },
      ])
    }
    setSelectedProduct(null)
    setItemQuantity(1)
    setItemUnitPrice(0)
    setSelectedOptions([])
    setSearchQuery("")
    setModalOpen(false)
  }

  function handleRemoveItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function handleQuantityChange(index: number, qty: number) {
    const updated = [...items]
    const item = updated[index]
    const unitPrice = item.unitPrice || item.basePrice || 0
    updated[index] = {
      ...item,
      quantity: qty,
      price: qty * unitPrice,
    }
    setItems(updated)
  }

  function handleUnitPriceChange(index: number, newUnitPrice: number) {
    const updated = [...items]
    const item = updated[index]
    updated[index] = {
      ...item,
      unitPrice: newUnitPrice,
      price: item.quantity * newUnitPrice,
    }
    setItems(updated)
  }

  const itemsTotal = items.reduce((sum, i) => sum + i.price, 0)

  async function uploadFile(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("orderId", id)
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Eroare la încărcarea fișierului")
      const uploaded: Record<string, unknown> = await res.json()
      setFiles((prev) => [
        ...prev,
        {
          id: uploaded.id as string,
          name: uploaded.filename as string,
          size: uploaded.size as number,
          mimetype: uploaded.mimetype as string,
          path: uploaded.path as string,
          createdAt: uploaded.createdAt as string,
        },
      ])
      setSuccess("Fișier încărcat cu succes")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la încărcarea fișierului")
    } finally {
      setUploading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("Titlul este obligatoriu")
      return
    }
    if (!customerId) {
      setError("Clientul este obligatoriu")
      return
    }

    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        customerId,
        status,
        priority,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          selectedOptions: i.selectedOptions ?? null,
        })),
      }
      if (description.trim()) body.description = description.trim()
      if (deadline) body.deadline = new Date(deadline).toISOString()
      if (notes.trim()) body.notes = notes.trim()

      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Eroare la salvarea comenzii")
      }
      const updated: Order = await res.json()
      setOrder(updated)
      setSuccess("Comanda a fost salvată cu succes")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la salvare")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-purple" />
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-600">{error}</p>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => router.refresh()}
        >
          Reîncearcă
        </Button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-gray-500 dark:text-gray-400">Comanda nu a fost găsită</p>
        <Link
          href="/orders"
          className="mt-2 text-sm font-medium text-brand-teal hover:underline"
        >
          Înapoi la comenzi
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/orders")}>
          ← Înapoi
        </Button>
        <h1 className="text-2xl font-bold text-brand-purple">{order.title}</h1>
        <Badge
          className={cn(
            STATUS_COLORS[order.status] ||
              "bg-gray-100 text-gray-800 border-gray-300"
          )}
        >
          {STATUS_LABELS[order.status] || order.status}
        </Badge>
      </div>

      {success && (
        <div className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-3">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Creată: {formatDateTime(order.createdAt)}</span>
                {order.updatedAt && (
                  <span>Modificată: {formatDateTime(order.updatedAt)}</span>
                )}
                {order.createdBy && order.createdBy.name && (
                  <span>Creată de: {order.createdBy.name}</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Detalii comandă</h2>
            </CardHeader>
            <CardContent>
              <form id="order-form" onSubmit={handleSave} className="space-y-4">
                {error && (
                  <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Titlu <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Denumire comandă"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descriere
                  </label>
                  <Textarea
                    placeholder="Descrierea comenzii..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <Combobox
                    options={customerOptions}
                    value={customerId}
                    placeholder="Selectează clientul"
                    onChange={(v) => setCustomerId(v)}
                    required
                  />
                  {selectedCustomer && (
                    <div className="mt-1 flex items-center gap-3 text-sm">
                      <Link
                        href={`/customers/${selectedCustomer.id}`}
                        className="text-brand-teal hover:underline"
                      >
                        Vezi profilul clientului →
                      </Link>
                      {selectedCustomer.phone && (
                        <a
                          href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:underline"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                          {selectedCustomer.phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <Combobox
                      options={STATUS_OPTIONS}
                      value={status}
                      placeholder="Selectează statusul"
                      onChange={(v) => setStatus(v)}
                    />
                    {status && (
                      <div className="mt-1">
                        <Badge className={cn("text-xs", STATUS_COLORS[status])}>
                          {STATUS_LABELS[status]}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Prioritate
                    </label>
                    <Combobox
                      options={PRIORITY_OPTIONS}
                      value={priority}
                      placeholder="Selectează prioritatea"
                      onChange={(v) => setPriority(v)}
                    />
                    {priority && (
                      <div className="mt-1">
                        <Badge className={cn("text-xs", PRIORITY_COLORS[priority])}>
                          {PRIORITY_LABELS[priority]}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Termen limită
                    </label>
                    <Input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Note interne
                  </label>
                  <Textarea
                    placeholder="Note suplimentare..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Produse comandate</h2>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setModalOpen(true)
                    fetchAllProducts()
                  }}
                >
                  + Adaugă produs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Niciun produs adăugat
                </p>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Produs</TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Preț unitar
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Cantitate
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Preț total
                        </TableHeaderCell>
                        <TableHeaderCell> </TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                            {item.productName || "—"}
                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <span className="ml-2 text-xs text-gray-400">
                                ({item.selectedOptions.map((o) => o.name).join(", ")})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              className="ml-auto w-24"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUnitPriceChange(
                                  i,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              step="any"
                              className="ml-auto w-20"
                              value={item.quantity || ""}
                              onChange={(e) => {
                                const val = e.target.value
                                handleQuantityChange(
                                  i,
                                  val === "" ? 0 : parseFloat(val) || 0
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(item.price)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRemoveItem(i)}
                            >
                              Șterge
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-right text-lg font-bold text-gray-900 dark:text-gray-100">
                    Total: {formatPrice(itemsTotal)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Fișiere atașate</h2>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
                  dragOver
                  ? "border-brand-purple bg-brand-purple/5 dark:bg-brand-purple/10"
                  : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-white/[0.03]"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  Trageți un fișier aici sau
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Se încarcă..." : "Alege fișier"}
                </Button>
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell className="min-w-[200px]">Nume fișier</TableHeaderCell>
                        <TableHeaderCell>Dimensiune</TableHeaderCell>
                        <TableHeaderCell>Data</TableHeaderCell>
                        <TableHeaderCell> </TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {files.map((file) => {
                        const serveUrl = `/api/files/serve/${file.path.replace(/^uploads\//, "")}`
                        const isImage = file.mimetype.startsWith("image/")
                        const isPdf = file.mimetype === "application/pdf"

                        return (
                          <TableRow key={file.id}>
                            <TableCell className="min-w-[200px]">
                              <div className="flex items-center gap-3">
                                {isImage ? (
                                  <Image
                                    src={serveUrl}
                                    alt={file.name}
                                    width={40}
                                    height={40}
                                    unoptimized
                                    className="rounded border border-gray-200 object-cover"
                                  />
                                ) : isPdf ? (
                                  <div className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-red-50 text-xs font-bold text-red-600">
                                    PDF
                                  </div>
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-gray-50 text-xs text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                  </div>
                                )}
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {file.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </TableCell>
                            <TableCell className="text-gray-500 dark:text-gray-400">
                              {formatDate(file.createdAt)}
                            </TableCell>
                            <TableCell>
                              <a
                                href={serveUrl}
                                className="text-sm font-medium text-brand-teal hover:underline"
                                download
                              >
                                Descarcă
                              </a>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/orders")}
          disabled={saving}
        >
          Anulează
        </Button>
        <Button
          type="submit"
          form="order-form"
          disabled={saving}
        >
          {saving ? "Se salvează..." : "Salvează"}
        </Button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedProduct(null)
          setSearchQuery("")
          setItemQuantity(1)
          setItemUnitPrice(0)
          setSelectedOptions([])
        }}
        title="Adaugă produs"
      >
        <div className="space-y-4">
          <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Caută produs
              </label>
            <Input
              placeholder="Nume produs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedProduct(null)
              }}
            />
          </div>

          {searchQuery.trim() && searchResults.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Niciun produs găsit
            </p>
          )}

          {searchResults.length > 0 && (
            <div className="max-h-48 space-y-0 overflow-y-auto rounded-md border">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                    className={cn(
                    "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5",
                    selectedProduct?.id === product.id && "bg-brand-purple/10"
                  )}
                  onClick={() => {
                    setSelectedProduct(product)
                    if (product.optionType === "single" && product.options && product.options.length > 0) {
                      const defaultOpt = product.options[0]
                      setSelectedOptions([defaultOpt])
                      setItemUnitPrice(product.basePrice + defaultOpt.priceModifier)
                    } else {
                      setSelectedOptions([])
                      setItemUnitPrice(product.basePrice)
                    }
                  }}
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {product.name}
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      ({formatPrice(product.basePrice)}/{product.unit})
                    </span>
                  </div>
                  {product.quantityRange && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {product.quantityRange}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedProduct && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-white/[0.03]">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {selectedProduct.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedProduct.quantityRange && (
                  <span className="mr-3">{selectedProduct.quantityRange}</span>
                )}
                Preț bază: {formatPrice(selectedProduct.basePrice)}/{selectedProduct.unit}
              </p>

              {selectedProduct.options && selectedProduct.options.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Opțiuni:</p>
                  <div className="space-y-1">
                    {selectedProduct.options.map((opt) => {
                      const isChecked = selectedOptions.some((o) => o.name === opt.name)
                      const isSingle = selectedProduct.optionType === "single"
                      return (
                        <label
                          key={opt.name}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <input
                            type={isSingle ? "radio" : "checkbox"}
                            name={isSingle ? "product-option" : undefined}
                            checked={isChecked}
                            onChange={() => {
                              if (isSingle) {
                                setSelectedOptions([opt])
                                setItemUnitPrice(selectedProduct.basePrice + opt.priceModifier)
                              } else {
                                const newOptions = isChecked
                                  ? selectedOptions.filter((o) => o.name !== opt.name)
                                  : [...selectedOptions, opt]
                                setSelectedOptions(newOptions)
                                const modifiers = newOptions.reduce((sum, o) => sum + o.priceModifier, 0)
                                setItemUnitPrice(selectedProduct.basePrice + modifiers)
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                          />
                          <span>{opt.name}</span>
                          <span className="text-gray-400 dark:text-gray-500">(+{formatPrice(opt.priceModifier)}/{selectedProduct.unit})</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-2 flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preț unitar:
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-28"
                  value={itemUnitPrice || ""}
                  onChange={(e) =>
                    setItemUnitPrice(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="mt-2 flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cantitate:
                </label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  className="w-24"
                  value={itemQuantity || ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setItemQuantity(val === "" ? 0 : parseFloat(val) || 0)
                  }}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {formatPrice(itemQuantity * itemUnitPrice)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleAddItem}
              disabled={!selectedProduct || itemQuantity <= 0}
            >
              Adaugă în comandă
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

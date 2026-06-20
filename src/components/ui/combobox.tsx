"use client"

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { fuzzyMatch } from "@/lib/search"

export interface ComboboxOption {
  value: string
  label: string
  sublabel?: string
  details?: string[]
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  onChange: (value: string) => void
  className?: string
}

export function Combobox({
  options,
  value,
  placeholder = "Caută...",
  disabled,
  required,
  onChange,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  const filtered = options.filter((o) => {
    if (!o.value) return true
    const searchable = [o.label, o.sublabel, ...(o.details || [])]
      .filter(Boolean)
      .join(" ")
    return fuzzyMatch(searchable, search)
  })

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue)
      setSearch("")
      setOpen(false)
      inputRef.current?.blur()
    },
    [onChange]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault()
        setOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (filtered[highlightIndex]) {
          handleSelect(filtered[highlightIndex].value)
        }
        break
      case "Escape":
        e.preventDefault()
        setOpen(false)
        setSearch("")
        inputRef.current?.blur()
        break
    }
  }

  useEffect(() => {
    setHighlightIndex(0)
  }, [search])

  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.children[highlightIndex] as HTMLElement
      if (el) {
        el.scrollIntoView({ block: "nearest" })
      }
    }
  }, [highlightIndex, open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        autoComplete="off"
        required={required}
        disabled={disabled}
        placeholder={open ? placeholder : (selectedOption?.label || placeholder)}
        value={open ? search : (selectedOption?.label || "")}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-[#1a1a24] dark:text-gray-100 dark:placeholder:text-gray-500"
        )}
        onFocus={() => {
          setOpen(true)
          setSearch("")
        }}
        onChange={(e) => {
          setSearch(e.target.value)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-[#1a1a24]"
        >
          {          filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Niciun rezultat
            </li>
          ) : (
            filtered.map((option, i) => (
              <li
                key={option.value}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm transition-colors",
                  i === highlightIndex
                    ? "bg-brand-purple/10 text-brand-purple dark:bg-brand-purple/20 dark:text-brand-orange"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                )}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(option.value)
                }}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                {(option.sublabel || (option.details && option.details.length > 0)) && (
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {option.sublabel && <span>{option.sublabel}</span>}
                    {option.details?.map((d, di) => (
                      <span key={di}>{d}</span>
                    ))}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

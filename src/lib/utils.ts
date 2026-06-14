import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 2,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export const STATUS_LABELS: Record<string, string> = {
  NOU: "Nou",
  IN_LUCRU: "În lucru",
  ASTEAPTA_CLIENT: "Așteaptă client",
  FINALIZAT: "Finalizat",
  RIDICAT: "Ridicat",
}

export const STATUS_COLORS: Record<string, string> = {
  NOU: "bg-blue-100 text-blue-800 border-blue-300",
  IN_LUCRU: "bg-yellow-100 text-yellow-800 border-yellow-300",
  ASTEAPTA_CLIENT: "bg-orange-100 text-orange-800 border-orange-300",
  FINALIZAT: "bg-green-100 text-green-800 border-green-300",
  RIDICAT: "bg-gray-100 text-gray-800 border-gray-300",
}

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Scăzută",
  MEDIUM: "Medie",
  HIGH: "Ridicată",
  URGENT: "Urgentă",
}

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  EMPLOYEE: "Angajat",
}

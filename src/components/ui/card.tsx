import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface CardProps {
  className?: string
  children: ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#1a1a24]",
        className
      )}
    >
      <div className="h-1 w-full rounded-t-lg bg-brand-purple" />
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <div className={cn("border-b border-gray-200 px-6 py-4 dark:border-gray-700", className)}>
      {children}
    </div>
  )
}

export function CardContent({ className, children }: CardProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>
}

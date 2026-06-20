import { cn } from "@/lib/utils"
import { SelectHTMLAttributes, forwardRef } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-[#1a1a24] dark:text-gray-100",
          className
        )}
        ref={ref}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }
)
Select.displayName = "Select"

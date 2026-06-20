import { cn } from "@/lib/utils"
import { InputHTMLAttributes, forwardRef } from "react"

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-[#1a1a24] dark:text-gray-100 dark:placeholder:text-gray-500",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

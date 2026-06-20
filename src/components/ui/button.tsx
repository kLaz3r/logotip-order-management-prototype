import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

const variants = {
  default: "bg-brand-purple text-white hover:bg-brand-purple/85 dark:hover:bg-brand-purple/70",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-gray-300 bg-white hover:bg-brand-purple/5 hover:border-brand-purple/30 dark:border-gray-600 dark:bg-[#1a1a24] dark:hover:bg-white/5",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
  ghost: "hover:bg-brand-purple/5 dark:hover:bg-white/5",
  link: "text-brand-teal underline-offset-4 hover:underline",
}

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-sm",
  lg: "h-12 px-6 text-lg",
  icon: "h-10 w-10",
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

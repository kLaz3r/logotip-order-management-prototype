import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface TableProps {
  className?: string
  children: ReactNode
}

export function Table({ className, children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className={cn("w-full text-left text-sm", className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b bg-brand-purple/[0.04] text-xs font-medium uppercase text-brand-purple/70 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-400">
      {children}
    </thead>
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return     <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
}

export function TableRow({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-gray-50 dark:hover:bg-white/[0.03]", className)} {...props}>
      {children}
    </tr>
  )
}

export function TableCell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <td className={cn("px-4 py-3 text-gray-700 dark:text-gray-300", className)}>{children}</td>
  )
}

export function TableHeaderCell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th className={cn("px-4 py-3 text-left", className)}>{children}</th>
  )
}

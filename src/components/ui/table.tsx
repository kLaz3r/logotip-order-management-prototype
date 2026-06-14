import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface TableProps {
  className?: string
  children: ReactNode
}

export function Table({ className, children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className={cn("w-full text-left text-sm", className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b bg-gray-50 text-xs font-medium uppercase text-gray-500">
      {children}
    </thead>
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-200">{children}</tbody>
}

export function TableRow({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-gray-50", className)} {...props}>
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
    <td className={cn("px-4 py-3 text-gray-700", className)}>{children}</td>
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

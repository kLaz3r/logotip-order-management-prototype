import { AppLayout } from "@/components/layout/app-layout"
import { CustomersList } from "./customers-list"

export default function CustomersPage() {
  return (
    <AppLayout>
      <CustomersList />
    </AppLayout>
  )
}

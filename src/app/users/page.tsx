import { AppLayout } from "@/components/layout/app-layout"
import { UsersList } from "./users-list"

export default function UsersPage() {
  return (
    <AppLayout>
      <UsersList />
    </AppLayout>
  )
}

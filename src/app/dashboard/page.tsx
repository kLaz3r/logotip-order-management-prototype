import { AppLayout } from "@/components/layout/app-layout"
import { KanbanBoard } from "./kanban-board"

export default function DashboardPage() {
  return (
    <AppLayout>
      <KanbanBoard />
    </AppLayout>
  )
}

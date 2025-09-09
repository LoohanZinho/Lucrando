
import { PostsCalendar } from "@/components/calendar/posts-calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendário de Publicações</h1>
        <p className="text-muted-foreground">
          Visualize todas as suas postagens em um calendário interativo.
        </p>
      </div>
      <PostsCalendar />
    </div>
  );
}

import { PeriodFilter } from "./period-filter";
import { UserNav } from "./user-nav";

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          LCI - Lucrando com Influenciadores
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <PeriodFilter />
        <UserNav />
      </div>
    </div>
  );
}

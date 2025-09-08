import { PeriodFilter } from "./period-filter";

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl font-bold tracking-tight">
        LCI - Lucrando com Influenciadores
      </h1>
      <PeriodFilter />
    </div>
  );
}

"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PeriodFilter() {
  return (
    <Tabs defaultValue="monthly">
      <TabsList className="grid w-full grid-cols-4 sm:w-auto">
        <TabsTrigger value="daily">Diário</TabsTrigger>
        <TabsTrigger value="weekly">Semanal</TabsTrigger>
        <TabsTrigger value="monthly">Mensal</TabsTrigger>
        <TabsTrigger value="yearly">Anual</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

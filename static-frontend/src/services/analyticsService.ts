import { api } from "./api"

export const fetchOverview = async () => {
  return api.get("/analytics/overview") as Promise<{ kpis: any }>
}

export const fetchCharts = async () => {
  return api.get("/analytics/charts") as Promise<{ summary: any[]; costliestVehicles: any[] }>
}

import { api } from "./api"

export interface MaintenanceLog {
  id: number
  type: string
  description: string
  serviceDate: string
  cost?: number
  status: string
  vehicle?: { vehicleNumber: string }
}

export const listMaintenance = async () => {
  return api.get("/maintenance") as Promise<{ logs: MaintenanceLog[] }>
}

export const createMaintenance = async (payload: {
  vehicleId: number
  type: string
  description: string
  serviceDate: string
}) => {
  return api.post("/maintenance", payload) as Promise<{ log: MaintenanceLog }>
}

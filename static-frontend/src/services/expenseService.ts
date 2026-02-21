import { api } from "./api"

export interface Expense {
  id: number
  tripId?: number
  amount: number
  type: string
  status: string
  driver?: { firstName: string; lastName: string }
}

export const listExpenses = async () => {
  return api.get("/expenses") as Promise<{ expenses: Expense[] }>
}

export const createExpense = async (payload: {
  tripId?: number
  driverId?: number
  type: string
  amount: number
  date: string
}) => {
  return api.post("/expenses", payload) as Promise<{ expense: Expense }>
}

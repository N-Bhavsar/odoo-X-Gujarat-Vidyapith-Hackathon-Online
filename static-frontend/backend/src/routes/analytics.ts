import { Router } from "express"
import prisma from "../prisma"
import { asyncHandler } from "../utils/async-handler"
import { requireAuth } from "../middleware/auth"

const router = Router()

const formatMonth = (date: Date) => {
  return date.toLocaleString("en-US", { month: "short" })
}

router.get(
  "/overview",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const [activeFleet, inMaintenance, totalFleet] = await Promise.all([
      prisma.vehicle.count({ where: { status: "active" } }),
      prisma.vehicle.count({ where: { status: "maintenance" } }),
      prisma.vehicle.count()
    ])

    const pendingCargo = await prisma.trip.count({ where: { status: "scheduled" } })
    const inProgressTrips = await prisma.trip.count({ where: { status: "in_progress" } })

    const fuelCost = await prisma.expense.aggregate({
      where: { type: "fuel" },
      _sum: { amount: true }
    })

    const revenue = await prisma.expense.aggregate({
      _sum: { amount: true }
    })

    const utilizationRate = totalFleet
      ? Math.round(((inProgressTrips + pendingCargo) / totalFleet) * 100)
      : 0

    res.json({
      kpis: {
        activeFleet,
        inMaintenance,
        utilizationRate,
        pendingCargo,
        revenue: revenue._sum.amount || 0,
        fuelCost: fuelCost._sum.amount || 0
      }
    })
  })
)

router.get(
  "/charts",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "asc" }
    })

    const maintenance = await prisma.maintenanceLog.findMany({
      orderBy: { serviceDate: "asc" }
    })

    const monthMap: Record<string, { revenue: number; fuelCost: number; maintenance: number }> = {}

    expenses.forEach((expense: { date: Date; type: string; amount: number }) => {
      const key = formatMonth(expense.date)
      if (!monthMap[key]) {
        monthMap[key] = { revenue: 0, fuelCost: 0, maintenance: 0 }
      }
      if (expense.type === "fuel") {
        monthMap[key].fuelCost += expense.amount
      }
      monthMap[key].revenue += expense.amount
    })

    maintenance.forEach((log: { serviceDate: Date; cost: number | null }) => {
      const key = formatMonth(log.serviceDate)
      if (!monthMap[key]) {
        monthMap[key] = { revenue: 0, fuelCost: 0, maintenance: 0 }
      }
      monthMap[key].maintenance += log.cost || 0
    })

    const summary = Object.entries(monthMap).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      fuelCost: data.fuelCost,
      maintenance: data.maintenance,
      netProfit: data.revenue - data.fuelCost - data.maintenance
    }))

    const costliestVehicles = await prisma.expense.groupBy({
      by: ["vehicleId"],
      _sum: { amount: true },
      where: { vehicleId: { not: null } },
      orderBy: { _sum: { amount: "desc" } },
      take: 5
    })

    const vehicles = await prisma.vehicle.findMany({
      where: { id: { in: costliestVehicles.map((item: { vehicleId: number | null }) => item.vehicleId || 0) } }
    })

    const costliest = costliestVehicles.map((item: { vehicleId: number | null; _sum: { amount: number | null } }) => {
      const vehicle = vehicles.find((v: { id: number }) => v.id === item.vehicleId)
      return {
        name: vehicle ? vehicle.vehicleNumber : `Vehicle-${item.vehicleId}`,
        cost: item._sum.amount || 0
      }
    })

    res.json({
      summary,
      costliestVehicles: costliest
    })
  })
)

export default router

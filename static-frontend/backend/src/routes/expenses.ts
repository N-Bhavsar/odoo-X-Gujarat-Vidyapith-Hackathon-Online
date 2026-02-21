import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { asyncHandler } from "../utils/async-handler"
import { requireAuth } from "../middleware/auth"
import { getPagination } from "../utils/pagination"

const router = Router()

const expenseSchema = z.object({
  tripId: z.number().optional(),
  vehicleId: z.number().optional(),
  driverId: z.number().optional(),
  type: z.enum(["fuel", "toll", "repair", "misc"]),
  amount: z.number(),
  currency: z.string().optional(),
  date: z.string(),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "paid"]).optional()
})

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { tripId, vehicleId, driverId, status } = req.query
    const { skip, take, page, limit } = getPagination(req.query)
    const where: any = {}
    if (tripId) where.tripId = Number(tripId)
    if (vehicleId) where.vehicleId = Number(vehicleId)
    if (driverId) where.driverId = Number(driverId)
    if (status) where.status = String(status)

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take,
        include: { driver: true, vehicle: true, trip: true },
        orderBy: { date: "desc" }
      }),
      prisma.expense.count({ where })
    ])

    res.json({ expenses, pagination: { page, limit, total } })
  })
)

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = expenseSchema.parse(req.body)
    const expense = await prisma.expense.create({
      data: {
        ...data,
        currency: data.currency || "INR",
        date: new Date(data.date)
      }
    })

    res.status(201).json({ expense })
  })
)

router.put(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const data = expenseSchema.partial().parse(req.body)
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined
      }
    })

    res.json({ expense })
  })
)

router.patch(
  "/:id/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const status = z.enum(["pending", "approved", "rejected", "paid"]).parse(req.body.status)
    const expense = await prisma.expense.update({ where: { id }, data: { status } })
    res.json({ expense })
  })
)

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    await prisma.expense.delete({ where: { id } })
    res.status(204).send()
  })
)

export default router

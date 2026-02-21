import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { asyncHandler } from "../utils/async-handler"
import { requireAuth, requireRole } from "../middleware/auth"
import { getPagination } from "../utils/pagination"

const router = Router()

const maintenanceSchema = z.object({
  vehicleId: z.number(),
  type: z.string().min(1),
  description: z.string().min(1),
  cost: z.number().optional(),
  serviceDate: z.string(),
  odometer: z.number().optional(),
  nextServiceDate: z.string().optional(),
  vendor: z.string().optional(),
  status: z.enum(["new", "in_progress", "done"]).optional(),
  notes: z.string().optional()
})

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { vehicleId, status } = req.query
    const { skip, take, page, limit } = getPagination(req.query)
    const where: any = {}
    if (vehicleId) where.vehicleId = Number(vehicleId)
    if (status) where.status = String(status)

    const [logs, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        skip,
        take,
        include: { vehicle: true },
        orderBy: { serviceDate: "desc" }
      }),
      prisma.maintenanceLog.count({ where })
    ])

    res.json({ logs, pagination: { page, limit, total } })
  })
)

router.post(
  "/",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const data = maintenanceSchema.parse(req.body)
    const log = await prisma.maintenanceLog.create({
      data: {
        ...data,
        serviceDate: new Date(data.serviceDate),
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : undefined
      }
    })
    res.status(201).json({ log })
  })
)

router.put(
  "/:id",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const data = maintenanceSchema.partial().parse(req.body)
    const log = await prisma.maintenanceLog.update({
      where: { id },
      data: {
        ...data,
        serviceDate: data.serviceDate ? new Date(data.serviceDate) : undefined,
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : undefined
      }
    })
    res.json({ log })
  })
)

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const status = z.enum(["new", "in_progress", "done"]).parse(req.body.status)
    const log = await prisma.maintenanceLog.update({ where: { id }, data: { status } })
    res.json({ log })
  })
)

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    await prisma.maintenanceLog.delete({ where: { id } })
    res.status(204).send()
  })
)

export default router

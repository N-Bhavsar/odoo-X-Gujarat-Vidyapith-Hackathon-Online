import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { asyncHandler } from "../utils/async-handler"
import { requireAuth, requireRole } from "../middleware/auth"
import { getPagination } from "../utils/pagination"

const router = Router()

const tripSchema = z.object({
  vehicleId: z.number(),
  driverId: z.number(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  scheduledDeparture: z.string(),
  scheduledArrival: z.string().optional(),
  actualDeparture: z.string().optional(),
  actualArrival: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
  distanceKm: z.number().optional(),
  cargoDescription: z.string().optional(),
  cargoWeightKg: z.number().optional(),
  notes: z.string().optional()
})

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status, driverId, vehicleId, startDate, endDate } = req.query
    const { skip, take, page, limit } = getPagination(req.query)
    const where: any = {}

    if (status) where.status = String(status)
    if (driverId) where.driverId = Number(driverId)
    if (vehicleId) where.vehicleId = Number(vehicleId)

    if (startDate || endDate) {
      where.scheduledDeparture = {}
      if (startDate) where.scheduledDeparture.gte = new Date(String(startDate))
      if (endDate) where.scheduledDeparture.lte = new Date(String(endDate))
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take,
        include: { driver: true, vehicle: true },
        orderBy: { scheduledDeparture: "desc" }
      }),
      prisma.trip.count({ where })
    ])

    res.json({ trips, pagination: { page, limit, total } })
  })
)

router.get(
  "/statistics",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query
    const where: any = {}
    if (startDate || endDate) {
      where.scheduledDeparture = {}
      if (startDate) where.scheduledDeparture.gte = new Date(String(startDate))
      if (endDate) where.scheduledDeparture.lte = new Date(String(endDate))
    }

    const [total, completed, inProgress, cancelled] = await Promise.all([
      prisma.trip.count({ where }),
      prisma.trip.count({ where: { ...where, status: "completed" } }),
      prisma.trip.count({ where: { ...where, status: "in_progress" } }),
      prisma.trip.count({ where: { ...where, status: "cancelled" } })
    ])

    const distance = await prisma.trip.aggregate({
      where,
      _sum: { distanceKm: true, cargoWeightKg: true }
    })

    res.json({
      stats: {
        total,
        completed,
        inProgress,
        cancelled,
        totalDistanceKm: distance._sum.distanceKm || 0,
        totalCargoKg: distance._sum.cargoWeightKg || 0
      }
    })
  })
)

router.get(
  "/driver/:driverId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const driverId = Number(req.params.driverId)
    const { page, limit, skip, take } = getPagination(req.query)
    const status = req.query.status ? String(req.query.status) : undefined

    const where: any = { driverId }
    if (status) where.status = status

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take,
        include: { vehicle: true },
        orderBy: { scheduledDeparture: "desc" }
      }),
      prisma.trip.count({ where })
    ])

    res.json({ trips, pagination: { page, limit, total } })
  })
)

router.get(
  "/vehicle/:vehicleId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const vehicleId = Number(req.params.vehicleId)
    const { page, limit, skip, take } = getPagination(req.query)
    const status = req.query.status ? String(req.query.status) : undefined

    const where: any = { vehicleId }
    if (status) where.status = status

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take,
        include: { driver: true },
        orderBy: { scheduledDeparture: "desc" }
      }),
      prisma.trip.count({ where })
    ])

    res.json({ trips, pagination: { page, limit, total } })
  })
)

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { driver: true, vehicle: true }
    })
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" })
    }
    res.json({ trip })
  })
)

router.post(
  "/",
  requireAuth,
  requireRole("dispatcher"),
  asyncHandler(async (req, res) => {
    const data = tripSchema.parse(req.body)
    const trip = await prisma.trip.create({
      data: {
        ...data,
        scheduledDeparture: new Date(data.scheduledDeparture),
        scheduledArrival: data.scheduledArrival ? new Date(data.scheduledArrival) : undefined,
        actualDeparture: data.actualDeparture ? new Date(data.actualDeparture) : undefined,
        actualArrival: data.actualArrival ? new Date(data.actualArrival) : undefined
      }
    })

    res.status(201).json({ trip })
  })
)

router.put(
  "/:id",
  requireAuth,
  requireRole("dispatcher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const data = tripSchema.partial().parse(req.body)
    const trip = await prisma.trip.update({
      where: { id },
      data: {
        ...data,
        scheduledDeparture: data.scheduledDeparture ? new Date(data.scheduledDeparture) : undefined,
        scheduledArrival: data.scheduledArrival ? new Date(data.scheduledArrival) : undefined,
        actualDeparture: data.actualDeparture ? new Date(data.actualDeparture) : undefined,
        actualArrival: data.actualArrival ? new Date(data.actualArrival) : undefined
      }
    })

    res.json({ trip })
  })
)

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("dispatcher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const status = z.enum(["scheduled", "in_progress", "completed", "cancelled"]).parse(req.body.status)
    const trip = await prisma.trip.update({ where: { id }, data: { status } })
    res.json({ trip })
  })
)

router.post(
  "/:id/start",
  requireAuth,
  requireRole("dispatcher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const trip = await prisma.trip.update({
      where: { id },
      data: { status: "in_progress", actualDeparture: new Date() }
    })
    res.json({ trip })
  })
)

router.post(
  "/:id/complete",
  requireAuth,
  requireRole("dispatcher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const trip = await prisma.trip.update({
      where: { id },
      data: { status: "completed", actualArrival: new Date() }
    })
    res.json({ trip })
  })
)

router.post(
  "/:id/cancel",
  requireAuth,
  requireRole("dispatcher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const reason = req.body.reason ? String(req.body.reason) : "Cancelled"
    const trip = await prisma.trip.update({
      where: { id },
      data: { status: "cancelled", notes: reason }
    })
    res.json({ trip })
  })
)

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    await prisma.trip.delete({ where: { id } })
    res.status(204).send()
  })
)

export default router

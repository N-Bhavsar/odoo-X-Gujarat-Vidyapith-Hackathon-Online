import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { asyncHandler } from "../utils/async-handler"
import { requireAuth } from "../middleware/auth"

const router = Router()

const locationSchema = z.object({
  tripId: z.number().optional(),
  vehicleId: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number().optional(),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  source: z.enum(["mobile_app", "gps_device", "manual"]).optional(),
  isGeofenceComplete: z.boolean().optional(),
  geofenceId: z.string().optional(),
  idleStartTime: z.string().optional(),
  isIdle: z.boolean().optional(),
  timestamp: z.string().optional()
})

router.post(
  "/locations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = locationSchema.parse(req.body)
    const location = await prisma.gPSLocation.create({
      data: {
        ...data,
        idleStartTime: data.idleStartTime ? new Date(data.idleStartTime) : undefined,
        timestamp: data.timestamp ? new Date(data.timestamp) : undefined
      }
    })
    res.status(201).json({ data: location })
  })
)

router.get(
  "/vehicles/:vehicleId/current",
  requireAuth,
  asyncHandler(async (req, res) => {
    const vehicleId = Number(req.params.vehicleId)
    const location = await prisma.gPSLocation.findFirst({
      where: { vehicleId },
      orderBy: { timestamp: "desc" }
    })

    res.json({ data: location })
  })
)

router.get(
  "/vehicles/:vehicleId/history",
  requireAuth,
  asyncHandler(async (req, res) => {
    const vehicleId = Number(req.params.vehicleId)
    const limit = Math.min(500, Number(req.query.limit) || 100)

    const history = await prisma.gPSLocation.findMany({
      where: { vehicleId },
      orderBy: { timestamp: "desc" },
      take: limit
    })

    res.json({ data: history })
  })
)

router.get(
  "/trips/:tripId/history",
  requireAuth,
  asyncHandler(async (req, res) => {
    const tripId = Number(req.params.tripId)
    const limit = Math.min(500, Number(req.query.limit) || 100)

    const history = await prisma.gPSLocation.findMany({
      where: { tripId },
      orderBy: { timestamp: "desc" },
      take: limit
    })

    res.json({ data: history })
  })
)

export default router

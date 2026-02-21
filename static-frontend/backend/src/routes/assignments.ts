import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { asyncHandler } from "../utils/async-handler"
import { requireAuth } from "../middleware/auth"
import { getPagination } from "../utils/pagination"

const router = Router()

const assignmentSchema = z.object({
  driverId: z.number(),
  vehicleId: z.number(),
  startDate: z.string().optional()
})

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { driverId, vehicleId } = req.query
    const { skip, take, page, limit } = getPagination(req.query)
    const where: any = { isActive: true }
    if (driverId) where.driverId = Number(driverId)
    if (vehicleId) where.vehicleId = Number(vehicleId)

    const [assignments, total] = await Promise.all([
      prisma.driverVehicleAssignment.findMany({
        where,
        skip,
        take,
        include: { driver: true, vehicle: true },
        orderBy: { startDate: "desc" }
      }),
      prisma.driverVehicleAssignment.count({ where })
    ])

    res.json({ assignments, pagination: { page, limit, total } })
  })
)

router.get(
  "/driver/:driverId/current",
  requireAuth,
  asyncHandler(async (req, res) => {
    const driverId = Number(req.params.driverId)
    const assignment = await prisma.driverVehicleAssignment.findFirst({
      where: { driverId, isActive: true },
      include: { vehicle: true }
    })

    res.json({ assignment })
  })
)

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = assignmentSchema.parse(req.body)

    await prisma.driverVehicleAssignment.updateMany({
      where: { driverId: data.driverId, isActive: true },
      data: { isActive: false, endDate: new Date() }
    })

    const assignment = await prisma.driverVehicleAssignment.create({
      data: {
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        startDate: data.startDate ? new Date(data.startDate) : new Date()
      }
    })

    res.status(201).json({ assignment })
  })
)

router.patch(
  "/:id/end",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const assignment = await prisma.driverVehicleAssignment.update({
      where: { id },
      data: { isActive: false, endDate: new Date() }
    })

    res.json({ assignment })
  })
)

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    await prisma.driverVehicleAssignment.delete({ where: { id } })
    res.status(204).send()
  })
)

export default router

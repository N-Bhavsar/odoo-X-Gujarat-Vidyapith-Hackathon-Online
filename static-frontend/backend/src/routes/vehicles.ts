import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { asyncHandler } from "../utils/async-handler"
import { requireAuth, requireRole } from "../middleware/auth"
import { getPagination } from "../utils/pagination"

const router = Router()

const vehicleSchema = z.object({
  vehicleNumber: z.string().min(1),
  registrationNumber: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900),
  vin: z.string().optional(),
  type: z.enum(["sedan", "suv", "van", "truck", "bus", "motorcycle"]).optional(),
  fuelType: z.enum(["petrol", "diesel", "electric", "hybrid", "cng"]).optional(),
  status: z.enum(["active", "maintenance", "inactive", "retired"]).optional(),
  currentMileage: z.number().optional(),
  seatingCapacity: z.number().optional(),
  maxLoadCapacity: z.number().optional(),
  color: z.string().optional(),
  purchasePrice: z.number().optional(),
  currentValue: z.number().optional(),
  lastServiceDate: z.string().optional(),
  nextServiceDue: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insuranceExpiryDate: z.string().optional(),
  registrationExpiryDate: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  assignedDriverId: z.number().optional()
})

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { search, status, type } = req.query
    const { skip, take, page, limit } = getPagination(req.query)

    const where: any = {}
    if (search) {
      where.OR = [
        { vehicleNumber: { contains: String(search), mode: "insensitive" } },
        { registrationNumber: { contains: String(search), mode: "insensitive" } },
        { make: { contains: String(search), mode: "insensitive" } },
        { model: { contains: String(search), mode: "insensitive" } }
      ]
    }
    if (status) {
      where.status = String(status)
    }
    if (type) {
      where.type = String(type)
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" }
      }),
      prisma.vehicle.count({ where })
    ])

    res.json({ vehicles, pagination: { page, limit, total } })
  })
)

router.get(
  "/stats",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const [active, maintenance, inactive, retired, total] = await Promise.all([
      prisma.vehicle.count({ where: { status: "active" } }),
      prisma.vehicle.count({ where: { status: "maintenance" } }),
      prisma.vehicle.count({ where: { status: "inactive" } }),
      prisma.vehicle.count({ where: { status: "retired" } }),
      prisma.vehicle.count()
    ])

    res.json({
      stats: {
        total,
        active,
        maintenance,
        inactive,
        retired
      }
    })
  })
)

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }
    res.json({ vehicle })
  })
)

router.post(
  "/",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const data = vehicleSchema.parse(req.body)
    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        lastServiceDate: data.lastServiceDate ? new Date(data.lastServiceDate) : undefined,
        nextServiceDue: data.nextServiceDue ? new Date(data.nextServiceDue) : undefined,
        insuranceExpiryDate: data.insuranceExpiryDate ? new Date(data.insuranceExpiryDate) : undefined,
        registrationExpiryDate: data.registrationExpiryDate ? new Date(data.registrationExpiryDate) : undefined
      }
    })
    res.status(201).json({ vehicle })
  })
)

router.put(
  "/:id",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const data = vehicleSchema.partial().parse(req.body)
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        lastServiceDate: data.lastServiceDate ? new Date(data.lastServiceDate) : undefined,
        nextServiceDue: data.nextServiceDue ? new Date(data.nextServiceDue) : undefined,
        insuranceExpiryDate: data.insuranceExpiryDate ? new Date(data.insuranceExpiryDate) : undefined,
        registrationExpiryDate: data.registrationExpiryDate ? new Date(data.registrationExpiryDate) : undefined
      }
    })
    res.json({ vehicle })
  })
)

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    await prisma.vehicle.delete({ where: { id } })
    res.status(204).send()
  })
)

export default router

import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { asyncHandler } from "../utils/async-handler"
import { requireAuth, requireRole } from "../middleware/auth"
import { getPagination } from "../utils/pagination"

const router = Router()

const driverSchema = z.object({
  userId: z.number().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  licenseNumber: z.string().min(4),
  licenseClass: z.enum(["A", "B", "C", "D", "BE", "CE", "Van"]),
  licenseExpiryDate: z.string(),
  licenseIssueDate: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended", "on_duty", "off_duty", "on_trip", "out_of_service"]).optional(),
  safetyScore: z.number().optional(),
  totalTrips: z.number().optional(),
  completedTrips: z.number().optional(),
  cancelledTrips: z.number().optional(),
  hireDate: z.string().optional(),
  dateOfBirth: z.string().optional(),
  passportNumber: z.string().optional(),
  medicalCertificateExpiry: z.string().optional(),
  backgroundCheckDate: z.string().optional(),
  notes: z.string().optional(),
  profileImageUrl: z.string().optional(),
  isActive: z.boolean().optional()
})

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status, search, includeExpiring } = req.query
    const { skip, take, page, limit } = getPagination(req.query)
    const where: any = {}

    if (status) {
      where.status = String(status)
    }

    if (search) {
      where.OR = [
        { firstName: { contains: String(search), mode: "insensitive" } },
        { lastName: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
        { licenseNumber: { contains: String(search), mode: "insensitive" } }
      ]
    }

    if (includeExpiring === "true") {
      const threshold = new Date()
      threshold.setDate(threshold.getDate() + 30)
      where.licenseExpiryDate = { lte: threshold }
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" }
      }),
      prisma.driver.count({ where })
    ])

    res.json({ drivers, pagination: { page, limit, total } })
  })
)

router.get(
  "/expiring/licenses",
  requireAuth,
  asyncHandler(async (req, res) => {
    const daysThreshold = Number(req.query.daysThreshold) || 30
    const threshold = new Date()
    threshold.setDate(threshold.getDate() + daysThreshold)

    const drivers = await prisma.driver.findMany({
      where: { licenseExpiryDate: { lte: threshold } },
      orderBy: { licenseExpiryDate: "asc" }
    })

    res.json({ drivers })
  })
)

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const driver = await prisma.driver.findUnique({ where: { id } })
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" })
    }
    res.json({ driver })
  })
)

router.get(
  "/:id/license/check",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const driver = await prisma.driver.findUnique({ where: { id } })
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" })
    }

    const expiry = new Date(driver.licenseExpiryDate)
    const now = new Date()
    const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    res.json({
      expired: daysRemaining < 0,
      daysRemaining
    })
  })
)

router.get(
  "/:id/metrics",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const driver = await prisma.driver.findUnique({ where: { id } })
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" })
    }

    const completionRate = driver.totalTrips
      ? Math.round((driver.completedTrips / driver.totalTrips) * 100)
      : 0

    res.json({
      metrics: {
        completionRate,
        safetyScore: driver.safetyScore,
        totalTrips: driver.totalTrips,
        completedTrips: driver.completedTrips,
        cancelledTrips: driver.cancelledTrips
      }
    })
  })
)

router.post(
  "/",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const data = driverSchema.parse(req.body)

    // Validating "Van" category license
    if (data.licenseClass === "Van") {
      const expiry = new Date(data.licenseExpiryDate)
      const now = new Date()
      // Set to start of today for accurate comparison
      now.setHours(0, 0, 0, 0)
      expiry.setHours(0, 0, 0, 0)

      if (expiry < now) {
        return res.status(400).json({ message: "System verified: License validity expired for Van category." })
      }
    }

    const parsedData = data as any;
    const driver = await prisma.driver.create({
      data: {
        ...parsedData,
        licenseExpiryDate: new Date(data.licenseExpiryDate),
        licenseIssueDate: data.licenseIssueDate ? new Date(data.licenseIssueDate) : undefined,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        medicalCertificateExpiry: data.medicalCertificateExpiry
          ? new Date(data.medicalCertificateExpiry)
          : undefined,
        backgroundCheckDate: data.backgroundCheckDate
          ? new Date(data.backgroundCheckDate)
          : undefined
      }
    })

    res.status(201).json({ driver })
  })
)

router.put(
  "/:id",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const data = driverSchema.partial().parse(req.body)
    const parsedData = data as any;
    const driver = await prisma.driver.update({
      where: { id },
      data: {
        ...parsedData,
        licenseExpiryDate: data.licenseExpiryDate ? new Date(data.licenseExpiryDate) : undefined,
        licenseIssueDate: data.licenseIssueDate ? new Date(data.licenseIssueDate) : undefined,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        medicalCertificateExpiry: data.medicalCertificateExpiry
          ? new Date(data.medicalCertificateExpiry)
          : undefined,
        backgroundCheckDate: data.backgroundCheckDate
          ? new Date(data.backgroundCheckDate)
          : undefined
      }
    })

    res.json({ driver })
  })
)

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const status = z.enum(["active", "inactive", "suspended", "on_duty", "off_duty", "on_trip", "out_of_service"]).parse(req.body.status)
    const driver = await prisma.driver.update({ where: { id }, data: { status: status as any } })
    res.json({ driver })
  })
)

router.patch(
  "/:id/safety-score",
  requireAuth,
  requireRole("safety_officer"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const safetyScore = z.number().min(0).max(10).parse(req.body.safetyScore)
    const driver = await prisma.driver.update({ where: { id }, data: { safetyScore } })
    res.json({ driver })
  })
)

router.patch(
  "/:id/trips",
  requireAuth,
  requireRole("dispatcher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const type = z.enum(["total", "completed", "cancelled"]).parse(req.body.type)
    const update: any = {}
    if (type === "total") update.totalTrips = { increment: 1 }
    if (type === "completed") update.completedTrips = { increment: 1 }
    if (type === "cancelled") update.cancelledTrips = { increment: 1 }

    const driver = await prisma.driver.update({ where: { id }, data: update })
    res.json({ driver })
  })
)

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    await prisma.driver.delete({ where: { id } })
    res.status(204).send()
  })
)

export default router

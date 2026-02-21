import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { asyncHandler } from "../utils/async-handler"
import { requireAuth, requireRole } from "../middleware/auth"
import { getPagination } from "../utils/pagination"

const router = Router()

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "fleet_manager", "dispatcher", "safety_officer", "financial_analyst", "driver"]).optional(),
  isActive: z.boolean().optional()
})

router.get(
  "/",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const { skip, take, page, limit } = getPagination(req.query)
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          isActive: true,
          createdAt: true
        }
      }),
      prisma.user.count()
    ])

    res.json({
      users,
      pagination: { page, limit, total }
    })
  })
)

router.get(
  "/:id",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user })
  })
)

router.put(
  "/:id",
  requireAuth,
  requireRole("fleet_manager"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const data = updateSchema.parse(req.body)
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true
      }
    })

    res.json({ user })
  })
)

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    await prisma.user.delete({ where: { id } })
    res.status(204).send()
  })
)

export default router

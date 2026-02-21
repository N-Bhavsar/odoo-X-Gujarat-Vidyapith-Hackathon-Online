import { Router } from "express"
import jwt, { SignOptions } from "jsonwebtoken"
import { z } from "zod"
import prisma from "../prisma"
import { asyncHandler } from "../utils/async-handler"
import { comparePassword, hashPassword } from "../utils/password"
import { requireAuth } from "../middleware/auth"

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["admin", "fleet_manager", "dispatcher", "driver"]).optional(),
  phone: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const signToken = (payload: { id: number; email: string; role: string }): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not defined")
  }
  return jwt.sign(payload, secret, { 
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any 
  })
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return res.status(409).json({ message: "Email already exists" })
    }

    const password = await hashPassword(data.password)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || "driver",
        phone: data.phone
      }
    })

    const token = signToken({ id: user.id, email: user.email, role: user.role })
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone
      }
    })
  })
)

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const match = await comparePassword(data.password, user.password)
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    const token = signToken({ id: user.id, email: user.email, role: user.role })
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone
      }
    })
  })
)

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone
      }
    })
  })
)

export default router

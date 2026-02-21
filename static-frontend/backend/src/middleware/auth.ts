import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import prisma from "../prisma"
import { roleRank } from "../utils/roles"

interface JwtPayload {
  id: number
  email: string
  role: string
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const token = header.replace("Bearer ", "")
  try {
    const secret = process.env.JWT_SECRET || ""
    const payload = jwt.verify(token, secret) as JwtPayload
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    req.user = { id: user.id, email: user.email, role: user.role }
    return next()
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" })
  }
}

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (roleRank[req.user.role] >= roleRank[role]) {
      return next()
    }

    return res.status(403).json({ message: "Forbidden" })
  }
}

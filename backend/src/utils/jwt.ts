const jwt = require('jsonwebtoken')

interface TokenPayload {
  userId: number
  email: string
  role: string
}

const JWT_SECRET: any = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN: any = process.env.JWT_EXPIRES_IN || '7d'

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as TokenPayload
  } catch (error) {
    return null
  }
}

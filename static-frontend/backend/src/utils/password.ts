import bcrypt from "bcryptjs"

export const hashPassword = async (value: string) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(value, salt)
}

export const comparePassword = async (value: string, hash: string) => {
  return bcrypt.compare(value, hash)
}

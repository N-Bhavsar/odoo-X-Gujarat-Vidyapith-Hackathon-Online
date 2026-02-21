import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import authRoutes from "./routes/auth"
import userRoutes from "./routes/users"
import vehicleRoutes from "./routes/vehicles"
import driverRoutes from "./routes/drivers"
import assignmentRoutes from "./routes/assignments"
import tripRoutes from "./routes/trips"
import gpsRoutes from "./routes/gps"
import maintenanceRoutes from "./routes/maintenance"
import expenseRoutes from "./routes/expenses"
import analyticsRoutes from "./routes/analytics"
import { errorHandler } from "./middleware/error"

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "*").split(","),
    credentials: true
  })
)
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

app.get("/api/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/vehicles", vehicleRoutes)
app.use("/api/drivers", driverRoutes)
app.use("/api/assignments", assignmentRoutes)
app.use("/api/trips", tripRoutes)
app.use("/api/gps", gpsRoutes)
app.use("/api/maintenance", maintenanceRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/analytics", analyticsRoutes)

app.use(errorHandler)

const port = Number(process.env.PORT) || 5000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

import { config } from "dotenv"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// Load environment variables
config()

const prisma = new PrismaClient()

const seed = async () => {
  // Reset all tables for a clean demo dataset.
  await prisma.gPSLocation.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.maintenanceLog.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.driverVehicleAssignment.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash("FleetFlow@123", 10)

  const users = await prisma.user.createMany({
    data: [
      {
        email: "admin@fleetflow.com",
        password,
        firstName: "Fleet",
        lastName: "Admin",
        role: "admin",
        phone: "+91 9000000000"
      },
      {
        email: "manager@fleetflow.com",
        password,
        firstName: "Fleet",
        lastName: "Manager",
        role: "fleet_manager",
        phone: "+91 9000000001"
      },
      {
        email: "dispatcher@fleetflow.com",
        password,
        firstName: "Dispatch",
        lastName: "Ops",
        role: "dispatcher",
        phone: "+91 9000000002"
      }
    ]
  })

  const driversData = Array.from({ length: 30 }).map((_, index) => ({
    firstName: `Driver${index + 1}`,
    lastName: "Fleet",
    email: `driver${index + 1}@fleetflow.com`,
    phone: `+91 9100000${(index + 10).toString().padStart(3, "0")}`,
    licenseNumber: `DL-FF-${(index + 1).toString().padStart(4, "0")}`,
    licenseClass: index % 6 === 0 ? "D" : index % 5 === 0 ? "CE" : "C",
    licenseExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1 + (index % 3))),
    status: index % 4 === 0 ? "off_duty" : index % 3 === 0 ? "on_trip" : "active",
    safetyScore: 6 + (index % 4) + 0.3,
    totalTrips: 10 + index,
    completedTrips: 8 + index,
    cancelledTrips: index % 3,
    hireDate: new Date(new Date().setMonth(new Date().getMonth() - (index + 1))),
    isActive: true
  }))

  await prisma.driver.createMany({ data: driversData })

  const vehiclesData = Array.from({ length: 30 }).map((_, index) => ({
    vehicleNumber: `MH-FF-${(index + 1).toString().padStart(3, "0")}`,
    registrationNumber: `MH-FF-${(index + 1).toString().padStart(3, "0")}`,
    make: index % 2 === 0 ? "Tata" : "Ashok",
    model: index % 3 === 0 ? "Ace" : index % 3 === 1 ? "Dost" : "Eicher",
    year: 2020 + (index % 5),
    type: index % 3 === 0 ? "truck" : index % 3 === 1 ? "van" : "bus",
    fuelType: index % 2 === 0 ? "diesel" : "petrol",
    status: index % 5 === 0 ? "maintenance" : "active",
    currentMileage: 20000 + index * 1200,
    maxLoadCapacity: 2000 + index * 50
  }))

  await prisma.vehicle.createMany({ data: vehiclesData })

  const drivers = await prisma.driver.findMany()
  const vehicles = await prisma.vehicle.findMany()

  const assignmentsData = drivers.slice(0, 25).map((driver: any, index: number) => ({
    driverId: driver.id,
    vehicleId: vehicles[index % vehicles.length].id,
    startDate: new Date(new Date().setDate(new Date().getDate() - (index + 2))),
    isActive: true
  }))

  await prisma.driverVehicleAssignment.createMany({ data: assignmentsData })

  const tripsData = Array.from({ length: 40 }).map((_, index) => ({
    vehicleId: vehicles[index % vehicles.length].id,
    driverId: drivers[index % drivers.length].id,
    origin: index % 2 === 0 ? "Mumbai" : "Delhi",
    destination: index % 2 === 0 ? "Pune" : "Jaipur",
    scheduledDeparture: new Date(new Date().setDate(new Date().getDate() - (index + 1))),
    scheduledArrival: new Date(new Date().getTime() + 1000 * 60 * 60 * (4 + (index % 6))),
    status: index % 5 === 0 ? "completed" : index % 4 === 0 ? "cancelled" : index % 3 === 0 ? "in_progress" : "scheduled",
    distanceKm: 120 + index * 5,
    cargoWeightKg: 250 + index * 8
  }))

  await prisma.trip.createMany({ data: tripsData })

  const trips = await prisma.trip.findMany()

  const gpsData = Array.from({ length: 60 }).map((_, index) => ({
    vehicleId: vehicles[index % vehicles.length].id,
    tripId: trips[index % trips.length].id,
    latitude: 19.07 + index * 0.001,
    longitude: 72.87 + index * 0.001,
    speed: 45 + (index % 20),
    heading: 90 + (index % 180),
    source: "mobile_app",
    timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - index * 5))
  }))

  await prisma.gPSLocation.createMany({ data: gpsData })

  const maintenanceData = Array.from({ length: 35 }).map((_, index) => ({
    vehicleId: vehicles[index % vehicles.length].id,
    type: index % 2 === 0 ? "Oil Change" : "Brake Service",
    description: "Scheduled maintenance",
    cost: 1500 + index * 25,
    serviceDate: new Date(new Date().setDate(new Date().getDate() - (index + 5))),
    odometer: 20000 + index * 500,
    nextServiceDate: new Date(new Date().setDate(new Date().getDate() + (index + 20))),
    vendor: index % 2 === 0 ? "Rapid Auto" : "FleetFix",
    status: index % 3 === 0 ? "done" : "in_progress"
  }))

  await prisma.maintenanceLog.createMany({ data: maintenanceData })

  const expensesData = Array.from({ length: 45 }).map((_, index) => ({
    tripId: trips[index % trips.length].id,
    vehicleId: vehicles[index % vehicles.length].id,
    driverId: drivers[index % drivers.length].id,
    type: index % 4 === 0 ? "fuel" : index % 4 === 1 ? "toll" : index % 4 === 2 ? "repair" : "misc",
    amount: 1200 + index * 55,
    currency: "INR",
    date: new Date(new Date().setDate(new Date().getDate() - index)),
    description: "Trip expense",
    status: index % 3 === 0 ? "paid" : "approved"
  }))

  await prisma.expense.createMany({ data: expensesData })
}

seed()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })

// Model associations and initialization
import Trip from './Trip'
import Driver from './Driver'
import Vehicle from './Vehicle'
import DriverVehicleAssignment from './DriverVehicleAssignment'
import GPSLocation from './GPSLocation'

// Trip associations
Trip.belongsTo(Driver, {
  foreignKey: 'driverId',
  as: 'driver'
})

Trip.belongsTo(Vehicle, {
  foreignKey: 'vehicleId',
  as: 'vehicle'
})

Trip.hasMany(GPSLocation, {
  foreignKey: 'tripId',
  as: 'gpsLocations'
})

// Driver associations
Driver.hasMany(Trip, {
  foreignKey: 'driverId',
  as: 'trips'
})

Driver.belongsToMany(Vehicle, {
  through: DriverVehicleAssignment,
  foreignKey: 'driverId',
  otherKey: 'vehicleId',
  as: 'assignedVehicles'
})

// Vehicle associations
Vehicle.hasMany(Trip, {
  foreignKey: 'vehicleId',
  as: 'trips'
})

Vehicle.hasMany(GPSLocation, {
  foreignKey: 'vehicleId',
  as: 'gpsLocations'
})

Vehicle.belongsToMany(Driver, {
  through: DriverVehicleAssignment,
  foreignKey: 'vehicleId',
  otherKey: 'driverId',
  as: 'assignedDrivers'
})

// GPS Location associations
GPSLocation.belongsTo(Vehicle, {
  foreignKey: 'vehicleId',
  as: 'vehicle'
})

GPSLocation.belongsTo(Trip, {
  foreignKey: 'tripId',
  as: 'trip'
})

// DriverVehicleAssignment associations
DriverVehicleAssignment.belongsTo(Driver, {
  foreignKey: 'driverId',
  as: 'driver'
})

DriverVehicleAssignment.belongsTo(Vehicle, {
  foreignKey: 'vehicleId',
  as: 'vehicle'
})

export {
  Trip,
  Driver,
  Vehicle,
  DriverVehicleAssignment,
  GPSLocation
}

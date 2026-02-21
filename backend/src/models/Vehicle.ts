import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export enum VehicleStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
  RETIRED = 'retired'
}

export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  VAN = 'van',
  TRUCK = 'truck',
  BUS = 'bus',
  MOTORCYCLE = 'motorcycle'
}

export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  CNG = 'cng'
}

export interface VehicleAttributes {
  id: number
  vehicleNumber: string
  registrationNumber: string
  make: string
  model: string
  year: number
  vin?: string
  type: VehicleType
  fuelType: FuelType
  status: VehicleStatus
  currentMileage: number
  seatingCapacity?: number
  maxLoadCapacity?: number
  color?: string
  purchasePrice?: number
  currentValue?: number
  lastServiceDate?: Date
  nextServiceDue?: Date
  insuranceNumber?: string
  insuranceExpiryDate?: Date
  registrationExpiryDate?: Date
  notes?: string
  imageUrl?: string
  assignedDriverId?: number
  createdAt?: Date
  updatedAt?: Date
}

interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id' | 'vin' | 'seatingCapacity' | 'maxLoadCapacity' | 'color' | 'purchasePrice' | 'currentValue' | 'lastServiceDate' | 'nextServiceDue' | 'insuranceNumber' | 'insuranceExpiryDate' | 'registrationExpiryDate' | 'notes' | 'imageUrl' | 'assignedDriverId' | 'createdAt' | 'updatedAt'> {}

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
  public id!: number
  public vehicleNumber!: string
  public registrationNumber!: string
  public make!: string
  public model!: string
  public year!: number
  public vin?: string
  public type!: VehicleType
  public fuelType!: FuelType
  public status!: VehicleStatus
  public currentMileage!: number
  public seatingCapacity?: number
  public maxLoadCapacity?: number
  public color?: string
  public purchasePrice?: number
  public currentValue?: number
  public lastServiceDate?: Date
  public nextServiceDue?: Date
  public insuranceNumber?: string
  public insuranceExpiryDate?: Date
  public registrationExpiryDate?: Date
  public notes?: string
  public imageUrl?: string
  public assignedDriverId?: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Association inclusion
  public readonly gpsLocations?: any[]
  public readonly trips?: any[]
  public readonly assignedDrivers?: any[]
}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    vehicleNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    registrationNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    make: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    vin: {
      type: DataTypes.STRING(17),
      allowNull: true,
      unique: true
    },
    type: {
      type: DataTypes.ENUM(...Object.values(VehicleType)),
      allowNull: false,
      defaultValue: VehicleType.SEDAN
    },
    fuelType: {
      type: DataTypes.ENUM(...Object.values(FuelType)),
      allowNull: false,
      defaultValue: FuelType.PETROL
    },
    status: {
      type: DataTypes.ENUM(...Object.values(VehicleStatus)),
      allowNull: false,
      defaultValue: VehicleStatus.ACTIVE
    },
    currentMileage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    seatingCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maxLoadCapacity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Maximum load capacity in kilograms'
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    currentValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    lastServiceDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextServiceDue: {
      type: DataTypes.DATE,
      allowNull: true
    },
    insuranceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    insuranceExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    registrationExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    assignedDriverId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'vehicles',
    timestamps: true,
    indexes: [
      { fields: ['vehicleNumber'] },
      { fields: ['registrationNumber'] },
      { fields: ['status'] },
      { fields: ['type'] }
    ]
  }
)

export default Vehicle

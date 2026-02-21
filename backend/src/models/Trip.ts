import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export enum TripStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface TripAttributes {
  id: number
  vehicleId: number
  driverId: number
  origin: string
  destination: string
  scheduledDeparture: Date
  scheduledArrival?: Date
  actualDeparture?: Date
  actualArrival?: Date
  status: TripStatus
  distanceKm?: number
  cargoDescription?: string
  cargoWeightKg?: number
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

interface TripCreationAttributes
  extends Optional<
    TripAttributes,
    | 'id'
    | 'scheduledArrival'
    | 'actualDeparture'
    | 'actualArrival'
    | 'distanceKm'
    | 'cargoDescription'
    | 'cargoWeightKg'
    | 'notes'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Trip extends Model<TripAttributes, TripCreationAttributes> implements TripAttributes {
  public id!: number
  public vehicleId!: number
  public driverId!: number
  public origin!: string
  public destination!: string
  public scheduledDeparture!: Date
  public scheduledArrival?: Date
  public actualDeparture?: Date
  public actualArrival?: Date
  public status!: TripStatus
  public distanceKm?: number
  public cargoDescription?: string
  public cargoWeightKg?: number
  public notes?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Helper method to calculate trip duration in hours
  public getTripDurationHours(): number | null {
    if (this.actualDeparture && this.actualArrival) {
      const diff = this.actualArrival.getTime() - this.actualDeparture.getTime()
      return diff / (1000 * 60 * 60) // Convert milliseconds to hours
    }
    return null
  }

  // Helper method to check if trip is delayed
  public isDelayed(): boolean {
    if (this.status === TripStatus.IN_PROGRESS && this.scheduledArrival) {
      return new Date() > this.scheduledArrival
    }
    return false
  }

  // Helper method to check if trip is completed
  public isCompleted(): boolean {
    return this.status === TripStatus.COMPLETED
  }

  // Helper method to check if trip is active
  public isActive(): boolean {
    return this.status === TripStatus.SCHEDULED || this.status === TripStatus.IN_PROGRESS
  }

  // Helper method to get trip route
  public getRoute(): string {
    return `${this.origin} → ${this.destination}`
  }

  // Helper method to calculate estimated duration
  public getEstimatedDurationHours(): number | null {
    if (this.scheduledDeparture && this.scheduledArrival) {
      const diff = this.scheduledArrival.getTime() - this.scheduledDeparture.getTime()
      return diff / (1000 * 60 * 60)
    }
    return null
  }

  // Helper method to get delay in hours
  public getDelayHours(): number | null {
    if (this.actualArrival && this.scheduledArrival) {
      const diff = this.actualArrival.getTime() - this.scheduledArrival.getTime()
      return diff / (1000 * 60 * 60)
    }
    return null
  }
}

Trip.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'vehicle_id',
      references: {
        model: 'vehicles',
        key: 'id'
      }
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'driver_id',
      references: {
        model: 'drivers',
        key: 'id'
      }
    },
    origin: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    scheduledDeparture: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'scheduled_departure'
    },
    scheduledArrival: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'scheduled_arrival'
    },
    actualDeparture: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'actual_departure'
    },
    actualArrival: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'actual_arrival'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TripStatus)),
      allowNull: false,
      defaultValue: TripStatus.SCHEDULED
    },
    distanceKm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'distance_km'
    },
    cargoDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cargo_description'
    },
    cargoWeightKg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'cargo_weight_kg'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    tableName: 'trips',
    timestamps: true,
    underscored: true
  }
)

export default Trip

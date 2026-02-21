import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import Vehicle from './Vehicle'
import Trip from './Trip'

export enum LocationSource {
  MOBILE_APP = 'mobile_app',
  GPS_DEVICE = 'gps_device',
  MANUAL = 'manual'
}

export interface GPSLocationAttributes {
  id: number
  tripId?: number
  vehicleId: number
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  speed?: number
  heading?: number
  source: LocationSource
  isGeofenceComplete?: boolean
  geofenceId?: string
  idleStartTime?: Date
  isIdle?: boolean
  timestamp: Date
  createdAt?: Date
  updatedAt?: Date
}

interface GPSLocationCreationAttributes
  extends Optional<
    GPSLocationAttributes,
    | 'id'
    | 'tripId'
    | 'altitude'
    | 'accuracy'
    | 'speed'
    | 'heading'
    | 'isGeofenceComplete'
    | 'geofenceId'
    | 'idleStartTime'
    | 'isIdle'
    | 'createdAt'
    | 'updatedAt'
  > {}

class GPSLocation
  extends Model<GPSLocationAttributes, GPSLocationCreationAttributes>
  implements GPSLocationAttributes
{
  public id!: number
  public tripId?: number
  public vehicleId!: number
  public latitude!: number
  public longitude!: number
  public altitude?: number
  public accuracy?: number
  public speed?: number
  public heading?: number
  public source!: LocationSource
  public isGeofenceComplete?: boolean
  public geofenceId?: string
  public idleStartTime?: Date
  public isIdle?: boolean
  public timestamp!: Date
  public createdAt?: Date
  public updatedAt?: Date

  // Associations
  public readonly vehicle?: Vehicle
  public readonly trip?: Trip

  // Helper methods
  distanceTo(latitude: number, longitude: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.toRad(latitude - this.latitude)
    const dLon = this.toRad(longitude - this.longitude)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) *
        Math.cos(this.toRad(latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180
  }

  getCoordinates(): { latitude: number; longitude: number } {
    return { latitude: this.latitude, longitude: this.longitude }
  }

  isExcessiveSpeed(speedLimit: number): boolean {
    return this.speed ? this.speed > speedLimit : false
  }

  isHighAccuracy(): boolean {
    return this.accuracy ? this.accuracy < 10 : false
  }
}

GPSLocation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'trips',
        key: 'id'
      }
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vehicles',
        key: 'id'
      }
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: {
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: {
        min: -180,
        max: 180
      }
    },
    altitude: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Altitude in meters'
    },
    accuracy: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'GPS accuracy in meters'
    },
    speed: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Speed in km/h'
    },
    heading: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Direction in degrees (0-360)'
    },
    source: {
      type: DataTypes.ENUM(...Object.values(LocationSource)),
      defaultValue: LocationSource.MOBILE_APP,
      allowNull: false
    },
    isGeofenceComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether vehicle completed geofence zone'
    },
    geofenceId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference to geofence zone'
    },
    idleStartTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When idle tracking started'
    },
    isIdle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether vehicle is currently idle'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the location was recorded'
    }
  },
  {
    sequelize,
    tableName: 'gps_locations',
    timestamps: true,
    indexes: [
      {
        fields: ['vehicleId', 'timestamp']
      },
      {
        fields: ['tripId']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['latitude', 'longitude']
      }
    ]
  }
)

export default GPSLocation

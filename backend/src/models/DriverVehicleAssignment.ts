import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export interface DriverVehicleAssignmentAttributes {
  id: number
  driverId: number
  vehicleId: number
  assignedDate: Date
  unassignedDate?: Date
  isActive: boolean
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

interface DriverVehicleAssignmentCreationAttributes
  extends Optional<
    DriverVehicleAssignmentAttributes,
    'id' | 'unassignedDate' | 'notes' | 'createdAt' | 'updatedAt'
  > {}

class DriverVehicleAssignment
  extends Model<DriverVehicleAssignmentAttributes, DriverVehicleAssignmentCreationAttributes>
  implements DriverVehicleAssignmentAttributes
{
  public id!: number
  public driverId!: number
  public vehicleId!: number
  public assignedDate!: Date
  public unassignedDate?: Date
  public isActive!: boolean
  public notes?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Helper methods
  getDurationInDays(): number {
    const endDate = this.unassignedDate || new Date()
    const startDate = new Date(this.assignedDate)
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }
}

DriverVehicleAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'driver_id',
      references: {
        model: 'drivers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'vehicle_id',
      references: {
        model: 'vehicles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    assignedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'assigned_date',
      defaultValue: DataTypes.NOW
    },
    unassignedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'unassigned_date'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
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
    modelName: 'DriverVehicleAssignment',
    tableName: 'driver_vehicle_assignments',
    timestamps: true,
    underscored: true
  }
)

export default DriverVehicleAssignment

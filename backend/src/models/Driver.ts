import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export enum DriverStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ON_DUTY = 'on_duty',
  OFF_DUTY = 'off_duty',
  ON_TRIP = 'on_trip'
}

export enum LicenseClass {
  A = 'A',        // Motorcycles
  B = 'B',        // Cars
  C = 'C',        // Trucks
  D = 'D',        // Buses
  BE = 'BE',      // Car with trailer
  CE = 'CE'       // Truck with trailer
}

export interface DriverAttributes {
  id: number
  userId: number
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  licenseClass: LicenseClass
  licenseExpiryDate: Date
  licenseIssueDate?: Date
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  status: DriverStatus
  safetyScore: number
  totalTrips: number
  completedTrips: number
  cancelledTrips: number
  hireDate?: Date
  dateOfBirth?: Date
  passportNumber?: string
  medicalCertificateExpiry?: Date
  backgroundCheckDate?: Date
  notes?: string
  profileImageUrl?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface DriverCreationAttributes
  extends Optional<
    DriverAttributes,
    | 'id'
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'licenseIssueDate'
    | 'address'
    | 'city'
    | 'state'
    | 'zipCode'
    | 'emergencyContactName'
    | 'emergencyContactPhone'
    | 'hireDate'
    | 'dateOfBirth'
    | 'passportNumber'
    | 'medicalCertificateExpiry'
    | 'backgroundCheckDate'
    | 'notes'
    | 'profileImageUrl'
    | 'totalTrips'
    | 'completedTrips'
    | 'cancelledTrips'
    | 'safetyScore'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Driver extends Model<DriverAttributes, DriverCreationAttributes> implements DriverAttributes {
  public id!: number
  public userId!: number
  public firstName!: string
  public lastName!: string
  public email!: string
  public phone!: string
  public licenseNumber!: string
  public licenseClass!: LicenseClass
  public licenseExpiryDate!: Date
  public licenseIssueDate?: Date
  public address?: string
  public city?: string
  public state?: string
  public zipCode?: string
  public emergencyContactName?: string
  public emergencyContactPhone?: string
  public status!: DriverStatus
  public safetyScore!: number
  public totalTrips!: number
  public completedTrips!: number
  public cancelledTrips!: number
  public hireDate?: Date
  public dateOfBirth?: Date
  public passportNumber?: string
  public medicalCertificateExpiry?: Date
  public backgroundCheckDate?: Date
  public notes?: string
  public profileImageUrl?: string
  public isActive!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Helper methods
  isLicenseExpired(): boolean {
    return new Date() > new Date(this.licenseExpiryDate)
  }

  getLicenseExpiringInDays(days: number = 30): boolean {
    const expiryDate = new Date(this.licenseExpiryDate)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    return !this.isLicenseExpired() && new Date() <= expiryDate && expiryDate <= futureDate
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  getCompletionRate(): number {
    if (this.totalTrips === 0) return 0
    return Math.round((this.completedTrips / this.totalTrips) * 100)
  }
}

Driver.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    licenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'license_number'
    },
    licenseClass: {
      type: DataTypes.ENUM(...Object.values(LicenseClass)),
      allowNull: false,
      field: 'license_class'
    },
    licenseExpiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'license_expiry_date'
    },
    licenseIssueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'license_issue_date'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'zip_code'
    },
    emergencyContactName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'emergency_contact_name'
    },
    emergencyContactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'emergency_contact_phone'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DriverStatus)),
      allowNull: false,
      defaultValue: DriverStatus.INACTIVE
    },
    safetyScore: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 5.0,
      field: 'safety_score'
    },
    totalTrips: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_trips'
    },
    completedTrips: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'completed_trips'
    },
    cancelledTrips: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'cancelled_trips'
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'hire_date'
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'date_of_birth'
    },
    passportNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'passport_number'
    },
    medicalCertificateExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'medical_certificate_expiry'
    },
    backgroundCheckDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'background_check_date'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profileImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'profile_image_url'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
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
    modelName: 'Driver',
    tableName: 'drivers',
    timestamps: true,
    underscored: true
  }
)

export default Driver

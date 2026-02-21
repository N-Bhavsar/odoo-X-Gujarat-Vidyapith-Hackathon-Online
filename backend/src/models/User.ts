import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

export enum UserRole {
  ADMIN = 'admin',
  FLEET_MANAGER = 'fleet_manager',
  DISPATCHER = 'dispatcher',
  DRIVER = 'driver'
}

interface UserAttributes {
  id: number
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  isActive: boolean
  lastLogin?: Date
  createdAt?: Date
  updatedAt?: Date
}

interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'phone' | 'lastLogin' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number
  public email!: string
  public password!: string
  public firstName!: string
  public lastName!: string
  public role!: UserRole
  public phone?: string
  public isActive!: boolean
  public lastLogin?: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.DRIVER
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] }
    ]
  }
)

export default User

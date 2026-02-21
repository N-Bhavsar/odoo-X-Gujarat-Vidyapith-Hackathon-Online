export const roleRank: Record<string, number> = {
  admin: 5,
  fleet_manager: 4,
  dispatcher: 3,
  safety_officer: 3,
  financial_analyst: 3,
  driver: 1
}

export type UserRole = 'admin' | 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst' | 'driver'

// Role permissions configuration
export const rolePermissions = {
  fleet_manager: {
    description: 'Oversee vehicle health, asset lifecycle, and scheduling',
    access: ['vehicles', 'maintenance', 'analytics', 'drivers', 'trips']
  },
  dispatcher: {
    description: 'Create trips, assign drivers, and validate cargo loads',
    access: ['trips', 'drivers', 'vehicles', 'dashboard']
  },
  safety_officer: {
    description: 'Monitor driver compliance, license expirations, and safety scores',
    access: ['drivers', 'analytics', 'trips', 'dashboard']
  },
  financial_analyst: {
    description: 'Audit fuel spend, maintenance ROI, and operational costs',
    access: ['expenses', 'analytics', 'maintenance', 'dashboard']
  },
  admin: {
    description: 'Full system access',
    access: ['dashboard', 'vehicles', 'trips', 'maintenance', 'expenses', 'drivers', 'analytics']
  },
  driver: {
    description: 'Basic driver access',
    access: ['dashboard', 'trips']
  }
}

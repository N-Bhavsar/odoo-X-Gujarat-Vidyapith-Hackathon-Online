export type UserRole = 'admin' | 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst' | 'driver'

export interface RolePermissions {
  description: string
  access: string[]
}

// Role permissions configuration matching backend
export const rolePermissions: Record<UserRole, RolePermissions> = {
  fleet_manager: {
    description: 'Oversee vehicle health, asset lifecycle, and scheduling',
    access: ['dashboard', 'vehicles', 'maintenance', 'analytics', 'drivers', 'trips']
  },
  dispatcher: {
    description: 'Create trips, assign drivers, and validate cargo loads',
    access: ['dashboard', 'trips', 'drivers', 'vehicles']
  },
  safety_officer: {
    description: 'Monitor driver compliance, license expirations, and safety scores',
    access: ['dashboard', 'drivers', 'analytics', 'trips']
  },
  financial_analyst: {
    description: 'Audit fuel spend, maintenance ROI, and operational costs',
    access: ['dashboard', 'expenses', 'analytics', 'maintenance']
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

/**
 * Check if a user has access to a specific route/feature
 */
export const hasAccess = (userRole: UserRole | undefined, route: string): boolean => {
  if (!userRole) return false
  const permissions = rolePermissions[userRole]
  if (!permissions) return false
  return permissions.access.includes(route)
}

/**
 * Get formatted role name for display
 */
export const getRoleDisplayName = (role: UserRole | string): string => {
  const roleNames: Record<string, string> = {
    admin: 'Administrator',
    fleet_manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
    driver: 'Driver'
  }
  return roleNames[role] || role
}

/**
 * Get role-specific navigation items
 */
export const getNavigationForRole = (userRole: UserRole | undefined) => {
  if (!userRole) return []
  const permissions = rolePermissions[userRole]
  if (!permissions) return []
  return permissions.access
}

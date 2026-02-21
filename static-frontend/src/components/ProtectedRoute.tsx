import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { hasAccess, type UserRole } from '@/lib/permissions'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoute: string
}

/**
 * Protected Route component that checks if user has access to a specific route
 */
export const ProtectedRoute = ({ children, requiredRoute }: ProtectedRouteProps) => {
  const location = useLocation()
  
  // Get user from localStorage
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const user = JSON.parse(userStr)
  const userRole = user.role as UserRole

  // Check if user has access to this route
  if (!hasAccess(userRole, requiredRoute)) {
    // User doesn't have permission, redirect to dashboard
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

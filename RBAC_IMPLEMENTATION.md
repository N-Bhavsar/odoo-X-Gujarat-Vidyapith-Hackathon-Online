# Role-Based Access Control (RBAC) Implementation

## Overview
Comprehensive role-based access control has been implemented for FleetFlow, providing four specialized user roles with distinct permissions and access levels.

## User Roles & Permissions

### 1. **Fleet Manager** (Role: `fleet_manager`)
**Description:** Oversee vehicle health, asset lifecycle, and scheduling

**Accessible Features:**
- Dashboard
- Vehicles (full CRUD)
- Maintenance Logs (full CRUD)
- Analytics & Reports
- Driver Management (full CRUD)
- Trip Management (view only)

**API Permissions:**
- ✅ GET vehicles, maintenance, drivers, analytics
- ✅ POST/PUT vehicles, maintenance, drivers
- ✖️ DELETE vehicles/maintenance (only admin can delete)
- ✖️ DELETE drivers (only admin can delete)

---

### 2. **Dispatcher** (Role: `dispatcher`)
**Description:** Create trips, assign drivers, and validate cargo loads

**Accessible Features:**
- Dashboard
- Trip Dispatcher (full CRUD)
- Driver Management (view & assign)
- Vehicles (view)

**API Permissions:**
- ✅ GET trips, drivers, vehicles
- ✅ POST/PUT trips
- ✅ PATCH trips (status/start/complete/cancel)
- ✅ POST driver/assignments (assign drivers to vehicles)
- ✅ PATCH driver trips metrics
- ✖️ DELETE trips (only admin)

---

### 3. **Safety Officer** (Role: `safety_officer`)
**Description:** Monitor driver compliance, license expirations, and safety scores

**Accessible Features:**
- Dashboard
- Driver Performance & Analytics
- Trip History
- Driver Metrics & Compliance Status

**API Permissions:**
- ✅ GET drivers, trips, analytics
- ✅ PATCH driver safety scores
- ✅ GET driver license expiry checks
- ✖️ Modify any other resources

---

### 4. **Financial Analyst** (Role: `financial_analyst`)
**Description:** Audit fuel spend, maintenance ROI, and operational costs

**Accessible Features:**
- Dashboard
- Expense & Fuel Management (full CRUD)
- Analytics & Financial Reports
- Maintenance Logs (view)

**API Permissions:**
- ✅ GET expenses, maintenance, analytics
- ✅ POST/PUT/PATCH expenses
- ✅ Approve/reject/payment status on expenses
- ✖️ DELETE expenses (only admin)

---

### 5. **Admin** (Role: `admin`)
**Description:** Full system access and administrative control

**Accessible Features:**
- Full access to all features
- User management
- System administration

**API Permissions:**
- ✅ Full CRUD on all resources
- ✅ User management
- ✅ System configuration

---

### 6. **Driver** (Role: `driver`)
**Description:** Basic driver access for trip management

**Accessible Features:**
- Dashboard
- Trip Details

**API Permissions:**
- ✅ GET own trips and assignments
- ✖️ Minimal write capabilities

---

## Frontend Implementation

### Navigation Sidebar Filtering
The sidebar automatically filters menu items based on user role. Located in [Layout.tsx](src/components/Layout.tsx):

```tsx
const navItems = useMemo(() => {
  if (!user?.role) return []
  return allNavItems.filter(item => hasAccess(user.role as UserRole, item.route))
}, [user?.role])
```

### Route Protection
ProtectedRoute component ([ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)) checks permissions:

```tsx
if (!hasAccess(userRole, requiredRoute)) {
  return <Navigate to="/dashboard" replace />
}
```

### Permission Utilities
Helper functions in [lib/permissions.ts](src/lib/permissions.ts):
- `hasAccess(role, route)` - Check if user can access a route
- `getRoleDisplayName(role)` - Get formatted role display name
- `getNavigationForRole(role)` - Get allowed routes for a role

---

## Backend Implementation

### Authentication & Authorization Middleware

Located in [middleware/auth.ts](backend/src/middleware/auth.ts):

```typescript
// Requires user to be authenticated
export const requireAuth = async (req, res, next) => { ... }

// Requires specific role (uses roleRank hierarchy)
export const requireRole = (role: string) => { ... }
```

### Role Ranking System
Defined in [utils/roles.ts](backend/src/utils/roles.ts):

```typescript
export const roleRank: Record<string, number> = {
  admin: 5,
  fleet_manager: 4,
  dispatcher: 3,
  safety_officer: 3,
  financial_analyst: 3,
  driver: 1
}
```

Higher rank allows access to lower-ranked resources.

---

## API Endpoint Protection

All write operations (POST, PUT, PATCH, DELETE) now require role-based authorization:

### Vehicles Endpoint
- `GET /api/vehicles` - All authenticated users
- `POST /api/vehicles` - fleet_manager, admin
- `PUT /api/vehicles/:id` - fleet_manager, admin
- `DELETE /api/vehicles/:id` - admin only

### Trips Endpoint
- `GET /api/trips` - All authenticated users
- `POST /api/trips` - dispatcher, fleet_manager, admin
- `PUT /api/trips/:id` - dispatcher, fleet_manager, admin
- `PATCH /api/trips/:id/status` - dispatcher, fleet_manager, admin
- `POST /api/trips/:id/start` - dispatcher, fleet_manager, admin
- `POST /api/trips/:id/complete` - dispatcher, fleet_manager, admin
- `POST /api/trips/:id/cancel` - dispatcher, fleet_manager, admin
- `DELETE /api/trips/:id` - admin only

### Drivers Endpoint
- `GET /api/drivers` - All authenticated users
- `POST /api/drivers` - fleet_manager, admin
- `PUT /api/drivers/:id` - fleet_manager, admin
- `PATCH /api/drivers/:id/status` - fleet_manager, admin
- `PATCH /api/drivers/:id/safety-score` - safety_officer
- `PATCH /api/drivers/:id/trips` - dispatcher
- `DELETE /api/drivers/:id` - admin only

### Maintenance Endpoint
- `GET /api/maintenance` - All authenticated users
- `POST /api/maintenance` - fleet_manager, admin
- `PUT /api/maintenance/:id` - fleet_manager, admin
- `PATCH /api/maintenance/:id/status` - fleet_manager, admin
- `DELETE /api/maintenance/:id` - admin only

### Expenses Endpoint
- `GET /api/expenses` - All authenticated users
- `POST /api/expenses` - financial_analyst
- `PUT /api/expenses/:id` - financial_analyst, fleet_manager, admin
- `PATCH /api/expenses/:id/status` - financial_analyst, fleet_manager, admin
- `DELETE /api/expenses/:id` - admin only

### Assignments Endpoint
- `GET /api/assignments` - All authenticated users
- `POST /api/assignments` - dispatcher, fleet_manager, admin
- `PATCH /api/assignments/:id/end` - dispatcher, fleet_manager, admin
- `DELETE /api/assignments/:id` - admin only

---

## Testing the RBAC System

### Test Accounts to Create

```sql
-- Fleet Manager
INSERT INTO "User" (email, password, firstName, lastName, role, phone) 
VALUES ('fleet@example.com', 'hashed_pwd', 'Jane', 'Fleet', 'fleet_manager', '+1234567890');

-- Dispatcher
INSERT INTO "User" (email, password, firstName, lastName, role, phone) 
VALUES ('dispatch@example.com', 'hashed_pwd', 'John', 'Dispatch', 'dispatcher', '+1234567891');

-- Safety Officer
INSERT INTO "User" (email, password, firstName, lastName, role, phone) 
VALUES ('safety@example.com', 'hashed_pwd', 'Mike', 'Safety', 'safety_officer', '+1234567892');

-- Financial Analyst
INSERT INTO "User" (email, password, firstName, lastName, role, phone) 
VALUES ('finance@example.com', 'hashed_pwd', 'Sarah', 'Finance', 'financial_analyst', '+1234567893');
```

### Test Scenarios

#### 1. Fleet Manager Flow
1. Login as fleet manager
2. Verify sidebar shows: Vehicles, Maintenance, Drivers, Analytics
3. Create a new vehicle (POST /api/vehicles)
4. Update vehicle (PUT /api/vehicles/:id)
5. Try to delete vehicle → Should get 403 Forbidden
6. Try to access Expenses page → Should redirect to Dashboard

#### 2. Dispatcher Flow
1. Login as dispatcher
2. Verify sidebar shows: Trips, Drivers, Vehicles
3. Create a new trip (POST /api/trips)
4. Start a trip (POST /api/trips/:id/start)
5. Complete a trip (POST /api/trips/:id/complete)
6. Assign driver to vehicle (POST /api/assignments)
7. Try to delete a trip → Should get 403 Forbidden

#### 3. Safety Officer Flow
1. Login as safety officer
2. Verify sidebar shows: Drivers, Analytics, Trips
3. View driver details
4. Update driver safety score (PATCH /api/drivers/:id/safety-score)
5. Try to create a vehicle → Should get 403 Forbidden
6. Try to create a trip → Should redirect to Dashboard

#### 4. Financial Analyst Flow
1. Login as financial analyst
2. Verify sidebar shows: Expenses, Analytics, Maintenance
3. Create an expense (POST /api/expenses)
4. Update expense status (PATCH /api/expenses/:id/status)
5. Try to create a vehicle → Should get 403 Forbidden
6. Try to assign a driver → Should redirect to Dashboard

#### 5. Admin Flow
1. Login as admin
2. Verify sidebar shows all sections
3. Perform any operation → Should all work
4. Delete any resource → Should work

---

## Key Files Modified

### Frontend
- `src/lib/permissions.ts` - Role permissions configuration
- `src/components/Layout.tsx` - Sidebar role-based filtering
- `src/components/ProtectedRoute.tsx` - Route protection logic

### Backend
- `src/middleware/auth.ts` - Added `requireRole` middleware
- `src/utils/roles.ts` - Role permissions and ranking system
- `src/routes/vehicles.ts` - Added role restrictions
- `src/routes/trips.ts` - Added role restrictions
- `src/routes/drivers.ts` - Added role restrictions
- `src/routes/maintenance.ts` - Added role restrictions
- `src/routes/expenses.ts` - Added role restrictions
- `src/routes/assignments.ts` - Added role restrictions
- `prisma/schema.prisma` - UserRole enum definition

---

## Error Responses

When a user lacks permission for an action:

**401 Unauthorized** - User not authenticated
```json
{ "message": "Unauthorized" }
```

**403 Forbidden** - User authenticated but lacks required role
```json
{ "message": "Forbidden" }
```

---

## Future Enhancements

1. **Granular Permissions**: Implement permission-level control beyond roles
2. **Resource-Level RBAC**: Control access to specific resources
3. **Audit Logging**: Log all access attempts and modifications
4. **Dynamic Roles**: Allow custom role creation
5. **Permission Inheritance**: Create role hierarchies with inherited permissions

---

## Migration Commands

To apply Prisma schema changes:

```bash
cd backend
npx prisma migrate dev --name add_user_roles
npx prisma db seed
```

For existing databases, manually add role column if needed:

```sql
ALTER TABLE "User" ADD COLUMN role VARCHAR(50) DEFAULT 'driver';
```

# Role-Based Access Control - Feature Matrix

## Visual Access Matrix

| Feature | Admin | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst | Driver |
|---------|:-----:|:-------------:|:----------:|:---------------:|:-----------------:|:------:|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Vehicles** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Create Vehicle** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit Vehicle** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Delete Vehicle** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Trips** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Create Trip** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Trip** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Start/Complete Trip** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Cancel Trip** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delete Trip** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Drivers** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Create Driver** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit Driver** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Update Safety Score** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Assign Driver to Vehicle** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delete Driver** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Maintenance Logs** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Create Maintenance Log** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit Maintenance Log** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Delete Maintenance Log** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Expenses** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Create Expense** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Edit Expense** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Approve Expense** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Delete Expense** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Analytics** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Manage Users** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Sidebar Visibility Matrix

Which menu items appear in the sidebar for each role:

### Fleet Manager Sidebar
- ✅ Command Center (Dashboard)
- ✅ Vehicle Registry
- ✅ Trip Dispatcher
- ✅ Maintenance Logs
- ✅ Driver Performance
- ✅ Analytics

### Dispatcher Sidebar
- ✅ Command Center (Dashboard)
- ✅ Trip Dispatcher
- ✅ Vehicle Registry (view-only)
- ✅ Driver Performance (view-only)

### Safety Officer Sidebar
- ✅ Command Center (Dashboard)
- ✅ Driver Performance
- ✅ Analytics
- ✅ Trip Dispatcher (view-only)

### Financial Analyst Sidebar
- ✅ Command Center (Dashboard)
- ✅ Expense & Fuel
- ✅ Analytics
- ✅ Maintenance Logs (view-only)

### Admin Sidebar
- ✅ Command Center (Dashboard)
- ✅ Vehicle Registry
- ✅ Trip Dispatcher
- ✅ Maintenance Logs
- ✅ Expense & Fuel
- ✅ Driver Performance
- ✅ Analytics

### Driver Sidebar
- ✅ Command Center (Dashboard)
- ✅ Trip Dispatcher (own trips only)

## API Endpoint Authorization Summary

```
GET Endpoints (Most available to all authenticated users)
├─ /api/vehicles → All authenticated
├─ /api/trips → All authenticated
├─ /api/drivers → All authenticated
├─ /api/maintenance → All authenticated
├─ /api/expenses → All authenticated
├─ /api/assignments → All authenticated
└─ /api/analytics → All authenticated

POST Endpoints (Restricted)
├─ /api/vehicles → fleet_manager, admin
├─ /api/trips → dispatcher, fleet_manager, admin
├─ /api/drivers → fleet_manager, admin
├─ /api/maintenance → fleet_manager, admin
├─ /api/expenses → financial_analyst
└─ /api/assignments → dispatcher, fleet_manager, admin

PUT/PATCH Endpoints (Restricted)
├─ /api/vehicles/:id → fleet_manager, admin
├─ /api/trips/:id → dispatcher, fleet_manager, admin
├─ /api/drivers/:id → fleet_manager, admin
├─ /api/drivers/:id/safety-score → safety_officer
├─ /api/maintenance/:id → fleet_manager, admin
└─ /api/expenses/:id → financial_analyst

DELETE Endpoints (Admin Only)
├─ /api/vehicles/:id → admin
├─ /api/trips/:id → admin
├─ /api/drivers/:id → admin
├─ /api/maintenance/:id → admin
└─ /api/expenses/:id → admin
```

## Role Hierarchy & Rank

```
                        ADMIN (Rank: 5)
                          │
                 ┌────────┼────────┐
                 │        │         │
           Fleet Manager  │     Reserved
           (Rank: 4)      │
                    ┌─────┴──────┐
                    │            │
              Dispatcher    Safety Officer / Financial Analyst
              (Rank: 3)      (Rank: 3)
                    │            │
                    └─────┬──────┘
                         │
                       DRIVER
                      (Rank: 1)
```

Higher rank users can generally access lower rank resources, but with specific role-based restrictions for sensitive operations.

## Special Permission Notes

### Fleet Manager Special Abilities
- Can create and manage vehicles
- Can create and manage drivers
- Can create and manage maintenance logs
- Cannot delete any resources (only admin)
- Can view all trips but cannot create/edit them directly

### Dispatcher Special Abilities
- Full trip lifecycle control (create, start, complete, cancel)
- Can assign drivers to vehicles
- Can update trip-related driver metrics
- Cannot modify driver profiles
- Cannot create/delete trips (only manage existing ones)

### Safety Officer Special Abilities
- Can update driver safety scores
- Can view all drivers and their metrics
- Can view trip history for compliance
- Cannot create/edit/delete any resources
- Read-only access to most features

### Financial Analyst Special Abilities
- Full expense management (create, edit, approve)
- Can view maintenance costs
- Can view operational analytics
- Cannot create/edit vehicles or drivers
- Cannot manage trips

## Error Scenarios & Responses

### Scenario 1: Dispatcher tries to create vehicle
```
Request: POST /api/vehicles
Response: 403 Forbidden
Body: { "message": "Forbidden" }
```

### Scenario 2: Fleet Manager tries to delete vehicle
```
Request: DELETE /api/vehicles/123
Response: 403 Forbidden
Body: { "message": "Forbidden" }
```

### Scenario 3: Safety Officer tries to update expense
```
Request: PATCH /api/expenses/456
Response: 403 Forbidden
Body: { "message": "Forbidden" }
```

### Scenario 4: Financial Analyst tries to create trip
```
Request: POST /api/trips
Response: 403 Forbidden
Body: { "message": "Forbidden" }
```

## Frontend Route Protection Examples

### Protected Route Usage
```tsx
<Route 
  path="/vehicles" 
  element={
    <ProtectedRoute requiredRoute="vehicles">
      <Layout><VehicleRegistry /></Layout>
    </ProtectedRoute>
  } 
/>
```

### Sidebar Filtering Logic
```tsx
const navItems = useMemo(() => {
  if (!user?.role) return []
  return allNavItems.filter(item => hasAccess(user.role, item.route))
}, [user?.role])
```

## Test Cases for Each Role

### Fleet Manager Test Suite
- [ ] Login successfully
- [ ] Access Vehicle Registry
- [ ] Create a new vehicle
- [ ] Edit vehicle details
- [ ] Access Maintenance Logs
- [ ] Create maintenance record
- [ ] Access Driver Performance
- [ ] Create new driver
- [ ] View Analytics
- [ ] Cannot access Expenses page
- [ ] Cannot delete a vehicle

### Dispatcher Test Suite
- [ ] Login successfully
- [ ] Access Trip Dispatcher
- [ ] Create a new trip
- [ ] Assign driver to vehicle
- [ ] Start a trip
- [ ] Complete a trip
- [ ] Cancel a trip
- [ ] View Drivers (read-only)
- [ ] View Vehicles (read-only)
- [ ] Cannot create a vehicle
- [ ] Cannot delete a trip

### Safety Officer Test Suite
- [ ] Login successfully
- [ ] Access Driver Performance
- [ ] View driver details
- [ ] Update driver safety score
- [ ] View Analytics
- [ ] View Trip history
- [ ] Cannot create a vehicle
- [ ] Cannot create a trip
- [ ] Cannot access Maintenance Logs
- [ ] Cannot access Expenses

### Financial Analyst Test Suite
- [ ] Login successfully
- [ ] Access Expense & Fuel
- [ ] Create new expense
- [ ] Edit expense
- [ ] Approve/Reject expense
- [ ] View Analytics
- [ ] View Maintenance Logs (read-only)
- [ ] Cannot create a vehicle
- [ ] Cannot create a trip
- [ ] Cannot delete an expense

### Admin Test Suite
- [ ] Login successfully
- [ ] Access all sections
- [ ] Create, edit, delete any resource
- [ ] Manage users
- [ ] System configuration access
- [ ] Delete vehicles
- [ ] Delete trips
- [ ] Delete drivers
- [ ] Delete maintenance logs
- [ ] Delete expenses

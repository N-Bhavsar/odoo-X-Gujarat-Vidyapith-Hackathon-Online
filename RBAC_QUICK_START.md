# RBAC System - Quick Start Guide

## Setup & Verification

### 1. Database Seeding (Optional but Recommended)

If you have seed data in your database, users are already assigned roles. To verify:

```bash
cd backend
npx prisma studio
```

Look for the `User` table and verify the `role` column has values like:
- `fleet_manager`
- `dispatcher`
- `safety_officer`
- `financial_analyst`
- `driver`
- `admin`

### 2. Create Test Users

If you need to create test users manually:

```sql
-- Connect to your PostgreSQL database
psql -U postgres -d fleetflow

-- Create test users with different roles
INSERT INTO "User" (email, password, "firstName", "lastName", role, phone, "isActive") 
VALUES ('fleet@example.com', '$2b$10$...hashedpwd...', 'Jane', 'Fleet', 'fleet_manager', '+1234567890', true);

INSERT INTO "User" (email, password, "firstName", "lastName", role, phone, "isActive") 
VALUES ('dispatch@example.com', '$2b$10$...hashedpwd...', 'John', 'Dispatch', 'dispatcher', '+1234567891', true);

INSERT INTO "User" (email, password, "firstName", "lastName", role, phone, "isActive") 
VALUES ('safety@example.com', '$2b$10$...hashedpwd...', 'Mike', 'Safety', 'safety_officer', '+1234567892', true);

INSERT INTO "User" (email, password, "firstName", "lastName", role, phone, "isActive") 
VALUES ('finance@example.com', '$2b$10$...hashedpwd...', 'Sarah', 'Finance', 'financial_analyst', '+1234567893', true);

INSERT INTO "User" (email, password, "firstName", "lastName", role, phone, "isActive") 
VALUES ('admin@example.com', '$2b$10$...hashedpwd...', 'Admin', 'User', 'admin', '+1234567894', true);
```

**Note:** You need to hash passwords. Use bcrypt with salt rounds 10. Or update through the registration endpoint.

### 3. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd static-frontend
npm run dev
```

### 4. Access the Application

```
Frontend: http://localhost:5173
Backend API: http://localhost:5000
```

---

## Testing Each Role

### Fleet Manager Walkthrough

1. **Login**
   ```
   Email: fleet@example.com
   Password: (Your test password)
   ```

2. **Verify Sidebar**
   - Should see: Dashboard, Vehicles, Trips, Maintenance, Drivers, Analytics
   - Should NOT see: Hidden admin features

3. **Test Vehicle Management**
   - Go to Vehicle Registry
   - Click "Add New Vehicle"
   - Fill in details
   - Click Save
   - Should save successfully

4. **Test Deletion Restriction**
   - Try to delete a vehicle
   - Should receive 403 Forbidden error
   - Error message: "Forbidden"

5. **Test Trip Access (Read-Only)**
   - Go to Trip Dispatcher
   - Should see trips but cannot create
   - Try to create trip → Should be redirected

---

### Dispatcher Walkthrough

1. **Login**
   ```
   Email: dispatch@example.com
   Password: (Your test password)
   ```

2. **Verify Sidebar**
   - Should see: Dashboard, Trips, Drivers (view), Vehicles (view)
   - Should NOT see: Maintenance, Expenses, Vehicles (edit), Analytics

3. **Test Trip Management**
   - Go to Trip Dispatcher
   - Can create new trips
   - Can start trips
   - Can complete/cancel trips

4. **Test Driver Assignment**
   - In Trip Dispatcher, try to assign driver
   - Should work successfully
   - Make PATCH request to `/api/drivers/:id/trips`

5. **Test Creation Restrictions**
   - Try to navigate to Vehicle Registry and create vehicle
   - Should be redirected to Dashboard with no access

---

### Safety Officer Walkthrough

1. **Login**
   ```
   Email: safety@example.com
   Password: (Your test password)
   ```

2. **Verify Sidebar**
   - Should see: Dashboard, Drivers, Analytics, Trips (view-only)
   - Should NOT see: Vehicles, Maintenance, Expenses

3. **Test Safety Score Update**
   - Go to Driver Performance
   - Click on a driver
   - Look for "Update Safety Score" button
   - Should be able to update score
   - Other driver details should be read-only

4. **Test License Expiry Checks**
   - In Driver Performance, should highlight drivers with expiring licenses
   - Can view compliance status
   - Cannot edit driver profiles

5. **Test Analytics Access**
   - Should see analytics dashboards
   - Cannot perform any modifications

---

### Financial Analyst Walkthrough

1. **Login**
   ```
   Email: finance@example.com
   Password: (Your test password)
   ```

2. **Verify Sidebar**
   - Should see: Dashboard, Expenses, Analytics, Maintenance (view-only)
   - Should NOT see: Vehicles, Drivers, Trips

3. **Test Expense Management**
   - Go to Expense & Fuel
   - Create new expense entry
   - Edit expense
   - Change status (Pending → Approved → Paid)

4. **Test Approval Workflow**
   - Create an expense with "Pending" status
   - Update status to "Approved"
   - Update status to "Paid"
   - Cannot delete expense

5. **Test Analytics Access**
   - Should see financial KPIs
   - Should see expense trends
   - Cannot access operational data

---

### Admin Walkthrough

1. **Login**
   ```
   Email: admin@example.com
   Password: (Your test password)
   ```

2. **Verify Full Access**
   - Should see: All menu items
   - Dashboard, Vehicles, Trips, Maintenance, Drivers, Expenses, Analytics

3. **Test Full CRUD Operations**
   - Create resource → Works ✅
   - Edit resource → Works ✅
   - Delete resource → Works ✅

4. **Test User Management**
   - Should be able to manage users
   - Change user roles
   - Activate/deactivate users

5. **Test System Admin Features**
   - Should have access to system settings
   - Should be able to delete any resource

---

## API Testing with Postman

### 1. Set Up Environment Variables

Create a postman environment with:
```json
{
  "base_url": "http://localhost:5000/api",
  "token": "your_jwt_token_here"
}
```

### 2. Test Login Endpoint

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "dispatch@example.com",
  "password": "your_password"
}
```

Response (save token):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "dispatch@example.com",
    "firstName": "John",
    "lastName": "Dispatch",
    "role": "dispatcher"
  }
}
```

### 3. Test Authorized Request (Should Work)

```
GET http://localhost:5000/api/trips
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Test Permission Denied (Should Fail)

```
POST http://localhost:5000/api/vehicles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "vehicleNumber": "TEST-001",
  "registrationNumber": "REG-001",
  "make": "Toyota",
  "model": "Hiace",
  "year": 2023
}
```

Response (403 Forbidden):
```json
{
  "message": "Forbidden"
}
```

---

## Common Testing Scenarios

### Scenario 1: Dispatcher Creates Trip
```bash
# 1. Login as dispatcher
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dispatch@example.com","password":"password"}'

# Extract token from response

# 2. Create trip with dispatcher token (Should succeed)
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "driverId": 1,
    "origin": "City A",
    "destination": "City B",
    "scheduledDeparture": "2024-02-25T10:00:00Z"
  }'
```

### Scenario 2: Safety Officer Updates Safety Score
```bash
# 1. Login as safety officer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"safety@example.com","password":"password"}'

# 2. Update driver safety score (Should succeed)
curl -X PATCH http://localhost:5000/api/drivers/1/safety-score \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"safetyScore": 4.5}'
```

### Scenario 3: Fleet Manager Cannot Delete Vehicle
```bash
# 1. Login as fleet manager
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fleet@example.com","password":"password"}'

# 2. Try to delete vehicle (Should fail with 403)
curl -X DELETE http://localhost:5000/api/vehicles/1 \
  -H "Authorization: Bearer $TOKEN"

# Response: 403 Forbidden
```

---

## Troubleshooting

### Issue: "Unauthorized" on all requests
**Solution:** 
- Check that JWT_SECRET is set in `.env`
- Verify token is not expired (expires in 7 days by default)
- Check Authorization header format: `Bearer token_here`

### Issue: "Forbidden" when should have access
**Solution:**
- Verify user role in database matches expected role
- Check roleRank in `backend/src/utils/roles.ts`
- Review route middleware requirements

### Issue: Sidebar not showing menu items
**Solution:**
- Clear browser localStorage
- Check `hasAccess` function in `src/lib/permissions.ts`
- Verify user role is set in localStorage

### Issue: CORS errors on API calls
**Solution:**
- Check `CORS_ORIGIN` in `.env`
- Should be set to frontend URL (http://localhost:5173)
- Restart backend after changing `.env`

### Issue: Routes redirect to Dashboard
**Solution:**
- Check `ProtectedRoute` requiredRoute parameter matches role permissions
- Review role permissions in `src/lib/permissions.ts`
- Verify localStorage contains correct user object

---

## Next Steps

1. **Test all roles** in the application
2. **Verify sidebar** filtering works correctly
3. **Check API endpoints** return 403 for unauthorized access
4. **Review error handling** in frontend and backend
5. **Set up audit logging** for sensitive operations (optional enhancement)

---

## Support Routes

If you need to test all endpoints for a specific role:

**Fleet Manager Test Endpoints:**
```
GET /api/vehicles - ✅ Works
POST /api/vehicles - ✅ Works
PUT /api/vehicles/:id - ✅ Works
DELETE /api/vehicles/:id - ❌ 403 Forbidden

GET /api/drivers - ✅ Works
POST /api/drivers - ✅ Works
PUT /api/drivers/:id - ✅ Works
PATCH /api/drivers/:id/safety-score - ❌ 403 Forbidden (Safety Officer only)
DELETE /api/drivers/:id - ❌ 403 Forbidden

GET /api/maintenance - ✅ Works
POST /api/maintenance - ✅ Works
PUT /api/maintenance/:id - ✅ Works
DELETE /api/maintenance/:id - ❌ 403 Forbidden

GET /api/trips - ✅ Works
POST /api/trips - ❌ 403 Forbidden (Dispatcher only)
```

**Dispatcher Test Endpoints:**
```
GET /api/trips - ✅ Works
POST /api/trips - ✅ Works
PUT /api/trips/:id - ✅ Works
PATCH /api/trips/:id/status - ✅ Works
POST /api/trips/:id/start - ✅ Works
POST /api/trips/:id/complete - ✅ Works
POST /api/trips/:id/cancel - ✅ Works
DELETE /api/trips/:id - ❌ 403 Forbidden

POST /api/assignments - ✅ Works
PATCH /api/assignments/:id/end - ✅ Works

GET /api/vehicles - ✅ Works
POST /api/vehicles - ❌ 403 Forbidden (Fleet Manager only)
```

---

## What's Been Implemented

✅ Role-based middleware (`requireRole`)
✅ Four specialized user roles with distinct permissions
✅ Frontend sidebar role-based filtering
✅ Route protection via ProtectedRoute component
✅ API endpoint authorization using role hierarchy
✅ Comprehensive error handling
✅ Permission utilities for easy frontend checks

## What You Can Do Now

1. **Run the full application** with RBAC enforced
2. **Test different user roles** to verify permissions
3. **Monitor API responses** for 403 Forbidden errors
4. **Validate sidebar filtering** based on user role
5. **Build audit logs** around the RBAC system (optional)

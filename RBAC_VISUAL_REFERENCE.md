# RBAC System - Visual Reference Guide

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER LOGIN FLOW                               │
└─────────────────────────────────────────────────────────────────┘

1. USER ENTERS CREDENTIALS
   │
   ├─ Email
   └─ Password
      │
      ▼
2. SEND TO /api/auth/login
   │
   ├─ POST request with credentials
   │
   ▼
3. BACKEND VERIFICATION
   │
   ├─ Hash password
   ├─ Compare with DB
   ├─ Fetch user role
   │
   ▼
4. GENERATE JWT TOKEN
   │
   ├─ Payload: { id, email, role }
   ├─ Sign with JWT_SECRET
   ├─ Expiration: 7 days
   │
   ▼
5. RETURN TOKEN & USER DATA
   │
   ├─ Token
   ├─ User ID, Email, Name
   ├─ Role (fleet_manager, dispatcher, etc.)
   │
   ▼
6. FRONTEND STORES DATA
   │
   ├─ localStorage.setItem('token', token)
   ├─ localStorage.setItem('user', JSON.stringify(user))
   │
   ▼
7. FRONTEND FILTERS SIDEBAR
   │
   ├─ Use hasAccess(role, route)
   ├─ Show only allowed menu items
   │
   ▼
8. USER NAVIGATES APPLICATION
   │
   ├─ Protected routes check permissions
   ├─ API calls include Authorization header
   │
   ▼
✅ USER LOGGED IN AND AUTHORIZED
```

---

## Frontend Permission Checking Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND ROUTE REQUEST                              │
└─────────────────────────────────────────────────────────────────┘

USER CLICKS MENU ITEM
│
▼
CHECK LOCALSTORAGE FOR USER & TOKEN
│
├─ NOT FOUND → Redirect to /login
│
└─ FOUND → Continue
   │
   ▼
   COMPONENT RENDERED
   │
   ├─ Wrapped with <ProtectedRoute>
   ├─ Pass requiredRoute prop (e.g., "vehicles")
   │
   ▼
   ProtectedRoute CHECKS PERMISSIONS
   │
   ├─ Get user role from localStorage
   ├─ Call hasAccess(role, requiredRoute)
   │
   ▼
   PERMISSION CHECK
   │
   ├─ YES (hasAccess returns true)
   │  │
   │  └─▶ Render component
   │  
   └─ NO (hasAccess returns false)
      │
      └─▶ Redirect to /dashboard
      
SIDEBAR FILTERING
│
├─ Loop through all nav items
├─ Filter using hasAccess(role, item.route)
├─ Only show items where hasAccess = true
│
▼
RENDERED SIDEBAR WITH FILTERED ITEMS
```

---

## Backend Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND API REQUEST                                 │
└─────────────────────────────────────────────────────────────────┘

CLIENT SENDS REQUEST
│
├─ Method: POST /api/vehicles
├─ Header: Authorization: Bearer <token>
├─ Body: { vehicleNumber, make, model, ... }
│
▼
HIT BACKEND ROUTE HANDLER
│
├─ Example: POST /api/vehicles
│   ├─ Middleware: requireAuth
│   ├─ Middleware: requireRole("fleet_manager")
│   └─ Handler: Create vehicle logic
│
▼
requireAuth MIDDLEWARE
│
├─ Extract token from Authorization header
├─ Verify token signature with JWT_SECRET
├─ Verify token not expired
├─ Fetch user from database
├─ Attach user to request object (req.user)
│
├─ SUCCESS → Continue to next middleware
│
└─ FAILURE → Return 401 Unauthorized
   └─ Response: { "message": "Unauthorized" }
   
▼
requireRole MIDDLEWARE
│
├─ Extract role from req.user
├─ Compare with required role using roleRank
├─ Check if user rank >= required rank
│
├─ SUCCESS (has role) → Call route handler
│
└─ FAILURE (no role) → Return 403 Forbidden
   └─ Response: { "message": "Forbidden" }
   
▼
ROUTE HANDLER EXECUTES
│
├─ Validate request data
├─ Create resource in database
├─ Return 201 Created with data
│
▼
✅ RESPONSE SENT TO CLIENT
  OR
❌ ERROR RESPONSE SENT TO CLIENT
```

---

## Permission Check Decision Tree

```
                         USER REQUEST
                              │
                              ▼
                    ┌─ Is user logged in? ─┐
                    │                       │
                   NO                      YES
                    │                       │
                    ▼                       ▼
              RETURN 401            ┌─ Check role ─┐
            Unauthorized            │               │
                                    ▼               ▼
                            Fleet Manager      Other Role
                                    │               │
                                    ▼               ▼
                        ┌─ Allowed endpoint? ┐
                        │                    │
                       YES                  NO
                        │                    │
                        ▼                    ▼
                    ┌─ Can write data? ─┐ RETURN 403
                    │                   │  Forbidden
                   YES                 NO
                    │                   │
                    ▼                   ▼
                 EXECUTE           RETURN 403
               OPERATION           Forbidden
                    │
                    ▼
             ┌─ Success? ─┐
             │             │
            YES            NO
             │              │
             ▼              ▼
          RETURN       RETURN ERROR
          SUCCESS      (500, 400, etc.)
```

---

## Role-to-Permission Mapping

```
┌────────────────────────────────────────────────────────────┐
│                    ADMIN (Rank 5)                           │
├────────────────────────────────────────────────────────────┤
│ ✅ Full Access to: Vehicles, Trips, Drivers, Maintenance,  │
│    Expenses, Analytics, User Management, System Settings   │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│              FLEET MANAGER (Rank 4)                        │
├────────────────────────────────────────────────────────────┤
│ ✅ Can READ: All resources                                  │
│ ✅ Can CREATE: Vehicles, Drivers, Maintenance              │
│ ✅ Can UPDATE: Vehicles, Drivers, Maintenance              │
│ ✅ Can DELETE: ❌ (Only admin)                             │
│ ✅ Accessible Features: Dashboard, Vehicles, Maintenance,  │
│    Drivers, Analytics                                      │
└────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   DISPATCHER    │
                    │   (Rank 3)      │
                    ├─────────────────┤
                    │ ✅ Can READ:    │
                    │    All          │
                    │ ✅ Can CREATE:  │
                    │    Trips        │
                    │ ✅ Can UPDATE:  │
                    │    Trips        │
                    │ ✅ Features:    │
                    │    Dashboard,   │
                    │    Trips,       │
                    │    Drivers      │
                    └─────────────────┘

                ┌──────────────────────┐
                │  SAFETY OFFICER      │
                │  (Rank 3)            │
                ├──────────────────────┤
                │ ✅ Can READ: Drivers,│
                │    Trips, Analytics  │
                │ ✅ Can UPDATE:       │
                │    Driver safety     │
                │    scores only       │
                │ ✅ Features:         │
                │    Dashboard,        │
                │    Drivers,          │
                │    Analytics, Trips  │
                └──────────────────────┘

            ┌───────────────────────────────┐
            │   FINANCIAL ANALYST           │
            │   (Rank 3)                    │
            ├───────────────────────────────┤
            │ ✅ Can READ: Expenses,        │
            │    Maintenance, Analytics     │
            │ ✅ Can CREATE: Expenses       │
            │ ✅ Can UPDATE: Expenses       │
            │ ✅ Features: Dashboard,       │
            │    Expenses, Maintenance,     │
            │    Analytics                  │
            └───────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│              DRIVER (Rank 1)                               │
├────────────────────────────────────────────────────────────┤
│ ✅ Can READ: Own trips, Assignments                         │
│ ✅ Can UPDATE: Limited (own trip status)                   │
│ ✅ Cannot CREATE/DELETE anything                           │
│ ✅ Features: Dashboard, Trips (own only)                   │
└────────────────────────────────────────────────────────────┘
```

---

## Sidebar Structure by Role

```
┌──────────────────────────┐
│   FLEET MANAGER SIDEBAR  │
├──────────────────────────┤
│ ✅ Command Center        │
│ ✅ Vehicle Registry      │
│ ✅ Trip Dispatcher       │
│ ✅ Maintenance Logs      │
│ ✅ Driver Performance    │
│ ✅ Analytics             │
└──────────────────────────┘

┌──────────────────────────┐
│   DISPATCHER SIDEBAR     │
├──────────────────────────┤
│ ✅ Command Center        │
│ ✅ Trip Dispatcher       │
│ ✅ Vehicle Registry 📖   │
│ ✅ Driver Performance 📖 │
│    📖 = View only        │
└──────────────────────────┘

┌──────────────────────────┐
│  SAFETY OFFICER SIDEBAR  │
├──────────────────────────┤
│ ✅ Command Center        │
│ ✅ Driver Performance    │
│ ✅ Analytics             │
│ ✅ Trip Dispatcher 📖    │
│    📖 = View only        │
└──────────────────────────┘

┌──────────────────────────┐
│ FINANCIAL ANALYST SIDEBAR│
├──────────────────────────┤
│ ✅ Command Center        │
│ ✅ Expense & Fuel        │
│ ✅ Analytics             │
│ ✅ Maintenance Logs 📖   │
│    📖 = View only        │
└──────────────────────────┘

┌──────────────────────────┐
│      ADMIN SIDEBAR       │
├──────────────────────────┤
│ ✅ Command Center        │
│ ✅ Vehicle Registry      │
│ ✅ Trip Dispatcher       │
│ ✅ Maintenance Logs      │
│ ✅ Expense & Fuel        │
│ ✅ Driver Performance    │
│ ✅ Analytics             │
│ ✅ User Management       │
│ ✅ System Settings       │
└──────────────────────────┘

┌──────────────────────────┐
│      DRIVER SIDEBAR      │
├──────────────────────────┤
│ ✅ Command Center        │
│ ✅ Trip Dispatcher 📖    │
│    📖 = Own trips only   │
└──────────────────────────┘
```

---

## API Endpoint Authorization Matrix

```
                 API ENDPOINTS  │ Admin │ F.Mgr │ Disp │ Safety │ Fin.A │ Driver
                ────────────────┼───────┼───────┼──────┼────────┼───────┼───────
GET /api/vehicles              │  ✅   │  ✅   │  ✅  │   ❌   │  ❌   │  ❌
POST /api/vehicles             │  ✅   │  ✅   │  ❌  │   ❌   │  ❌   │  ❌
PUT /api/vehicles/:id          │  ✅   │  ✅   │  ❌  │   ❌   │  ❌   │  ❌
DELETE /api/vehicles/:id       │  ✅   │  ❌   │  ❌  │   ❌   │  ❌   │  ❌
────────────────────────────────┼───────┼───────┼──────┼────────┼───────┼───────
GET /api/trips                 │  ✅   │  ✅   │  ✅  │   ✅   │  ❌   │  ✅
POST /api/trips                │  ✅   │  ✅   │  ✅  │   ❌   │  ❌   │  ❌
PUT /api/trips/:id             │  ✅   │  ✅   │  ✅  │   ❌   │  ❌   │  ❌
PATCH /api/trips/:id/status    │  ✅   │  ✅   │  ✅  │   ❌   │  ❌   │  ❌
DELETE /api/trips/:id          │  ✅   │  ❌   │  ❌  │   ❌   │  ❌   │  ❌
────────────────────────────────┼───────┼───────┼──────┼────────┼───────┼───────
GET /api/drivers               │  ✅   │  ✅   │  ✅  │   ✅   │  ❌   │  ❌
POST /api/drivers              │  ✅   │  ✅   │  ❌  │   ❌   │  ❌   │  ❌
PUT /api/drivers/:id           │  ✅   │  ✅   │  ❌  │   ❌   │  ❌   │  ❌
PATCH /drivers/:id/safety-score│  ✅   │  ❌   │  ❌  │   ✅   │  ❌   │  ❌
DELETE /api/drivers/:id        │  ✅   │  ❌   │  ❌  │   ❌   │  ❌   │  ❌
────────────────────────────────┼───────┼───────┼──────┼────────┼───────┼───────
GET /api/maintenance           │  ✅   │  ✅   │  ❌  │   ❌   │  ✅   │  ❌
POST /api/maintenance          │  ✅   │  ✅   │  ❌  │   ❌   │  ❌   │  ❌
PUT /api/maintenance/:id       │  ✅   │  ✅   │  ❌  │   ❌   │  ❌   │  ❌
DELETE /api/maintenance/:id    │  ✅   │  ❌   │  ❌  │   ❌   │  ❌   │  ❌
────────────────────────────────┼───────┼───────┼──────┼────────┼───────┼───────
GET /api/expenses              │  ✅   │  ✅   │  ✅  │   ❌   │  ✅   │  ❌
POST /api/expenses             │  ✅   │  ✅   │  ✅  │   ❌   │  ✅   │  ❌
PUT /api/expenses/:id          │  ✅   │  ✅   │  ❌  │   ❌   │  ✅   │  ❌
PATCH /api/expenses/:id/status │  ✅   │  ❌   │  ❌  │   ❌   │  ✅   │  ❌
DELETE /api/expenses/:id       │  ✅   │  ❌   │  ❌  │   ❌   │  ❌   │  ❌
────────────────────────────────┼───────┼───────┼──────┼────────┼───────┼───────
GET /api/assignments           │  ✅   │  ✅   │  ✅  │   ❌   │  ❌   │  ❌
POST /api/assignments          │  ✅   │  ✅   │  ✅  │   ❌   │  ❌   │  ❌
PATCH /api/assignments/:id/end │  ✅   │  ✅   │  ✅  │   ❌   │  ❌   │  ❌
DELETE /api/assignments/:id    │  ✅   │  ❌   │  ❌  │   ❌   │  ❌   │  ❌
────────────────────────────────┼───────┼───────┼──────┼────────┼───────┼───────
GET /api/analytics             │  ✅   │  ✅   │  ❌  │   ✅   │  ✅   │  ❌
────────────────────────────────┼───────┼───────┼──────┼────────┼───────┼───────

Legend:
✅ = Allowed       |  ❌ = Forbidden    |  F.Mgr = Fleet Manager  |  Disp = Dispatcher
Safety = Safety Officer  |  Fin.A = Financial Analyst
```

---

## Error Response Flow

```
                    PERMISSION DENIED
                           │
                           ▼
                    ┌─ Is user authenticated? ─┐
                    │                           │
                   NO                          YES
                    │                           │
                    ▼                           ▼
              401 UNAUTHORIZED          403 FORBIDDEN
                    │                           │
                    │                           │
                Response Body:          Response Body:
                {                       {
                  "message":              "message":
                  "Unauthorized"          "Forbidden"
                }                       }
                    │                           │
                    ▼                           ▼
              Frontend Action          Frontend Action
              Redirect to /login       Redirect to /dashboard
              Clear token              Show error toast
              Clear user data
```

---

## Permission Hierarchy Explained

```
Higher Rank = More Permissions

    ADMIN (5)
       ▲
       │ Can access ▼
       │
       ├─ Fleet Manager (4)
       │    Can access ▼
       │
       ├─ Dispatcher (3)
       │    ├─ Safety Officer (3)
       │    └─ Financial Analyst (3)
       │         Can access ▼
       │
       └─ Driver (1)

Note: Roles with same rank (3) have different, non-overlapping permissions
Example: Dispatcher can create trips, Safety Officer cannot
         Financial Analyst can approve expenses, Dispatcher cannot
```

---

## Database Role Storage

```
┌─────────────────────────────────────────┐
│          User Table (PostgreSQL)        │
├──────┬──────────┬──────────┬────────────┤
│ ID   │ Email    │ Password │ Role       │
├──────┼──────────┼──────────┼────────────┤
│ 1    │ fleet@.. │ hash     │fleet_mgrr  │
│ 2    │ disp@..  │ hash     │dispatcher  │
│ 3    │ safe@..  │ hash     │safety_off. │
│ 4    │ fin@...  │ hash     │financial.. │
│ 5    │ admin@.. │ hash     │admin       │
│ 6    │ driver@..│ hash     │driver      │
└──────┴──────────┴──────────┴────────────┘

Role Enum Values (Prisma):
- admin
- fleet_manager
- dispatcher
- safety_officer
- financial_analyst
- driver
```

---

## Code Flow: Request to Response

```
1. CLIENT
   └─ Sends: POST /api/vehicles with Authorization header

2. EXPRESS ROUTER
   └─ Routes: POST /api/vehicles → handlers array

3. MIDDLEWARE: requireAuth
   ├─ Extracts token from header
   ├─ Verifies JWT signature
   ├─ Checks expiration
   ├─ Fetches user from database
   ├─ Attaches user to req object
   ├─ SUCCESS → Continue
   └─ FAILURE → Send 401

4. MIDDLEWARE: requireRole("fleet_manager")
   ├─ Reads role from req.user
   ├─ Compares rank: roleRank["fleet_manager"] >= roleRank[actualRole]
   ├─ SUCCESS → Continue
   └─ FAILURE → Send 403

5. ROUTE HANDLER
   ├─ Validates request body
   ├─ Executes database query
   ├─ Creates resource
   ├─ SUCCESS → Return 201 with data
   └─ FAILURE → Return 400/500 with error

6. RESPONSE SENT
   └─ Client receives result
```

This comprehensive visual reference should help understand the RBAC system flow! 🎯

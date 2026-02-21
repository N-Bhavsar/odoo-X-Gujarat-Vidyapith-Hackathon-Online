# FleetFlow Testing Guide

## 🎯 What's New - All Issues Fixed!

### ✅ Completed Features:
1. **Profile Menu with Logout** - Now available in the top-right corner
2. **View All Button** - Now navigates to Trip Dispatcher page
3. **User Information Display** - Shows user name, email, and role
4. **Proper Session Management** - User data persists across page refreshes

---

## 🚀 Getting Started

### Servers Running:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000

### Database: PostgreSQL (fleetflow)

---

## 👥 Test User Accounts

The system has **3 different user roles** seeded in the database:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@fleetflow.com | FleetFlow@123 | Full system access |
| **Fleet Manager** | manager@fleetflow.com | FleetFlow@123 | Manage vehicles & trips |
| **Dispatcher** | dispatcher@fleetflow.com | FleetFlow@123 | Dispatch & route ops |

### Note on 4th User Type:
The **Driver** role exists in the database but doesn't have a web dashboard login. Drivers are managed through the "Driver Performance" page and assigned to vehicles through the system.

---

## 🧪 Testing Checklist

### 1. Login & Authentication ✅
- [ ] Open http://localhost:8080
- [ ] Should redirect to login page
- [ ] Try logging in with **admin@fleetflow.com** / **FleetFlow@123**
- [ ] Should redirect to dashboard

### 2. Profile Menu & User Info ✅
- [ ] Look at the **top-right corner** of the page
- [ ] You should see a circular avatar with initials (e.g., "FA" for Fleet Admin)
- [ ] **Click on the avatar** to open the profile menu
- [ ] Verify the dropdown shows:
  - User's full name
  - Email address
  - Role (with proper formatting)
  - Profile option
  - Settings option
  - Logout button (in red)

### 3. Logout Functionality ✅
- [ ] From the profile menu, click **"Logout"**
- [ ] Should clear session and redirect to login page
- [ ] Try accessing http://localhost:8080/dashboard directly
- [ ] Should redirect back to login (protected route)

### 4. View All Button on Dashboard ✅
- [ ] Login and navigate to **Command Center** (Dashboard)
- [ ] Scroll to the **"Recent Trips"** section
- [ ] Find the **"View All →"** link in the top-right of that section
- [ ] Click **"View All"**
- [ ] Should navigate to **Trip Dispatcher** page showing all trips

### 5. Dashboard KPIs Display
- [ ] Verify 6 KPI cards are displayed:
  - Active Fleet
  - In Maintenance
  - Utilization Rate
  - Pending Cargo
  - Revenue (MTD)
  - Fuel Cost (MTD)
- [ ] All should show actual data from database

### 6. Recent Trips Table
- [ ] Verify trips table shows:
  - Trip ID (formatted as T-001, T-002, etc.)
  - Vehicle number
  - Driver name
  - Route (Origin → Destination)
  - Status badge (color-coded)
- [ ] Maximum 5 recent trips should display

---

## 🎭 Testing All 3 User Roles

### Admin User Testing
```
Email: admin@fleetflow.com
Password: FleetFlow@123
Expected behavior:
- Full access to all menu items
- Profile shows role as "Admin"
- Can view all data
```

### Fleet Manager Testing
```
Email: manager@fleetflow.com
Password: FleetFlow@123
Expected behavior:
- Access to manage vehicles and trips
- Profile shows role as "Fleet Manager"
- Can create/edit vehicles and trips
```

### Dispatcher Testing
```
Email: dispatcher@fleetflow.com
Password: FleetFlow@123
Expected behavior:
- Focus on trip dispatching
- Profile shows role as "Dispatcher"
- Can assign drivers and routes
```

---

## 📋 Navigation Menu Items

All users should see these menu items in the sidebar:

1. **Command Center** - Dashboard overview
2. **Vehicle Registry** - Vehicle management
3. **Trip Dispatcher** - Trip management
4. **Maintenance Logs** - Vehicle maintenance
5. **Expense & Fuel** - Financial tracking
6. **Driver Performance** - Driver metrics
7. **Analytics** - Charts and reports

---

## 🔍 What to Look For

### Visual Elements:
- ✅ Racing-themed UI with F1-inspired design
- ✅ Dark theme with gradient accents
- ✅ Smooth animations and transitions
- ✅ Responsive layout (test on different screen sizes)
- ✅ Profile avatar with initials in top-right
- ✅ Live status indicator (green pulse)

### Functionality:
- ✅ Sidebar navigation works smoothly
- ✅ Mobile menu toggle (try resizing browser)
- ✅ All links navigate correctly
- ✅ Profile dropdown opens/closes properly
- ✅ Logout clears session completely
- ✅ View All button navigates to trips

---

## 🐛 Known Issues or Limitations

1. **Driver Role**: Drivers don't have dashboard access (by design)
2. **User Creation**: To create the 4th user type manually, use the registration form or create through API
3. **Profile Page**: Currently redirects to dashboard (placeholder)
4. **Settings**: Not yet implemented (placeholder)

---

## 📝 Test Scenarios

### Scenario 1: Complete User Journey
1. Login as admin
2. View dashboard
3. Click "View All" on trips
4. Navigate through different pages
5. Click profile menu
6. Logout
7. Login as different user (manager)
8. Repeat steps

### Scenario 2: Session Persistence
1. Login as any user
2. Refresh the page
3. Profile should still show correct user info
4. Navigate to different pages
5. User info persists

### Scenario 3: Protected Routes
1. Without logging in, try to access:
   - http://localhost:8080/dashboard
   - http://localhost:8080/vehicles
2. Should redirect to login
3. After login, can access all pages

---

## 🎨 UI/UX Features

### Profile Menu Components:
- **Avatar Circle**: Shows user initials
- **Hover Effect**: Scales up slightly
- **Dropdown Menu**: Clean, modern design
- **User Info Section**:
  - Name in bold
  - Email in muted color
  - Role in primary accent color
- **Menu Items**:
  - Profile (with user icon)
  - Settings (with settings icon)
  - Separator line
  - Logout (with logout icon, red text)

### Dashboard Features:
- **KPI Cards**: Racing-inspired design with icons
- **Data Tables**: Clean, readable format
- **Status Badges**: Color-coded pills
- **View All Link**: Hover effect with underline

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors (F12)
2. Verify servers are running on correct ports
3. Check database connection
4. Ensure seed data was loaded

---

## ✨ Summary of Changes Made

### Files Modified:

1. **Layout.tsx**
   - Added profile dropdown menu
   - Integrated user profile API
   - Added logout functionality
   - User initials generation
   - Session management

2. **Dashboard.tsx**
   - Added navigation to "View All" button
   - Links to Trip Dispatcher page

3. **Login.tsx**
   - Store user info in localStorage after login/register
   - Persist user session

4. **authService.ts**
   - Already had logout and getProfile functions

### New Dependencies Used:
- Dropdown Menu components (Radix UI)
- User and LogOut icons (Lucide React)
- React Router navigation hooks

---

## 🎯 Testing Priority

**High Priority:**
1. ✅ Login/Logout functionality
2. ✅ Profile menu display
3. ✅ User information accuracy
4. ✅ View All button navigation

**Medium Priority:**
5. Dashboard data display
6. Navigation between pages
7. Mobile responsiveness

**Low Priority:**
8. UI polish and animations
9. Error handling
10. Edge cases

---

**Happy Testing! 🏁**

Need to test more features? Just ask!

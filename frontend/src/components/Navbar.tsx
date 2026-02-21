import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/store'
import { logout } from '../store/slices/authSlice'
import { DirectionsCar, AccountCircle } from '@mui/icons-material'

const Navbar = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logout())
    handleClose()
    navigate('/login')
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <DirectionsCar sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          FleetFlow
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/vehicles">
            Vehicles
          </Button>
          <Button color="inherit" component={Link} to="/trips">
            Trips
          </Button>
          <Button color="inherit" component={Link} to="/drivers">
            Drivers
          </Button>
          <Button color="inherit" component={Link} to="/maintenance">
            Maintenance
          </Button>
          <Button color="inherit" component={Link} to="/expenses">
            Expenses
          </Button>
          <Button color="inherit" component={Link} to="/analytics">
            Analytics
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            {user?.firstName} {user?.lastName}
          </Typography>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                Role: {user?.role}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

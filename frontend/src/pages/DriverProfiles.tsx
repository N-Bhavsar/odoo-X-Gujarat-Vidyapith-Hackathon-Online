import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Box,
  Typography,
  Grid,
  Alert
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { getAllDrivers, getExpiringLicenses, validateCompatibility } from '../services/driverService'
import {
  fetchDriversStart,
  fetchDriversSuccess,
  fetchDriversError,
  clearError
} from '../store/slices/driverSlice'
import { RootState } from '../store/store'

export interface Driver {
  id: number
  userId: number
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  licenseClass: string
  licenseExpiryDate: string
  status: 'active' | 'inactive' | 'suspended' | 'on_duty' | 'off_duty' | 'on_trip'
  safetyScore: number
  totalTrips: number
  completedTrips: number
  cancelledTrips: number
  isActive: boolean
  createdAt: string
}

const DriverProfiles: React.FC = () => {
  const dispatch = useDispatch()
  const { drivers, loading, error } = useSelector((state: RootState) => state.drivers)
  const [openDialog, setOpenDialog] = useState(false)
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false)
  const [openCompatibilityDialog, setOpenCompatibilityDialog] = useState(false)
  const [expiringLicenses, setExpiringLicenses] = useState<Driver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [filters, setFilters] = useState({ status: '', search: '' })
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseClass: 'B',
    licenseExpiryDate: '',
    status: 'active' as const
  })
  const [assignmentData, setAssignmentData] = useState({
    vehicleId: ''
  })
  const [compatibilityCheckData, setCompatibilityCheckData] = useState({
    driverId: '',
    vehicleId: ''
  })

  useEffect(() => {
    fetchDriversData()
    fetchExpiringLicenses()
  }, [filters])

  const fetchDriversData = async () => {
    try {
      dispatch(fetchDriversStart())
      const data = await getAllDrivers(1, 10, filters)
      dispatch(fetchDriversSuccess({ drivers: data.drivers, total: data.pagination.total }))
    } catch (err: any) {
      dispatch(fetchDriversError(err.response?.data?.message || 'Failed to fetch drivers'))
    }
  }

  const fetchExpiringLicenses = async () => {
    try {
      const response = await getExpiringLicenses(30)
      setExpiringLicenses(response.drivers)
    } catch (err) {
      console.error('Error fetching expiring licenses:', err)
    }
  }

  const handleOpenDialog = (driver?: Driver) => {
    if (driver) {
      setSelectedDriver(driver)
      setFormData({
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        licenseClass: driver.licenseClass as any,
        licenseExpiryDate: driver.licenseExpiryDate.split('T')[0],
        status: driver.status as any
      })
    } else {
      setSelectedDriver(null)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseClass: 'B',
        licenseExpiryDate: '',
        status: 'active'
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedDriver(null)
  }

  const handleOpenAssignmentDialog = (driver: Driver) => {
    setSelectedDriver(driver)
    setAssignmentData({ vehicleId: '' })
    setOpenAssignmentDialog(true)
  }

  const handleOpenCompatibilityDialog = () => {
    setOpenCompatibilityDialog(true)
  }

  const handleCloseCompatibilityDialog = () => {
    setOpenCompatibilityDialog(false)
    setCompatibilityCheckData({ driverId: '', vehicleId: '' })
    setCompatibilityResult(null)
  }

  const handleCheckCompatibility = async () => {
    if (!compatibilityCheckData.driverId || !compatibilityCheckData.vehicleId) {
      return
    }

    try {
      const result = await validateCompatibility(
        Number(compatibilityCheckData.driverId),
        Number(compatibilityCheckData.vehicleId)
      )
      setCompatibilityResult(result)
    } catch (err: any) {
      setCompatibilityResult({
        isCompatible: false,
        issues: [
          {
            type: 'ERROR',
            message: err.response?.data?.message || 'Error checking compatibility'
          }
        ]
      })
    }
  }

  const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'active':
      case 'on_duty':
        return 'success'
      case 'on_trip':
        return 'warning'
      case 'suspended':
      case 'inactive':
        return 'error'
      default:
        return 'default'
    }
  }

  const getLicenseClassLabel = (licenseClass: string): string => {
    const classLabels: { [key: string]: string } = {
      'A': 'Motorcycle',
      'B': 'Car',
      'C': 'Truck',
      'D': 'Bus',
      'BE': 'Car + Trailer',
      'CE': 'Truck + Trailer'
    }
    return classLabels[licenseClass] || licenseClass
  }

  const getCompletionRate = (driver: Driver): number => {
    if (driver.totalTrips === 0) return 0
    return Math.round((driver.completedTrips / driver.totalTrips) * 100)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Driver Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage drivers, track licenses, and assign vehicles
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Expiring Licenses Alert */}
      {expiringLicenses.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            ⚠ {expiringLicenses.length} driver(s) with licenses expiring within 30 days:
          </Typography>
          {expiringLicenses.map(driver => (
            <Typography key={driver.id} variant="body2">
              • {driver.firstName} {driver.lastName} - Expires: {new Date(driver.licenseExpiryDate).toLocaleDateString()}
            </Typography>
          ))}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Search Drivers"
            placeholder="Search by name, email, or license"
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Add Driver
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, p: 2, mb: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpenCompatibilityDialog}
          >
            Check Compatibility
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>License</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Expiry</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Safety Score</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trips</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      No drivers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map(driver => {
                  const expiryDate = new Date(driver.licenseExpiryDate)
                  const isExpired = expiryDate < new Date()
                  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

                  return (
                    <TableRow key={driver.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {driver.firstName} {driver.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {driver.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{driver.licenseNumber}</Typography>
                          <Chip
                            label={getLicenseClassLabel(driver.licenseClass)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {expiryDate.toLocaleDateString()}
                          </Typography>
                          {isExpired ? (
                            <Chip label="EXPIRED" size="small" color="error" />
                          ) : daysUntilExpiry <= 30 ? (
                            <Chip label={`${daysUntilExpiry}d left`} size="small" color="warning" />
                          ) : (
                            <Chip label="Valid" size="small" color="success" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={driver.status.toUpperCase()}
                          size="small"
                          color={getStatusColor(driver.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {driver.safetyScore.toFixed(1)}/5.0
                          </Typography>
                          <Box
                            sx={{
                              width: 40,
                              height: 4,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 2,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: `${(driver.safetyScore / 5.0) * 100}%`,
                                height: '100%',
                                backgroundColor: driver.safetyScore >= 4 ? '#4caf50' : driver.safetyScore >= 3 ? '#ff9800' : '#f44336',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption">
                            {driver.completedTrips}/{driver.totalTrips}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            ({getCompletionRate(driver)}%)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenDialog(driver)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenAssignmentDialog(driver)}
                          >
                            Assign
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Driver Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDriver ? 'Edit Driver' : 'Add New Driver'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Number"
                value={formData.licenseNumber}
                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>License Class</InputLabel>
                <Select
                  value={formData.licenseClass}
                  label="License Class"
                  onChange={e => setFormData({ ...formData, licenseClass: e.target.value })}
                >
                  <MenuItem value="A">A - Motorcycle</MenuItem>
                  <MenuItem value="B">B - Car</MenuItem>
                  <MenuItem value="C">C - Truck</MenuItem>
                  <MenuItem value="D">D - Bus</MenuItem>
                  <MenuItem value="BE">BE - Car + Trailer</MenuItem>
                  <MenuItem value="CE">CE - Truck + Trailer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="License Expiry Date"
                InputLabelProps={{ shrink: true }}
                value={formData.licenseExpiryDate}
                onChange={e => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary">
            {selectedDriver ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={openAssignmentDialog} onClose={() => setOpenAssignmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Vehicle to {selectedDriver?.firstName} {selectedDriver?.lastName}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Vehicle ID"
            value={assignmentData.vehicleId}
            onChange={e => setAssignmentData({ ...assignmentData, vehicleId: e.target.value })}
            helperText="Enter the vehicle ID to assign"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignmentDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compatibility Check Dialog */}
      <Dialog open={openCompatibilityDialog} onClose={handleCloseCompatibilityDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Check Driver-Vehicle Compatibility</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Driver ID"
                value={compatibilityCheckData.driverId}
                onChange={e => setCompatibilityCheckData({ ...compatibilityCheckData, driverId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Vehicle ID"
                value={compatibilityCheckData.vehicleId}
                onChange={e => setCompatibilityCheckData({ ...compatibilityCheckData, vehicleId: e.target.value })}
              />
            </Grid>
          </Grid>

          {compatibilityResult && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {compatibilityResult.driverName} & {compatibilityResult.vehicleName}
              </Typography>
              {compatibilityResult.isCompatible ? (
                <Alert severity="success">✓ Compatible - Driver can be assigned to this vehicle</Alert>
              ) : (
                <Alert severity="error">✗ Not Compatible</Alert>
              )}

              {compatibilityResult.issues && compatibilityResult.issues.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    Issues:
                  </Typography>
                  {compatibilityResult.issues.map((issue: any, idx: number) => (
                    <Typography key={idx} variant="caption" display="block" sx={{ mt: 0.5 }}>
                      • {issue.message}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompatibilityDialog}>Close</Button>
          <Button variant="contained" color="primary" onClick={handleCheckCompatibility}>
            Check Compatibility
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default DriverProfiles

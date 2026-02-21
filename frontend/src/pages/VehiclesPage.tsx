import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Toolbar,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../store/store'
import { fetchVehicles, deleteVehicle, setFilters, clearError } from '../store/slices/vehicleSlice'
import { VehicleStatus, VehicleType, Vehicle } from '../services/vehicleService'
import { useNavigate } from 'react-router-dom'

const VehiclesPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { vehicles, loading, error, pagination, filters } = useAppSelector((state) => state.vehicles)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<VehicleType | ''>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null)

  useEffect(() => {
    dispatch(fetchVehicles(filters))
  }, [dispatch, filters])

  const handleSearch = () => {
    dispatch(setFilters({ 
      ...filters, 
      search: searchTerm,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      page: 1 
    }))
  }

  const handlePageChange = (_event: unknown, newPage: number) => {
    dispatch(setFilters({ ...filters, page: newPage + 1 }))
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ ...filters, limit: parseInt(event.target.value, 10), page: 1 }))
  }

  const handleRefresh = () => {
    dispatch(fetchVehicles(filters))
  }

  const handleDeleteClick = (id: number) => {
    setVehicleToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (vehicleToDelete) {
      await dispatch(deleteVehicle(vehicleToDelete))
      setDeleteDialogOpen(false)
      setVehicleToDelete(null)
      dispatch(fetchVehicles(filters))
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setVehicleToDelete(null)
  }

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.ACTIVE:
        return 'success'
      case VehicleStatus.MAINTENANCE:
        return 'warning'
      case VehicleStatus.INACTIVE:
        return 'default'
      case VehicleStatus.RETIRED:
        return 'error'
      default:
        return 'default'
    }
  }

  const getTypeLabel = (type: VehicleType | VehicleStatus) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Vehicles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vehicles/new')}
        >
          Add Vehicle
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 2 }}>
          <TextField
            size="small"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | '')}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Status</MenuItem>
            {Object.values(VehicleStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {getTypeLabel(status)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as VehicleType | '')}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Types</MenuItem>
            {Object.values(VehicleType).map((type) => (
              <MenuItem key={type} value={type}>
                {getTypeLabel(type)}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />}>
            Search
          </Button>
          <IconButton onClick={handleRefresh} title="Refresh">
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="60">No</TableCell>
                  <TableCell>Plate</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Odometer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                        No vehicles found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle: Vehicle, index: number) => (
                    <TableRow key={vehicle.id} hover>
                      <TableCell>
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {vehicle.registrationNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {vehicle.make} {vehicle.model}
                      </TableCell>
                      <TableCell>
                        <Chip label={getTypeLabel(vehicle.type)} size="small" />
                      </TableCell>
                      <TableCell>{vehicle.seatingCapacity || 'N/A'}</TableCell>
                      <TableCell>{vehicle.currentMileage.toLocaleString()} km</TableCell>
                      <TableCell>
                        <Chip
                          label={getTypeLabel(vehicle.status)}
                          color={getStatusColor(vehicle.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                          title="View Details"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(vehicle.id)}
                          title="Delete"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pagination.total}
              rowsPerPage={pagination.limit}
              page={pagination.page - 1}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        )}
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this vehicle? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default VehiclesPage

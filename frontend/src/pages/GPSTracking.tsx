import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  GpsFixed as GpsIcon,
  Speed as SpeedIcon,
  AccessTime as TimeIcon,
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  Timeline as RouteIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../store/store'
import {
  fetchAllVehiclesLiveStatus,
  fetchLocationHistory,
  fetchSpeedingEvents,
  fetchIdleSessions,
  setActiveVehicleId
} from '../store/slices/gpsSlice'
import { gpsService } from '../services/gpsService'
import LiveMap from '../components/LiveMap'

const GPSTracking: React.FC = () => {
  const dispatch = useAppDispatch()
  const { liveVehicles, locationHistory, speedingEvents, idleSessions, activeVehicleId, loading, error } =
    useAppSelector((state) => state.gps)

  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'analytics'>('live')
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [simulateInterval, setSimulateInterval] = useState<ReturnType<typeof setInterval> | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    dispatch(fetchAllVehiclesLiveStatus())
    return () => {
      gpsService.disconnect()
    }
  }, [dispatch])

  const startRealTime = useCallback(() => {
    setIsRealTimeEnabled(true)
    gpsService.initializeSocket()

    if (selectedVehicleId) {
      gpsService.joinVehicleTracking(selectedVehicleId)
    } else {
      liveVehicles.forEach((v) => gpsService.joinVehicleTracking(v.id))
    }

    // Auto-refresh live status every 10 seconds
    refreshIntervalRef.current = setInterval(() => {
      dispatch(fetchAllVehiclesLiveStatus())
    }, 10000)
  }, [dispatch, selectedVehicleId, liveVehicles])

  const stopRealTime = useCallback(() => {
    setIsRealTimeEnabled(false)
    gpsService.disconnect()
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }, [])

  // GPS simulation for demo purposes
  const startSimulation = useCallback(() => {
    if (!selectedVehicleId) return

    setIsSimulating(true)
    let lat = 19.076 + (Math.random() - 0.5) * 0.1
    let lon = 72.877 + (Math.random() - 0.5) * 0.1

    const interval = setInterval(async () => {
      lat += (Math.random() - 0.5) * 0.005
      lon += (Math.random() - 0.5) * 0.005

      const locationData = {
        vehicleId: selectedVehicleId,
        latitude: parseFloat(lat.toFixed(8)),
        longitude: parseFloat(lon.toFixed(8)),
        speed: Math.random() * 80 + 20,
        heading: Math.random() * 360,
        accuracy: Math.random() * 10 + 2,
        source: 'mobile_app' as const
      }

      gpsService.emitLocationUpdate(locationData)
      dispatch(fetchAllVehiclesLiveStatus())
    }, 2000)

    setSimulateInterval(interval)
  }, [dispatch, selectedVehicleId])

  const stopSimulation = useCallback(() => {
    if (simulateInterval) {
      clearInterval(simulateInterval)
      setSimulateInterval(null)
    }
    setIsSimulating(false)
  }, [simulateInterval])

  const handleVehicleSelect = useCallback(
    (vehicleId: number | null) => {
      setSelectedVehicleId(vehicleId)
      dispatch(setActiveVehicleId(vehicleId))

      if (vehicleId) {
        dispatch(fetchLocationHistory({ vehicleId, limit: 200 }))
        dispatch(fetchSpeedingEvents({ vehicleId }))
        dispatch(fetchIdleSessions({ vehicleId }))
      }
    },
    [dispatch]
  )

  // Aggregate all current locations from live vehicles
  const allCurrentLocations = liveVehicles
    .filter((v) => v.currentLocation)
    .map((v) => v.currentLocation!)

  const displayLocations =
    activeTab === 'history' && locationHistory.length > 0
      ? locationHistory
      : allCurrentLocations

  const onlineVehicles = liveVehicles.filter((v) => v.currentLocation).length
  const movingVehicles = liveVehicles.filter(
    (v) => v.currentLocation && parseFloat(v.currentLocation.speed?.toString() || '0') > 5
  ).length

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GpsIcon color="primary" sx={{ fontSize: 36 }} />
            GPS Tracking
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Real-time vehicle monitoring and location analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {isRealTimeEnabled ? (
            <Chip
              icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#51cf66', animation: 'pulse 1.5s infinite' }} />}
              label="Live"
              size="small"
              color="success"
              variant="outlined"
            />
          ) : null}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            size="small"
            onClick={() => dispatch(fetchAllVehiclesLiveStatus())}
          >
            Refresh
          </Button>
          {!isRealTimeEnabled ? (
            <Button variant="contained" startIcon={<PlayIcon />} color="success" onClick={startRealTime} size="small">
              Start Live
            </Button>
          ) : (
            <Button variant="outlined" startIcon={<StopIcon />} color="error" onClick={stopRealTime} size="small">
              Stop Live
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <CarIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">{liveVehicles.length}</Typography>
              <Typography variant="caption" color="text.secondary">Total Vehicles</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <GpsIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">{onlineVehicles}</Typography>
              <Typography variant="caption" color="text.secondary">With GPS Data</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <SpeedIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">{movingVehicles}</Typography>
              <Typography variant="caption" color="text.secondary">In Motion</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <WarningIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {speedingEvents?.totalViolations || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">Speed Violations</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={2}>
        {/* Left Panel */}
        <Grid item xs={12} md={3}>
          {/* Vehicle Selector */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Track Vehicle
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Select Vehicle</InputLabel>
                <Select
                  value={selectedVehicleId || ''}
                  label="Select Vehicle"
                  onChange={(e) => handleVehicleSelect(e.target.value ? Number(e.target.value) : null)}
                >
                  <MenuItem value="">All Vehicles</MenuItem>
                  {liveVehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber} ({vehicle.vehicleType})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Simulation Controls */}
              <Divider sx={{ mb: 2 }} />
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Demo Mode
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!isSimulating ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PlayIcon />}
                    onClick={startSimulation}
                    disabled={!selectedVehicleId}
                    fullWidth
                  >
                    Simulate GPS
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<PauseIcon />}
                    onClick={stopSimulation}
                    fullWidth
                  >
                    Stop Sim
                  </Button>
                )}
              </Box>
              {!selectedVehicleId && (
                <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
                  Select a vehicle to simulate
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Vehicle List */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Vehicle Status
              </Typography>
              {loading && <LinearProgress sx={{ mb: 1 }} />}
              <List dense disablePadding>
                {liveVehicles.map((vehicle) => {
                  const hasGPS = !!vehicle.currentLocation
                  const speed = vehicle.currentLocation?.speed
                    ? parseFloat(vehicle.currentLocation.speed.toString())
                    : 0

                  return (
                    <ListItem
                      key={vehicle.id}
                      button
                      onClick={() => handleVehicleSelect(vehicle.id)}
                      selected={selectedVehicleId === vehicle.id}
                      sx={{ borderRadius: 1, mb: 0.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: hasGPS ? (speed > 5 ? '#51cf66' : '#ffd43b') : '#adb5bd'
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={vehicle.registrationNumber}
                        secondary={
                          hasGPS
                            ? `${Math.round(speed)} km/h • ${vehicle.vehicleType}`
                            : 'No GPS signal'
                        }
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      {hasGPS && (
                        <Chip
                          label={speed > 5 ? 'Moving' : 'Idle'}
                          size="small"
                          color={speed > 5 ? 'success' : 'default'}
                          sx={{ ml: 0.5, height: 18, fontSize: '0.6rem' }}
                        />
                      )}
                    </ListItem>
                  )
                })}
                {liveVehicles.length === 0 && !loading && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No vehicles found
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Center - Map */}
        <Grid item xs={12} md={6}>
          {/* Tab Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {(['live', 'history', 'analytics'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setActiveTab(tab)}
                sx={{ textTransform: 'capitalize' }}
              >
                {tab}
              </Button>
            ))}
          </Box>

          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <LiveMap
                locations={selectedVehicleId ? displayLocations.filter((l) => l.vehicleId === selectedVehicleId) : displayLocations}
                selectedVehicleId={selectedVehicleId}
                showRoute={activeTab === 'history'}
                height={440}
              />
            </CardContent>
          </Card>

          {/* Location History Table for History Tab */}
          {activeTab === 'history' && locationHistory.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Location History ({locationHistory.length} points)
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 240 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Coordinates</TableCell>
                        <TableCell>Speed</TableCell>
                        <TableCell>Accuracy</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {locationHistory.slice(0, 50).map((loc) => (
                        <TableRow key={loc.id}>
                          <TableCell>
                            {new Date(loc.timestamp).toLocaleTimeString()}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {parseFloat(loc.latitude.toString()).toFixed(5)},&nbsp;
                            {parseFloat(loc.longitude.toString()).toFixed(5)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${Math.round(parseFloat(loc.speed?.toString() || '0'))} km/h`}
                              size="small"
                              color={parseFloat(loc.speed?.toString() || '0') > 80 ? 'error' : 'default'}
                              sx={{ height: 18, fontSize: '0.6rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            {loc.accuracy ? `±${parseFloat(loc.accuracy.toString()).toFixed(0)}m` : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Panel - Analytics */}
        <Grid item xs={12} md={3}>
          {/* Speed Violations */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WarningIcon fontSize="small" color="error" />
                Speeding Events
              </Typography>
              {speedingEvents ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Speed Limit</Typography>
                    <Typography variant="caption" fontWeight="bold">{speedingEvents.speedLimit} km/h</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Violations</Typography>
                    <Chip label={speedingEvents.totalViolations} size="small" color={speedingEvents.totalViolations > 0 ? 'error' : 'success'} sx={{ height: 18, fontSize: '0.65rem' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Avg Excess</Typography>
                    <Typography variant="caption" color="error.main">{speedingEvents.averageExcessSpeed.toFixed(1)} km/h</Typography>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
                  {selectedVehicleId ? 'No violations' : 'Select a vehicle'}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Idle Sessions */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PauseIcon fontSize="small" color="warning" />
                Idle Sessions
              </Typography>
              {idleSessions.length > 0 ? (
                <List dense disablePadding>
                  {idleSessions.slice(0, 5).map((session, idx) => (
                    <ListItem key={idx} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemText
                        primary={`Session ${idx + 1}: ${Math.floor(session.duration / 60000)}m`}
                        secondary={new Date(session.startTime).toLocaleTimeString()}
                        primaryTypographyProps={{ variant: 'caption', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                  {idleSessions.length > 5 && (
                    <Typography variant="caption" color="text.secondary">
                      +{idleSessions.length - 5} more sessions
                    </Typography>
                  )}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
                  {selectedVehicleId ? 'No idle sessions' : 'Select a vehicle'}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Current Location Stats */}
          {selectedVehicleId && allCurrentLocations.find((l) => l.vehicleId === selectedVehicleId) && (
            <Card>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationIcon fontSize="small" color="primary" />
                  Current Location
                </Typography>
                {(() => {
                  const loc = allCurrentLocations.find((l) => l.vehicleId === selectedVehicleId)
                  if (!loc) return null
                  return (
                    <>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Coordinates</Typography>
                        <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: '0.75rem' }}>
                          {parseFloat(loc.latitude.toString()).toFixed(6)},
                          {parseFloat(loc.longitude.toString()).toFixed(6)}
                        </Typography>
                      </Box>
                      {loc.speed !== undefined && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">Speed</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(parseFloat(loc.speed.toString()) / 120 * 100, 100)}
                              color={parseFloat(loc.speed.toString()) > 80 ? 'error' : 'primary'}
                              sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" fontWeight="bold">
                              {Math.round(parseFloat(loc.speed.toString()))} km/h
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Last Update</Typography>
                        <Typography variant="body2">
                          {new Date(loc.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      {loc.accuracy && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Accuracy</Typography>
                          <Typography variant="body2">±{parseFloat(loc.accuracy.toString()).toFixed(0)} meters</Typography>
                        </Box>
                      )}
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Inline CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </Box>
  )
}

export default GPSTracking

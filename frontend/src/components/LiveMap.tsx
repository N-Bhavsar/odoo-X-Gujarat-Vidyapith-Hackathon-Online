import React, { useEffect, useMemo, useRef } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material'
import { GPSLocation } from '../store/slices/gpsSlice'

interface MapProps {
  locations: GPSLocation[]
  selectedVehicleId?: number | null
  showRoute?: boolean
  height?: string | number
}

// Canvas-based lightweight map (no API key required, pure SVG/Canvas)
const LiveMap: React.FC<MapProps> = ({
  locations,
  selectedVehicleId,
  showRoute = false,
  height = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const boundingBox = useMemo(() => {
    if (locations.length === 0)
      return { minLat: -10, maxLat: 10, minLon: -10, maxLon: 10, centerLat: 0, centerLon: 0 }

    const lats = locations.map((l) => parseFloat(l.latitude.toString()))
    const lons = locations.map((l) => parseFloat(l.longitude.toString()))
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)
    const centerLat = (minLat + maxLat) / 2
    const centerLon = (minLon + maxLon) / 2

    return { minLat, maxLat, minLon, maxLon, centerLat, centerLon }
  }, [locations])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const padding = 40

    const latRange = Math.max(boundingBox.maxLat - boundingBox.minLat, 0.01)
    const lonRange = Math.max(boundingBox.maxLon - boundingBox.minLon, 0.01)

    const toX = (lon: number) =>
      padding + ((lon - boundingBox.minLon) / lonRange) * (W - padding * 2)
    const toY = (lat: number) =>
      H - padding - ((lat - boundingBox.minLat) / latRange) * (H - padding * 2)

    // Clear canvas
    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, W, H)

    // Grid lines
    ctx.strokeStyle = '#2a2a4e'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i / 5) * (W - padding * 2)
      const y = padding + (i / 5) * (H - padding * 2)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, H - padding)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(W - padding, y)
      ctx.stroke()
    }

    // Group locations by vehicleId
    const vehicleGroups = locations.reduce(
      (acc, loc) => {
        const vid = loc.vehicleId
        if (!acc[vid]) acc[vid] = []
        acc[vid].push(loc)
        return acc
      },
      {} as Record<number, GPSLocation[]>
    )

    const vehicleColors: Record<number, string> = {}
    const colors = ['#00d4ff', '#ff6b6b', '#51cf66', '#ffd43b', '#cc5de8', '#ff922b']
    Object.keys(vehicleGroups).forEach((id, idx) => {
      vehicleColors[parseInt(id)] = colors[idx % colors.length]
    })

    // Draw routes
    if (showRoute || Object.keys(vehicleGroups).length === 1) {
      Object.entries(vehicleGroups).forEach(([vehicleId, locs]) => {
        const sorted = [...locs].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        if (sorted.length < 2) return

        const color = vehicleColors[parseInt(vehicleId)]
        ctx.strokeStyle = color + '60'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 3])
        ctx.beginPath()

        sorted.forEach((loc, i) => {
          const x = toX(parseFloat(loc.longitude.toString()))
          const y = toY(parseFloat(loc.latitude.toString()))
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })

        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    // Draw vehicle points
    Object.entries(vehicleGroups).forEach(([vehicleId, locs]) => {
      const id = parseInt(vehicleId)
      const isSelected = selectedVehicleId === id
      const color = vehicleColors[id]

      const sorted = [...locs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      // Draw old points
      sorted.slice(1).forEach((loc) => {
        const x = toX(parseFloat(loc.longitude.toString()))
        const y = toY(parseFloat(loc.latitude.toString()))
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = color + '50'
        ctx.fill()
      })

      // Draw latest position
      const latest = sorted[0]
      if (!latest) return

      const x = toX(parseFloat(latest.longitude.toString()))
      const y = toY(parseFloat(latest.latitude.toString()))

      // Glow effect for selected
      if (isSelected) {
        ctx.beginPath()
        ctx.arc(x, y, 18, 0, Math.PI * 2)
        ctx.fillStyle = color + '20'
        ctx.fill()
      }

      // Outer ring
      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 12 : 8, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Inner white dot
      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 5 : 3, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()

      // Vehicle ID label
      ctx.fillStyle = '#ffffff'
      ctx.font = `${isSelected ? 'bold ' : ''}11px monospace`
      ctx.shadowColor = '#000'
      ctx.shadowBlur = 4
      ctx.fillText(`V${vehicleId}`, x + 14, y + 4)
      ctx.shadowBlur = 0

      // Speed indicator
      if (latest.speed !== undefined && latest.speed !== null) {
        ctx.fillStyle = color
        ctx.font = '9px monospace'
        ctx.fillText(`${Math.round(parseFloat(latest.speed.toString()))} km/h`, x + 14, y + 16)
      }
    })

    // Legend
    let legendY = padding
    Object.entries(vehicleGroups).forEach(([vehicleId, locs]) => {
      const color = vehicleColors[parseInt(vehicleId)]
      ctx.beginPath()
      ctx.arc(10, legendY, 5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = '10px monospace'
      ctx.fillText(`V${vehicleId} (${locs.length} pts)`, 20, legendY + 4)
      legendY += 18
    })
  }, [locations, selectedVehicleId, showRoute, boundingBox])

  if (locations.length === 0) {
    return (
      <Box
        sx={{
          height,
          bgcolor: '#1a1a2e',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)',
          gap: 2
        }}
      >
        <Box sx={{ fontSize: 48 }}>📡</Box>
        <Typography variant="body1" color="text.secondary">
          No GPS data available
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Start a trip to see live tracking
        </Typography>
      </Box>
    )
  }

  const sortedLocations = [...locations].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  const latestLoc = sortedLocations[0]
  const lat = parseFloat(latestLoc.latitude.toString())
  const lon = parseFloat(latestLoc.longitude.toString())

  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={typeof height === 'number' ? height : 400}
        style={{ width: '100%', height: typeof height === 'number' ? height : 400, display: 'block' }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap'
        }}
      >
        <Tooltip title="Latest coordinates">
          <Chip
            label={`${lat.toFixed(4)}, ${lon.toFixed(4)}`}
            size="small"
            sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: '#00d4ff', fontSize: '0.65rem' }}
          />
        </Tooltip>
        {latestLoc.speed !== undefined && (
          <Chip
            label={`${Math.round(parseFloat(latestLoc.speed.toString()))} km/h`}
            size="small"
            color={parseFloat(latestLoc.speed.toString()) > 80 ? 'error' : 'success'}
            sx={{ fontSize: '0.65rem' }}
          />
        )}
      </Box>
    </Box>
  )
}

export default LiveMap

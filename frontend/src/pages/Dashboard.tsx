import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../store/store'
import { fetchProfile } from '../store/slices/authSlice'
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material'
import {
  Search,
  Add
} from '@mui/icons-material'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state: any) => state.auth)

  useEffect(() => {
    if (!user) {
      dispatch(fetchProfile())
    }
  }, [dispatch, user])

  const statsCards = [
    { title: 'Active Fleet', value: '220', color: '#4caf50' },
    { title: 'Maintenance Alert', value: '180', color: '#4caf50' },
    { title: 'Pending Cargo', value: '20', color: '#4caf50' }
  ]

  const tripData = [
    { trip: '1', vehicle: 'xxxxxxxxxxxxxx', driver: 'John Doe', status: 'On Trip' }
  ]

  return (
    <Box>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Search Bar and Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <TextField
            placeholder="Search bar ......"
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Button variant="outlined" size="small">Group by</Button>
          <Button variant="outlined" size="small">Filter</Button>
          <Button variant="outlined" size="small">Sort by...</Button>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
          <Button variant="outlined" startIcon={<Add />}>New Trip</Button>
          <Button variant="outlined" startIcon={<Add />}>New Vehicle</Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ bgcolor: '#1e1e1e', border: '1px solid #333' }}>
                <CardContent>
                  <Typography color={card.color} variant="h6" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color={card.color}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Data Table */}
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e', border: '1px solid #333' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Trip</TableCell>
                <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Vehicle</TableCell>
                <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Driver</TableCell>
                <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tripData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: '#fff' }}>{row.trip}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{row.vehicle}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{row.driver}</TableCell>
                  <TableCell>
                    <Chip label={row.status} sx={{ bgcolor: '#ff5722', color: '#fff' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  )
}

export default Dashboard

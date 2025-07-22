import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CalendarToday, Group, AttachMoney } from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';

const BookingForm = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: null,
    checkOut: null,
    guests: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`/api/properties/${propertyId}`);
        setProperty(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load property details');
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    return dayjs(bookingData.checkOut).diff(dayjs(bookingData.checkIn), 'day');
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * property?.price || 0;
  };

  const handleDateChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGuestChange = (event) => {
    setBookingData(prev => ({
      ...prev,
      guests: event.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (dayjs(bookingData.checkIn).isBefore(dayjs(), 'day')) {
      setError('Check-in date cannot be in the past');
      return;
    }

    if (dayjs(bookingData.checkOut).isBefore(dayjs(bookingData.checkIn))) {
      setError('Check-out date must be after check-in date');
      return;
    }

    if (bookingData.guests > property.maxGuests) {
      setError(`Maximum ${property.maxGuests} guests allowed`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('/api/bookings', {
        propertyId,
        checkIn: bookingData.checkIn.format('YYYY-MM-DD'),
        checkOut: bookingData.checkOut.format('YYYY-MM-DD'),
        guests: bookingData.guests,
        totalPrice: calculateTotal(),
      });

      navigate(`/payment/${response.data.id}`);
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error && !submitting) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Property not found</Alert>
      </Container>
    );
  }

  const nights = calculateNights();
  const total = calculateTotal();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book Your Stay
      </Typography>

      <Grid container spacing={4}>
        {/* Property Summary */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {property.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {property.location}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                ${property.price}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                /night
              </Typography>
            </Box>
          </Paper>

          {/* Booking Form */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Dates & Guests
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Check-in"
                    value={bookingData.checkIn}
                    onChange={(value) => handleDateChange('checkIn', value)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Check-out"
                    value={bookingData.checkOut}
                    onChange={(value) => handleDateChange('checkOut', value)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={bookingData.checkIn ? dayjs(bookingData.checkIn).add(1, 'day') : dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Number of Guests</InputLabel>
                    <Select
                      value={bookingData.guests}
                      label="Number of Guests"
                      onChange={handleGuestChange}
                      startAdornment={<Group sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} guest{num > 1 ? 's' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting || !bookingData.checkIn || !bookingData.checkOut}
                sx={{ mt: 3 }}
              >
                {submitting ? 'Creating Booking...' : 'Continue to Payment'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Price Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Price Details
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  ${property.price} × {nights} night{nights !== 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2">
                  ${property.price * nights}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Service fee
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${Math.round(total * 0.1)}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  Total
                </Typography>
                <Typography variant="h6" color="primary">
                  ${total + Math.round(total * 0.1)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                You won't be charged yet
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              • Free cancellation for 48 hours
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              • No prepayment needed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Instant confirmation
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingForm; 
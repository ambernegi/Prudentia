import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  CheckCircle,
  Email,
  Phone,
  CalendarToday,
  LocationOn,
  Group,
  AttachMoney,
  Download,
} from '@mui/icons-material';
import axios from 'axios';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
        const propertyResponse = await axios.get(`/api/properties/${bookingResponse.data.propertyId}`);
        
        setBooking(bookingResponse.data);
        setProperty(propertyResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load booking confirmation');
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!booking || !property) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Booking not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mb: 4 }}>
        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Booking Confirmed!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your booking has been successfully confirmed. We've sent you a confirmation email with all the details.
        </Typography>
        <Typography variant="h6" color="primary">
          Booking ID: {bookingId}
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Property Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {property.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {property.location}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {booking.checkIn} - {booking.checkOut}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Group sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  ${booking.totalPrice} total
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* What's Next */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              What's Next?
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Email sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Check your email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We've sent you a confirmation email with all the details, including check-in instructions and property information.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Phone sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Contact your host
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your host will contact you within 24 hours with check-in details and any special instructions.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <CalendarToday sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Prepare for your stay
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review the property details and prepare any questions you might have for your host.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Cancellation Policy */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cancellation Policy
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You can cancel your booking for free within 48 hours of making the reservation. After that, cancellation fees may apply based on the property's cancellation policy.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
            >
              Cancel Booking
            </Button>
          </Paper>
        </Grid>

        {/* Booking Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Booking Summary
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {property.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {property.location}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Accommodation
                    </Typography>
                    <Typography variant="body2">
                      ${booking.totalPrice}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Service fee
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${Math.round(booking.totalPrice * 0.1)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                      Total Paid
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${booking.totalPrice + Math.round(booking.totalPrice * 0.1)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Download />}
              sx={{ mb: 2 }}
            >
              Download Receipt
            </Button>

            <Button
              component={Link}
              to="/"
              variant="contained"
              fullWidth
            >
              Browse More Properties
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingConfirmation; 
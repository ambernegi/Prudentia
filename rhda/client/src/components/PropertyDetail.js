import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  Hotel,
  Bathtub,
  Group,
  Wifi,
  Kitchen,
  LocalParking,
  Pool,
  BeachAccess,
  FitnessCenter,
  Fireplace,
  Home,
} from '@mui/icons-material';
import axios from 'axios';

const amenityIcons = {
  WiFi: Wifi,
  Kitchen: Kitchen,
  Parking: LocalParking,
  Pool: Pool,
  'Beach Access': BeachAccess,
  Gym: FitnessCenter,
  Doorman: Home, // fallback icon
  Fireplace: Fireplace,
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`/api/properties/${id}`);
        setProperty(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load property details');
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
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

  if (error || !property) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Property not found'}</Alert>
      </Container>
    );
  }

  const handleBookNow = () => {
    navigate(`/booking/${property.id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Image Gallery */}
          <Card sx={{ mb: 3 }}>
            <CardMedia
              component="img"
              height="400"
              image={property.images[selectedImage]}
              alt={property.title}
              sx={{ objectFit: 'cover' }}
            />
            {property.images.length > 1 && (
              <Box sx={{ p: 2, display: 'flex', gap: 1, overflow: 'auto' }}>
                {property.images.map((image, index) => (
                  <CardMedia
                    key={index}
                    component="img"
                    height="60"
                    width="80"
                    image={image}
                    alt={`${property.title} ${index + 1}`}
                    sx={{
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid #1976d2' : '2px solid transparent',
                    }}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </Box>
            )}
          </Card>

          {/* Property Details */}
          <Typography variant="h4" component="h1" gutterBottom>
            {property.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body1" color="text.secondary">
              {property.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Rating value={4.5} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              4.5 (24 reviews)
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ mb: 3 }}>
            {property.description}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Property Features */}
          <Typography variant="h6" gutterBottom>
            What this place offers
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Hotel />
                  </ListItemIcon>
                  <ListItemText primary={`${property.bedrooms} bedroom${property.bedrooms > 1 ? 's' : ''}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Bathtub />
                  </ListItemIcon>
                  <ListItemText primary={`${property.bathrooms} bathroom${property.bathrooms > 1 ? 's' : ''}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Group />
                  </ListItemIcon>
                  <ListItemText primary={`Up to ${property.maxGuests} guests`} />
                </ListItem>
              </List>
            </Grid>
          </Grid>

          {/* Amenities */}
          <Typography variant="h6" gutterBottom>
            Amenities
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {property.amenities.map((amenity) => {
              const IconComponent = amenityIcons[amenity] || Hotel;
              return (
                <Chip
                  key={amenity}
                  icon={<IconComponent />}
                  label={amenity}
                  variant="outlined"
                  size="medium"
                />
              );
            })}
          </Box>
        </Grid>

        {/* Booking Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              ${property.price}
              <Typography component="span" variant="body2" color="text.secondary">
                /night
              </Typography>
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={4.5} readOnly size="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>
                4.5 (24 reviews)
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleBookNow}
              sx={{ mb: 2 }}
            >
              Book Now
            </Button>

            <Typography variant="body2" color="text.secondary" align="center">
              You won't be charged yet
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • Free cancellation for 48 hours
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • No prepayment needed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Instant confirmation
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PropertyDetail; 
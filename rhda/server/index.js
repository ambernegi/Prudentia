const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Sample data - in a real app, this would come from a database
const properties = [
  {
    id: '1',
    title: 'Cozy Mountain Cabin',
    description: 'Beautiful cabin with mountain views',
    location: 'Aspen, CO',
    price: 150,
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
    ],
    amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Parking'],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1
  },
  {
    id: '2',
    title: 'Modern Beach House',
    description: 'Stunning beachfront property with ocean views',
    location: 'Malibu, CA',
    price: 300,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
    ],
    amenities: ['WiFi', 'Kitchen', 'Pool', 'Beach Access'],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2
  },
  {
    id: '3',
    title: 'Downtown Loft',
    description: 'Stylish loft in the heart of the city',
    location: 'New York, NY',
    price: 200,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    amenities: ['WiFi', 'Kitchen', 'Gym', 'Doorman'],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1
  }
];

const bookings = [];
const bookedDates = require('./availability');

// Routes
app.get('/api/properties', (req, res) => {
  res.json(properties);
});

app.get('/api/properties/:id', (req, res) => {
  const property = properties.find(p => p.id === req.params.id);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }
  res.json(property);
});

app.post('/api/bookings', (req, res) => {
  const { propertyId, checkIn, checkOut, guests, totalPrice } = req.body;
  
  if (!propertyId || !checkIn || !checkOut || !guests || !totalPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const booking = {
    id: Date.now().toString(),
    propertyId,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

app.post('/api/payment', (req, res) => {
  const { bookingId, paymentMethod } = req.body;
  
  // In a real app, you would integrate with Stripe here
  // For demo purposes, we'll simulate a successful payment
  
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Simulate payment processing
  setTimeout(() => {
    booking.status = 'confirmed';
    res.json({ 
      success: true, 
      message: 'Payment processed successfully',
      booking 
    });
  }, 1000);
});

app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(booking);
});

app.get('/api/exclusive-availability', (req, res) => {
  res.json({ bookedDates });
});

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, CardContent, Paper, Button, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, useMediaQuery, DialogContentText, Tooltip, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { CalendarToday } from '@mui/icons-material';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import KitchenIcon from '@mui/icons-material/Kitchen';
import WifiIcon from '@mui/icons-material/Wifi';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
import PolicyIcon from '@mui/icons-material/Policy';

const property = {
  name: 'Starlit Glamping Retreat',
  location: 'Whispering Pines, Lake District',
  hero: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
  gallery: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80' },
    // Replace video with a new glamping image
    { type: 'image', src: 'https://images.unsplash.com/photo-1519821172143-ecb1df1bbf55?auto=format&fit=crop&w=1200&q=80' },
  ],
  description: 'Experience nature in style at Starlit Glamping Retreat. Enjoy luxury tents with plush bedding, private decks, and breathtaking views under the stars. Unwind by the campfire, savor gourmet meals, and relax in a spa-inspired bathhouse. Perfect for couples, families, and adventurers seeking comfort and adventure.',
  amenities: [
    'Luxurious Tents',
    'Private Deck',
    'Bonfire',
    'Double Lake View',
    'Parking',
    'Sunset View',
    'Valley View',
    'Amazing Dining with Local Cuisine',
    'Nature Walks',
    'Stargazing Experience',
    'Yoga & Meditation',
    'Bird Watching'
    ,
  ],
  price: '$650/night',
};

const ExclusiveProperties = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiry, setInquiry] = useState({ name: '', email: '', message: '' });
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [bookedDates, setBookedDates] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateRange, setDateRange] = useState([]); // [start, end]
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({ name: '', email: '', phone: '' });
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const NIGHTLY_RATE = 650;
  const validCoupons = { 'GLAMP10': 10, 'SUMMER20': 20 };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const galleryRef = useRef(null);
  const [weather, setWeather] = useState(null);
  const [calendarStartMonth, setCalendarStartMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0,0,0,0);
    return d;
  });
  // Move isAtCurrentMonth to component scope so it's always defined and reactive
  const isAtCurrentMonth = calendarStartMonth.getFullYear() === new Date().getFullYear() && calendarStartMonth.getMonth() === new Date().getMonth();
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryModalIndex, setGalleryModalIndex] = useState(0);

  useEffect(() => {
    axios.get('/api/exclusive-availability').then(res => {
      setBookedDates(res.data.bookedDates || []);
    });
  }, []);

  useEffect(() => {
    // Example: Open-Meteo API for Lake District (lat: 54.4609, lon: -3.0886)
    axios.get('https://api.open-meteo.com/v1/forecast?latitude=54.4609&longitude=-3.0886&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=7&timezone=auto')
      .then(res => setWeather(res.data));
  }, []);
  const weatherIcons = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 80: '🌦️', 81: '🌦️', 82: '🌦️', 95: '⛈️', 96: '⛈️', 99: '⛈️'
  };

  const isDateBooked = (date) => {
    return bookedDates.includes(date.toISOString().slice(0, 10));
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().slice(0, 10);
    if (isDateBooked(date)) return;
    if (dateRange.length === 0) {
      setDateRange([dateStr]);
      setSelectedDates([dateStr]);
    } else if (dateRange.length === 1) {
      // Select interval
      const start = new Date(dateRange[0]);
      const end = new Date(dateStr);
      if (start > end) {
        setDateRange([dateStr, dateRange[0]]);
        selectInterval(dateStr, dateRange[0]);
      } else {
        setDateRange([dateRange[0], dateStr]);
        selectInterval(dateRange[0], dateStr);
      }
    } else {
      // Reset selection
      setDateRange([dateStr]);
      setSelectedDates([dateStr]);
    }
  };

  const selectInterval = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dStr = d.toISOString().slice(0, 10);
      if (!isDateBooked(new Date(dStr))) {
        dates.push(dStr);
      }
    }
    setSelectedDates(dates);
  };

  const handleBookingInput = (e) => {
    setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // Here you would send bookingDetails and selectedDates to the backend, then redirect to payment
    setBookingOpen(false);
    setSelectedDates([]);
    setBookingDetails({ name: '', email: '', phone: '' });
    alert('Booking submitted! Proceeding to payment...');
    // Optionally, redirect to payment page or show payment dialog
  };

  const handlePrevMonth = () => {
    // 1. Prevent moving before current month
    if (isAtCurrentMonth) return;
    setCalendarStartMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };
  const handleNextMonth = () => {
    setCalendarStartMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const renderCalendar = () => {
    const months = [];
    for (let m = 0; m < 1; m++) {
      const monthDate = new Date(calendarStartMonth.getFullYear(), calendarStartMonth.getMonth() + m, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      const weeks = [];
      let day = 1 - firstDay;
      for (let w = 0; w < 6; w++) {
        const week = [];
        for (let d = 0; d < 7; d++, day++) {
          if (day < 1 || day > daysInMonth) {
            week.push(null);
          } else {
            week.push(new Date(year, month, day));
          }
        }
        weeks.push(week);
      }
      months.push({ year, month, weeks });
    }
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
        {months.map(({ year, month, weeks }, idx) => (
          <Paper key={idx} elevation={6} sx={{
            width: 300,
            minWidth: 300,
            maxWidth: 300,
            minHeight: 300,
            height: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            p: 2,
            borderRadius: 4,
            boxShadow: '0 4px 24px 0 rgba(60,72,88,0.10)',
            bgcolor: 'linear-gradient(135deg, #f8fafc 0%, #e3f0ff 100%)',
            border: '1.5px solid #e0e7ef',
            mb: 1,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 8px 32px 0 rgba(60,72,88,0.16)' },
          }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 15, fontWeight: 600, textAlign: 'center', justifyContent: 'center' }}>
              <CalendarToday fontSize="inherit" style={{ fontSize: 16 }} />
              {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Typography>
            <Divider sx={{ my: 1, bgcolor: '#d1d5db', borderBottomWidth: 2, borderRadius: 1 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25, flexGrow: 1 }}>
              {[...Array(7)].map((_, d) => (
                <Typography key={d} variant="caption" align="center" color="text.secondary" sx={{ fontSize: 11, fontWeight: 500 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][d]}
                </Typography>
              ))}
              {weeks.flat().map((date, i) => {
                if (!date) return <Box key={i} />;
                const dateStr = date.toISOString().slice(0, 10);
                const booked = isDateBooked(date);
                const selected = selectedDates.includes(dateStr);
                const dayBox = (
                  <Box
                    key={i}
                    sx={{
                      p: 0.5,
                      borderRadius: 0.5,
                      textAlign: 'center',
                      fontSize: 13,
                      bgcolor: booked ? '#b0b0b0' : selected ? 'primary.light' : '#fff',
                      color: booked ? 'text.disabled' : selected ? 'primary.contrastText' : 'text.primary',
                      border: booked ? '1px solid #888' : selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      fontWeight: booked ? 500 : 400,
                      cursor: booked ? 'not-allowed' : 'pointer',
                      opacity: booked ? 0.5 : 1,
                      transition: 'background 0.2s, border 0.2s',
                    }}
                    onClick={() => handleDateClick(date)}
                  >
                    {date.getDate()}
                  </Box>
                );
                return booked ? (
                  <Tooltip key={i} title="Unavailable" arrow>
                    {dayBox}
                  </Tooltip>
                ) : dayBox;
              })}
            </Box>
            <Divider sx={{ my: 1, bgcolor: '#d1d5db', borderBottomWidth: 2, borderRadius: 1 }} />
          </Paper>
        ))}
      </Box>
    );
  };

  // Scroll to selected gallery item
  const scrollToIndex = (idx) => {
    setGalleryIndex(idx);
    if (galleryRef.current) {
      const child = galleryRef.current.children[idx];
      if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  // Touch/drag support for mobile
  let startX = 0;
  let scrollLeft = 0;
  const onTouchStart = (e) => {
    startX = e.touches[0].pageX - galleryRef.current.offsetLeft;
    scrollLeft = galleryRef.current.scrollLeft;
  };
  const onTouchMove = (e) => {
    if (!galleryRef.current) return;
    const x = e.touches[0].pageX - galleryRef.current.offsetLeft;
    galleryRef.current.scrollLeft = scrollLeft - (x - startX);
  };

  const handleInquiryChange = (e) => {
    setInquiry({ ...inquiry, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquiryOpen(false);
    setInquiry({ name: '', email: '', message: '' });
    alert('Inquiry sent! We will contact you soon.');
  };

  const nights = selectedDates.length;
  const basePrice = nights * NIGHTLY_RATE;
  const discountedPrice = discount ? basePrice * (1 - discount / 100) : basePrice;

  const handleCouponChange = (e) => {
    setCoupon(e.target.value.toUpperCase());
    setCouponError('');
  };
  const handleApplyCoupon = () => {
    if (validCoupons[coupon]) {
      setDiscount(validCoupons[coupon]);
      setCouponError('');
    } else {
      setDiscount(0);
      setCouponError('Invalid coupon');
    }
  };

  const greenFeatures = [
    { icon: '🌱', label: 'Eco-Friendly Toiletries' },
    { icon: '💧', label: 'Rainwater Harvesting' },
    { icon: '🔋', label: 'Solar Power' },
    { icon: '🚯', label: 'Zero Waste Policy' },
    { icon: '🌳', label: 'Native Landscaping' },
  ];

  // Handler to open modal on image click
  const handleGalleryImageClick = (idx) => {
    setGalleryModalIndex(idx);
    setGalleryModalOpen(true);
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (!galleryModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setGalleryModalIndex(i => (i - 1 + property.gallery.length) % property.gallery.length);
      if (e.key === 'ArrowRight') setGalleryModalIndex(i => (i + 1) % property.gallery.length);
      if (e.key === 'Escape') setGalleryModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryModalOpen]);

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: '#f5f7fa', overflowX: 'hidden', pb: 6, fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section */}
      <Box sx={{
        width: '100vw',
        minHeight: { xs: 320, md: 480 },
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: { xs: 2, md: 4 },
        overflow: 'hidden',
      }}>
        {/* Background Video */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/eRBNnfXXF4w?autoplay=1&mute=1&loop=1&playlist=eRBNnfXXF4w&controls=0&showinfo=0&modestbranding=1"
            title="Nature Relaxation Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.55) blur(0.5px)',
              pointerEvents: 'none',
              transform: isMobile ? 'scale(1.1)' : 'scale(1.0)',
              transition: 'transform 0.4s',
            }}
          />
          {/* Overlay for extra contrast */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.28)',
            zIndex: 2,
          }} />
        </Box>
        <Box sx={{
          position: 'relative',
          zIndex: 3,
          color: '#fff',
          textAlign: 'center',
          width: '100%',
        }}>
          <Typography variant={isMobile ? 'h4' : 'h2'} fontWeight={700} sx={{ letterSpacing: 1, mb: 1, fontFamily: 'Playfair Display, serif', color: '#fff', fontWeight: 700, fontSize: isMobile ? 38 : 64, textShadow: '0 2px 12px rgba(0,0,0,0.28)' }}>
            {property.name}
          </Typography>
          <Typography variant={isMobile ? 'subtitle1' : 'h5'} sx={{ mb: 2, fontFamily: 'Playfair Display, serif', color: '#fff', fontWeight: 600, letterSpacing: 0.5, textShadow: '0 1px 8px rgba(0,0,0,0.22)' }}>
            {property.location} &nbsp;|&nbsp; <b>{property.price}</b>
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Button variant="contained" color="primary" size={isMobile ? 'medium' : 'large'} onClick={() => setInquiryOpen(true)}>
              Inquire Now
            </Button>
            <Button variant="outlined" color="primary" size={isMobile ? 'medium' : 'large'} onClick={() => setBookingOpen(true)} disabled={selectedDates.length === 0}>
              Book Now
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content Section: Description/Amenities left, Gallery right */}
      <Paper sx={{ p: { xs: 1, md: 4 }, mb: 0, borderRadius: 0, minHeight: '60vh', boxShadow: 'none', bgcolor: 'transparent' }}>
        <Box
          sx={{
            maxWidth: 1600,
            mx: 'auto',
            pt: { xs: 2, md: 6 },
            pb: { xs: 2, md: 6 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 8 },
            alignItems: 'flex-start',
          }}
        >
          {/* Left: Description & Amenities */}
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <CardContent sx={{ px: 0 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Inter, sans-serif', color: '#1a237e', fontWeight: 700, letterSpacing: 0.5, mb: 1 }}>Description</Typography>
              <Typography variant="body1" sx={{ mb: 2, fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#222' }}>{property.description}</Typography>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Inter, sans-serif', color: '#1a237e', fontWeight: 700, letterSpacing: 0.5, mb: 1 }}>Amenities</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {property.amenities.map((amenity, idx) => (
                  <Chip key={idx} label={amenity} color="primary" variant="outlined" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#1a237e' }} />
                ))}
              </Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, color: 'success.dark', fontFamily: 'Inter, sans-serif', color: '#1a237e', fontWeight: 700, letterSpacing: 0.5, mb: 1 }}>Green Features</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {greenFeatures.map((f, idx) => (
                  <Chip key={idx} icon={<span style={{ fontSize: 18 }}>{f.icon}</span>} label={f.label} color="success" variant="outlined" sx={{ fontWeight: 500, bgcolor: '#e8f5e9', fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#2d3142' }} />
                ))}
              </Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, fontFamily: 'Inter, sans-serif', color: '#1a237e', fontWeight: 700, letterSpacing: 0.5, mb: 1 }}>What you get</Typography>
              <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                  <KitchenIcon color="primary" sx={{ fontSize: 36, mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#222' }}>Kitchen</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                  <WifiIcon color="primary" sx={{ fontSize: 36, mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#222' }}>WiFi</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                  <AcUnitIcon color="primary" sx={{ fontSize: 36, mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#222' }}>Air Conditioning</Typography>
                </Box>
              </Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Inter, sans-serif', color: '#1a237e', fontWeight: 700, letterSpacing: 0.5, mb: 1 }}>
                Availability
                <Button onClick={handleNextMonth} size="small" sx={{ minWidth: 0, p: 0.5, borderRadius: 1, ml: 1 }}>
                  <ArrowForwardIosIcon fontSize="small" />
                </Button>
              </Typography>
              {renderCalendar()}
            </CardContent>
          </Box>

          {/* Right: Vertical Gallery */}
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 320 }, maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {property.gallery.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: galleryIndex === idx ? 6 : 1,
                  border: galleryIndex === idx ? '3px solid #1976d2' : '2px solid #e0e0e0',
                  position: 'relative',
                  background: '#000',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.3s, border 0.3s',
                  height: { xs: 140, md: 90 },
                  width: '100%',
                  mb: 1,
                  '&:hover': {
                    boxShadow: 8,
                    border: '3px solid #1976d2',
                  },
                }}
                onClick={() => item.type === 'image' && handleGalleryImageClick(idx)}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.src}
                    alt={`Gallery ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <iframe
                    width="100%"
                    height="100%"
                    src={item.src}
                    title="Glamping Tour"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 0 }}
                  />
                )}
              </Box>
            ))}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3 }}>
              <a href="https://instagram.com/yourproperty" target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C' }}>
                <InstagramIcon fontSize="large" />
              </a>
              <a href="https://youtube.com/yourproperty" target="_blank" rel="noopener noreferrer" style={{ color: '#FF0000' }}>
                <YouTubeIcon fontSize="large" />
              </a>
            </Box>
            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography variant="h5" sx={{ mb: 3, fontFamily: 'Inter, sans-serif', color: '#1a237e', fontWeight: 700, letterSpacing: 0.5 }}>Things to know</Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <GavelIcon sx={{ color: '#1a237e', fontSize: 32, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#1a237e', mb: 0.5 }}>Property rules</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#222' }}>Check-in after 12:00 pm<br/>Checkout before 10:00 am<br/>4 guests maximum</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <SecurityIcon sx={{ color: '#1a237e', fontSize: 32, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#1a237e', mb: 0.5 }}>Safety & property</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#222' }}>Fire-extinguishers for fire safety</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <PolicyIcon sx={{ color: '#1a237e', fontSize: 32, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#1a237e', mb: 0.5 }}>Cancellation policy</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#222' }}>Free cancellation before 48 hours. Cancel before check-in for a partial refund.</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
      <Dialog open={inquiryOpen} onClose={() => setInquiryOpen(false)}>
        <DialogTitle>Inquire about {property.name}</DialogTitle>
        <form onSubmit={handleInquirySubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <TextField label="Your Name" name="name" value={inquiry.name} onChange={handleInquiryChange} required />
            <TextField label="Email" name="email" value={inquiry.email} onChange={handleInquiryChange} required type="email" />
            <TextField label="Message" name="message" value={inquiry.message} onChange={handleInquiryChange} required multiline rows={3} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInquiryOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Send Inquiry</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={bookingOpen} onClose={() => setBookingOpen(false)}>
        <DialogTitle>Book Starlit Glamping Retreat</DialogTitle>
        <form onSubmit={handleBookingSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <DialogContentText>
              {selectedDates.length > 1
                ? `Selected Range: ${selectedDates[0]} to ${selectedDates[selectedDates.length - 1]} (${nights} nights)`
                : selectedDates.length === 1
                ? `Selected Date: ${selectedDates[0]}`
                : 'None'}
            </DialogContentText>
            {nights > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">Base Price: ${basePrice.toLocaleString()}</Typography>
                {discount > 0 && (
                  <Typography variant="body2" color="success.main">Discount: -{discount}%</Typography>
                )}
                <Typography variant="h6" sx={{ mt: 0.5 }}>Total: ${discountedPrice.toLocaleString()}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <TextField label="Coupon" value={coupon} onChange={handleCouponChange} size="small" sx={{ flex: 1 }} error={!!couponError} helperText={couponError} />
              <Button variant="outlined" onClick={handleApplyCoupon} size="small">Apply</Button>
            </Box>
            {discount > 0 && (
              <Typography variant="caption" color="success.main">Offer applied!</Typography>
            )}
            <TextField label="Your Name" name="name" value={bookingDetails.name} onChange={handleBookingInput} required />
            <TextField label="Email" name="email" value={bookingDetails.email} onChange={handleBookingInput} required type="email" />
            <TextField label="Phone" name="phone" value={bookingDetails.phone} onChange={handleBookingInput} required type="tel" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={selectedDates.length === 0}>Proceed to Payment</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={galleryModalOpen} onClose={() => setGalleryModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#111', p: 0 } }}>
        <Box sx={{ position: 'relative', width: '100%', height: { xs: 320, md: 540 }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#111' }}>
          <IconButton onClick={() => setGalleryModalOpen(false)} sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', zIndex: 2 }}>
            <CloseIcon fontSize="large" />
          </IconButton>
          <IconButton onClick={() => setGalleryModalIndex(i => (i - 1 + property.gallery.length) % property.gallery.length)} sx={{ position: 'absolute', left: 16, color: '#fff', zIndex: 2, bgcolor: 'rgba(0,0,0,0.3)' }}>
            <ArrowBackIosNewIcon fontSize="large" />
          </IconButton>
          <IconButton onClick={() => setGalleryModalIndex(i => (i + 1) % property.gallery.length)} sx={{ position: 'absolute', right: 16, color: '#fff', zIndex: 2, bgcolor: 'rgba(0,0,0,0.3)' }}>
            <ArrowForwardIosIcon fontSize="large" />
          </IconButton>
          {property.gallery[galleryModalIndex].type === 'image' ? (
            <img
              src={property.gallery[galleryModalIndex].src}
              alt={`Gallery ${galleryModalIndex + 1}`}
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }}
            />
          ) : null}
        </Box>
      </Dialog>
    </Box>
  );
};

export default ExclusiveProperties; 
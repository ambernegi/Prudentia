import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { Home, Hotel } from '@mui/icons-material';
import AuthDialog from './AuthDialog';

const Header = () => {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <AppBar position="static" elevation={2}>
      <Container maxWidth="lg">
        <Toolbar>
          <Hotel sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            BookEase
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              startIcon={<Home />}
            >
              Properties
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/itinerary"
              sx={{ ml: 1 }}
            >
              Itinerary Planner
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/exclusive"
              sx={{ ml: 1 }}
            >
              Exclusive Properties
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              sx={{ ml: 2 }}
              onClick={() => setAuthOpen(true)}
            >
              Login / Sign Up
            </Button>
          </Box>
        </Toolbar>
      </Container>
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </AppBar>
  );
};

export default Header; 
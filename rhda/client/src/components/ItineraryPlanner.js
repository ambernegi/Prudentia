import React, { useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, MenuItem, Paper } from '@mui/material';

const activityTypes = [
  { value: 'attraction', label: 'Attraction' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
];

const ItineraryPlanner = () => {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'attraction', location: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!form.name || !form.location) return;
    setActivities([...activities, form]);
    setForm({ name: '', type: 'attraction', location: '' });
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Itinerary Planner
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <TextField
            label="Activity Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            fullWidth
          >
            {activityTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Location/Address"
            name="location"
            value={form.location}
            onChange={handleChange}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Add to Itinerary
          </Button>
        </Box>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Planned Activities
        </Typography>
        <List>
          {activities.length === 0 && (
            <ListItem>
              <ListItemText primary="No activities added yet." />
            </ListItem>
          )}
          {activities.map((act, idx) => (
            <ListItem key={idx} divider>
              <ListItemText
                primary={`${act.name} (${activityTypes.find(t => t.value === act.type)?.label || act.type})`}
                secondary={act.location}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ItineraryPlanner; 
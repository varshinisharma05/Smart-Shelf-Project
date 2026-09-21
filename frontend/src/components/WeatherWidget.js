import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

const API_URL = "https://smart-shelf-backend-lbmm.onrender.com/api";

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [suggestion, setSuggestion] = useState("Loading suggestion...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get User's Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Location denied/error, using default.", error);
          fetchData(null, null); // Fallback to backend default (Nellore)
        }
      );
    } else {
      fetchData(null, null);
    }
  }, []);

  const fetchData = async (lat, lon) => {
    try {
      // 2. Fetch Weather (with lat/lon if available)
      let weatherUrl = `${API_URL}/weather`;
      if (lat && lon) weatherUrl += `?lat=${lat}&lon=${lon}`;
      
      const weatherRes = await axios.get(weatherUrl);
      setWeather(weatherRes.data);

      // 3. Fetch Pantry for Smart Suggestion
      const inventoryRes = await axios.get(`${API_URL}/inventory`);
      const items = inventoryRes.data;
      
      // 4. Generate Smart Suggestion
      generateSuggestion(weatherRes.data.temp, items);
      
      setLoading(false);
    } catch (error) {
      console.error("Widget Error:", error);
      setLoading(false);
    }
  };

  const generateSuggestion = (temp, items) => {
    // Pick a random item from the pantry
    const randomItem = items.length > 0 
      ? items[Math.floor(Math.random() * items.length)].name 
      : "ingredients";

    if (temp > 25) {
      setSuggestion(`It's hot! Try a fresh salad with ${randomItem}. 🥗`);
    } else if (temp < 15) {
      setSuggestion(`Chilly out! A warm soup with ${randomItem} is perfect. 🥣`);
    } else {
      setSuggestion(`Perfect weather for a stir-fry using ${randomItem}! 🥘`);
    }
  };

  if (loading) return <CircularProgress size={20} sx={{ color: '#ff9800', display: 'block', mx: 'auto' }} />;
  if (!weather) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: '#E3F2FD', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3
      }}
    >
      {/* Left Side: Weather Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <img 
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
          alt={weather.condition}
          style={{ width: 50, height: 50 }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565C0' }}>
            {weather.city}, {weather.temp}°C
          </Typography>
          <Typography variant="body2" sx={{ color: '#1E88E5', textTransform: 'capitalize' }}>
            {weather.description}
          </Typography>
        </Box>
      </Box>

      {/* Right Side: Dynamic Suggestion */}
      <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' }, maxWidth: '50%' }}>
         <Typography variant="body2" sx={{ color: '#1565C0', fontStyle: 'italic' }}>
            Based on your pantry:
         </Typography>
         <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#0D47A1' }}>
            {suggestion}
         </Typography>
      </Box>
    </Paper>
  );
}

export default WeatherWidget;
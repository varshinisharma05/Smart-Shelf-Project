import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; 
import { Typography, Box, Grid, Paper } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import WeatherWidget from '../components/WeatherWidget';

const API_URL = "https://smart-shelf-backend-lbmm.onrender.com/api";

function DashboardCard({ title, value, icon, onClick }) {
  return (
    <Paper 
      elevation={2}
      onClick={onClick}
      sx={{ 
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 3,
        transition: '0.3s',
        '&:hover': { 
          cursor: 'pointer',
          backgroundColor: 'action.hover',
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box 
        sx={{ 
          p: 1.5, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#ff9800', 
          color: '#ffffff'
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [pantryCount, setPantryCount] = useState(0);
  const [inventory, setInventory] = useState([]); // THE FIX: Define inventory here
  const [shoppingListCount, setShoppingListCount] = useState(0);
  const [expiryAlertCount, setExpiryAlertCount] = useState(0); 
  
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevCountRef = useRef();

  // --- 1. FRIENDLY NOTIFICATION ENGINE ---
  useEffect(() => {
    // 1. SILENT START: Stay quiet until we have real data in inventory
    if (isInitialLoad) {
      if (inventory.length > 0) {
        prevCountRef.current = inventory.length; // Lock in the starting number
        setIsInitialLoad(false);
      }
      return; 
    }

    // 2. ADDED/REMOVED LOGIC (Now comparing against inventory.length directly)
    if (!isInitialLoad && prevCountRef.current !== undefined) {
      if (inventory.length > prevCountRef.current) {
        toast.success("Yummmmyyyy!! New food added to the shelf! 😋🍗", { 
          theme: "colored",
          icon: "🍗" 
        });
      } 
      else if (inventory.length < prevCountRef.current) {
        toast.info("Got it! Pantry updated. 🧹", { theme: "dark", autoClose: 2000 });
      }
    }


    // Smart Expiry/Expired Logic
    if (pantryCount > 0 && expiryAlertCount > 0 && inventory.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check for items that are actually PAST today's date
      const expiredItems = inventory.filter(item => new Date(item.expiryDate) < today);
      
      if (expiredItems.length > 0) {
        toast.error(`OH NOOO Himaaaaa!! ${expiredItems[0].name} has expired! 😭🥛`, {
          toastId: 'expired-heavy',
          theme: "colored",
        });
      } else {
        toast.warn(`Himaaaaaa!! You have items expiring soon! Eat up! 🏃‍♀️🥗`, {
          toastId: 'expiry-warn',
          theme: "colored",
        });
      }
    }

    // Update the ref to the current count for the next interval check
    prevCountRef.current = pantryCount;
  }, [pantryCount, expiryAlertCount, isInitialLoad, inventory]);

  // --- 2. DATA FETCHING ENGINE ---
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const inventoryRes = await axios.get(`${API_URL}/inventory`);
        const shoppingListRes = await axios.get(`${API_URL}/shoppinglist`);
        
        const data = inventoryRes.data;
        setInventory(data); 
        setPantryCount(data.length);
        setShoppingListCount(shoppingListRes.data.length);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        // Count anything that is already expired OR expiring in the next 7 days
        let totalRiskCount = 0;
        data.forEach(item => {
          const itemExpiryDate = new Date(item.expiryDate);
          if (itemExpiryDate <= sevenDaysFromNow) {
            totalRiskCount++;
          }
        });

        setExpiryAlertCount(totalRiskCount);
      
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }} gutterBottom>
        Hi Hima 👋, What's cooking today?
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Here's an overview of your smart pantry.
      </Typography>

      <WeatherWidget />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <DashboardCard 
            title="Pantry"
            value={`${pantryCount} items currently in stock`}
            icon={<InventoryIcon />}
            onClick={() => navigate('/pantry')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <DashboardCard 
            title="Recipes"
            value="AI-driven suggestions ready"
            icon={<LocalDiningIcon />}
            onClick={() => navigate('/recipes')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <DashboardCard 
            title="Shopping List"
            value={`${shoppingListCount} items on your list`}
            icon={<ShoppingCartIcon />}
            onClick={() => navigate('/shopping-list')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <DashboardCard 
            title="Expiry Alerts"
            value={`${expiryAlertCount} items at risk / expired`}
            icon={<NotificationImportantIcon />}
            onClick={() => navigate('/pantry')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
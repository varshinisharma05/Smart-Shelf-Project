import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';

// --- STEP 1: IMPORT TOASTIFY ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Dashboard from './pages/Dashboard';
import Pantry from './pages/Pantry';
import Recipes from './pages/Recipes';
import ShoppingList from './pages/ShoppingList';
import RecipeDetailPage from './pages/RecipeDetailPage';

// Components
import AiChatBox from './components/AiChatBox';

// MUI
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import './App.css';

const drawerWidth = 240;

function App() {
  const location = useLocation();
  const hideAIOn = ['/pantry'];
  const showAI = !hideAIOn.includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* --- STEP 2: ADD THE TOAST CONTAINER --- */}
      {/* This "listens" globally for any toast.success or toast.error calls */}
      <ToastContainer 
        position="top-center" 
        autoClose={4000} 
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" 
      />

      {/* SIDE DRAWER */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 1 }}>
          <List>
            {[
              { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
              { text: 'Pantry', icon: <InventoryIcon />, path: '/pantry' },
              { text: 'Recipes', icon: <LocalDiningIcon />, path: '/recipes' },
              { text: 'Shopping List', icon: <ShoppingCartIcon />, path: '/shopping-list' },
            ].map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{
                    '&.active': {
                      backgroundColor: '#ff9800', 
                      color: '#ffffff',
                      borderRadius: 2,
                      '& .MuiListItemIcon-root': {
                        color: '#ffffff'
                      }
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* CENTER CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: showAI
            ? 'calc(100% - 240px - 380px)'
            : 'calc(100% - 240px)',
          backgroundColor: '#f5f5f5',
          overflowY: 'auto',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pantry" element={<Pantry />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Routes>
      </Box>

      {/* RIGHT AI PANEL */}
      {showAI && (
        <Box
          sx={{
            width: '380px',
            minWidth: '360px',
            borderLeft: '1px solid #ddd',
            backgroundColor: '#fafafa',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh'
          }}
        >
          <AiChatBox largeMode={true} />
        </Box>
      )}

    </Box>
  );
}

export default App;
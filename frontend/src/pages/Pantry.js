import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- MUI Imports ---
import { 
  Button, 
  TextField, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Container,
  Paper 
} from '@mui/material';

// --- MUI Icon Imports ---
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// --- Component Imports ---
import AiChatBox from '../components/AiChatBox';

const API_URL = "https://smart-shelf-backend-lbmm.onrender.com/api";

function Pantry() {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedDate, setEditedDate] = useState('');

  const fetchInventory = () => {
    axios.get(`${API_URL}/inventory`)
      .then(response => setInventory(response.data))
      .catch(error => console.error("Error fetching data:", error));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/inventory`, { name: itemName, expiryDate: expiryDate })
    .then(() => {
      fetchInventory();
      setItemName('');
      setExpiryDate('');
    })
    .catch(error => console.error("Error adding item:", error));
  };

  const handleDelete = (id) => {
    axios.delete(`${API_URL}/inventory/${id}`)
      .then(() => fetchInventory())
      .catch(error => console.error("Error deleting item:", error));
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditedName(item.name);
    setEditedDate(item.expiryDate.split('T')[0]);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleUpdate = (id) => {
    axios.put(`${API_URL}/inventory/${id}`, { name: editedName, expiryDate: editedDate })
    .then(() => {
      fetchInventory();
      setEditingId(null);
    })
    .catch(error => console.error("Error updating item:", error));
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          My Smart Shelf
        </Typography>

        {/* Chat Box */}
        <Box sx={{ mb: 4 }}>
          <AiChatBox />
        </Box>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          My Inventory
        </Typography>
        
        {/* Add Item Form */}
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4, alignItems: 'center' }}
        >
          <TextField 
            label="Item Name"
            variant="outlined"
            value={itemName} 
            onChange={(e) => setItemName(e.target.value)} 
            required 
            sx={{ flexGrow: 1, minWidth: '200px' }}
          />
          <TextField 
            label="Expiry Date"
            type="date" 
            variant="outlined"
            value={expiryDate} 
            onChange={(e) => setExpiryDate(e.target.value)} 
            required 
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: '150px' }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<AddIcon />}
            // --- HARDCODED COLORS TO FIX CRASH ---
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
          > 
            Add Item 
          </Button>
        </Box>

        {/* Inventory List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {inventory.map(item => (
            <Card variant="outlined" key={item._id}>
              {editingId === item._id ? (
                // Edit Mode
                <>
                  <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <TextField label="Item Name" variant="filled" value={editedName} onChange={(e) => setEditedName(e.target.value)} sx={{ flexGrow: 1 }} />
                    <TextField label="Expiry Date" type="date" variant="filled" value={editedDate} onChange={(e) => setEditedDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button size="small" onClick={handleCancel} startIcon={<CancelIcon />}>Cancel</Button>
                    <Button size="small" onClick={() => handleUpdate(item._id)} startIcon={<SaveIcon />} variant="contained" sx={{ bgcolor: '#ff9800' }}>Save</Button>
                  </CardActions>
                </>
              ) : (
                // Display Mode
                <>
                  <CardContent>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography color="text.secondary">
                      Expiry: {new Date(item.expiryDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button size="small" onClick={() => handleEdit(item)} startIcon={<EditIcon />}>Edit</Button>
                    <Button size="small" onClick={() => handleDelete(item._id)} startIcon={<DeleteIcon />} color="error">Delete</Button>
                  </CardActions>
                </>
              )}
            </Card>
          ))}
        </Box>
        
      </Box>
    </Container>
  );
}

export default Pantry;
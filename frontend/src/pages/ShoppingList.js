import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- MUI Imports ---
import { 
  Button, 
  TextField, 
  Typography, 
  Box, 
  Container, 
  List, 
  ListItem, 
  ListItemText, 
  Checkbox, 
  IconButton, 
  Paper, 
  Divider 
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = "https://smart-shelf-backend-lbmm.onrender.com/api/shoppinglist";

function ShoppingList() {
  const [list, setList] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [checked, setChecked] = useState([]);

  const fetchList = () => {
    axios.get(API_URL)
      .then(response => setList(response.data))
      .catch(error => console.error("Error fetching shopping list!", error));
  };

  useEffect(() => { fetchList(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(API_URL, { name: newItemName })
      .then(() => { fetchList(); setNewItemName(''); })
      .catch(error => console.error("Error adding item:", error));
  };

  const handleDelete = (id) => {
    axios.delete(`${API_URL}/${id}`)
      .then(() => fetchList())
      .catch(error => console.error("Error deleting item:", error));
  };
  
  const handleToggle = (id) => {
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];
    if (currentIndex === -1) newChecked.push(id);
    else newChecked.splice(currentIndex, 1);
    setChecked(newChecked);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Shopping List
        </Typography>
        
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}
        >
          <TextField 
            label="New Item (e.g., Tomatoes)"
            variant="outlined"
            value={newItemName} 
            onChange={(e) => setNewItemName(e.target.value)} 
            required 
            fullWidth
          />
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<AddIcon />} 
            // --- HARDCODED COLORS ---
            sx={{ flexShrink: 0, bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
          >
            Add
          </Button>
        </Box>

        <Divider />

        <Paper variant="outlined" sx={{ mt: 3 }}>
          <List>
            {list.map(item => {
              const labelId = `checkbox-list-label-${item._id}`;
              const isChecked = checked.indexOf(item._id) !== -1;
              
              return (
                <ListItem
                  key={item._id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(item._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                  disablePadding
                >
                  <Button onClick={() => handleToggle(item._id)} sx={{ width: '100%', justifyContent: 'flex-start', p: 1 }}>
                    <Checkbox
                      edge="start"
                      checked={isChecked}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId }}
                      // --- Hardcoded Checkbox Color ---
                      sx={{
                        color: '#ff9800',
                        '&.Mui-checked': { color: '#ff9800' },
                      }}
                    />
                    <ListItemText 
                      id={labelId} 
                      primary={item.name} 
                      sx={{ 
                        textDecoration: isChecked ? 'line-through' : 'none',
                        color: isChecked ? 'text.secondary' : 'text.primary',
                        textTransform: 'none'
                      }} 
                    />
                  </Button>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

export default ShoppingList;
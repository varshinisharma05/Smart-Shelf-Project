import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = "https://smart-shelf-backend-lbmm.onrender.com/api";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = () => {
    setLoading(true); 
    axios.get(`${API_URL}/recipes`)
      .then(response => {
        setRecipes(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching recipes!", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/recipes/${id}`);
      fetchRecipes(); 
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Culinary Creations
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<AddIcon />}
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
          >
            Add New Recipe
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          <Chip 
            label="Refresh List" 
            onClick={fetchRecipes}
            sx={{ bgcolor: '#ff9800', color: 'white', cursor: 'pointer' }}
          />
          <Chip label="Highest Rated" variant="outlined" />
          <Chip label="Chicken" variant="outlined" />
        </Box>

        {/* --- THE FIX: NO GRID. FLEXBOX LAYOUT. --- */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          
          {loading ? (
            <Typography sx={{ p: 2 }}>Loading...</Typography>
          ) : recipes.length === 0 ? (
            <Typography sx={{ p: 2 }}>No recipes found.</Typography>
          ) : (
            recipes.map((recipe) => (
              // Card Container (One Third Width)
              <Box 
                key={recipe._id} 
                sx={{ 
                  width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.33% - 24px)' } 
                }}
              >
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '1px solid #eee'
                  }}
                  // Using 'component={Link}' can sometimes cause issues with nesting buttons.
                  // Let's just make the title clickable or keep it simple for now.
                >
                   {/* Make the Content Area the Link */}
                   <Box component={Link} to={`/recipes/${recipe._id}`} sx={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                      <CardContent>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                          {recipe.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {recipe.nutrition}
                        </Typography>
                      </CardContent>
                   </Box>
                  
                  <CardActions sx={{ justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0' }}>
                    <Button 
                      size="small" 
                      startIcon={<DeleteIcon />}
                      sx={{ color: '#d32f2f' }}
                      onClick={() => handleDelete(recipe._id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default Recipes;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress, 
  Button 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_URL = "https://smart-shelf-backend-lbmm.onrender.com/api";

function RecipeDetailPage() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 

  useEffect(() => {
    axios.get(`${API_URL}/recipes/${id}`)
      .then(response => {
        setRecipe(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching recipe:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        {/* --- FIX: Hardcoded Loading Color --- */}
        <CircularProgress sx={{ color: '#ff9800' }} />
        <Typography>Loading your recipe...</Typography>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h5">Oops! Recipe not found.</Typography>
        <Button 
          component={Link} 
          to="/recipes" 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          // --- FIX: Hardcoded Button Color ---
          sx={{ mt: 2, bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
        >
          Back to Recipes
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Button 
          component={Link} 
          to="/recipes" 
          startIcon={<ArrowBackIcon />} 
          // --- FIX: Hardcoded Text Color ---
          sx={{ mb: 2, color: '#ff9800' }}
        >
          Back to All Recipes
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom>
          {recipe.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Estimated Time: {recipe.estimatedTime}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Nutrition: {recipe.nutrition}
        </Typography>
        
        <Paper elevation={2} sx={{ p: 3, mt: 4, whiteSpace: 'pre-wrap' }}>
          <Typography variant="h5" gutterBottom>Ingredients</Typography>
          <Typography variant="body1">
            {recipe.ingredients}
          </Typography>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 3, mt: 3, whiteSpace: 'pre-wrap' }}>
          <Typography variant="h5" gutterBottom>Steps</Typography>
          <Typography variant="body1">
            {recipe.steps}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default RecipeDetailPage;
import mongoose from 'mongoose';

const savedRecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  ingredients: {
    type: String, // We'll store this as one big string from the AI
    required: true
  },
  estimatedTime: {
    type: String,
  },
  steps: {
    type: String, // We'll store this as one big string from the AI
    required: true
  },
  nutrition: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SavedRecipe = mongoose.model('SavedRecipe', savedRecipeSchema);

export default SavedRecipe;
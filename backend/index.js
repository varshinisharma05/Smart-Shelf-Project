// --- IMPORTS (ESM Syntax) ---
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios'; 

// --- Import your models ---
import ShoppingItem from './models/ShoppingItem.js';
import InventoryItem from './models/InventoryItem.js';
import SavedRecipe from './models/SavedRecipe.js';

// --- Setup ---
dotenv.config(); // This is fine to leave, Render will just ignore it
const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
// Render will get this from the Environment Variables you just added
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("MongoDB error:", err));

// --- Google AI Setup ---
// Render will get this from the Environment Variables you just added
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ---------------------

// --- API ROUTES ---

app.get('/', (req, res) => {
  res.send('Hello, Smart Shelf! Backend running!');
});

// --- Shopping List Routes ---
app.get('/api/shoppinglist', async (req, res) => {
  try {
    res.status(200).json(await ShoppingItem.find());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/shoppinglist', async (req, res) => {
  try {
    const newItem = new ShoppingItem({ name: req.body.name });
    res.status(201).json(await newItem.save());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/shoppinglist/:id', async (req, res) => {
  try {
    const deleted = await ShoppingItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Inventory Routes ---
app.post('/api/inventory', async (req, res) => {
  try {
    const item = new InventoryItem({
      name: req.body.name,
      expiryDate: req.body.expiryDate,
    });
    res.status(201).json(await item.save());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    res.status(200).json(await InventoryItem.find());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const deleted = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const updated = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, expiryDate: req.body.expiryDate },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Saved Recipe Routes ---
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await SavedRecipe.find().sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const { title, ingredients, estimatedTime, steps, nutrition } = req.body;
    if (!title || !ingredients || !steps) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newRecipe = new SavedRecipe({
      title,
      ingredients,
      estimatedTime,
      steps,
      nutrition
    });
    const saved = await newRecipe.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL

    // Find the recipe by its ID and delete it
    const deletedRecipe = await SavedRecipe.findByIdAndDelete(id);

    if (!deletedRecipe) {
      // If no recipe was found with that ID
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Send a success confirmation
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (err) {
    // Handle any server errors
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL

    // Find the recipe by its ID
    const recipe = await SavedRecipe.findById(id);

    if (!recipe) {
      // If no recipe was found
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Send the single recipe back
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- AI CHEF ROUTE (WITH FINAL PROMPT FIX) ---
app.post("/api/ai/chat", async (req, res) => {
  try {
    // 1. Get user message
    const userMessage = req.body.message;

    // 2. Get BOTH lists
    const pantryItems = await InventoryItem.find();
    const shoppingItems = await ShoppingItem.find();
    const today = new Date();
    
    const pantryList = pantryItems.map(item => {
      const expiry = new Date(item.expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 3 && diffDays > 0) {
        return `${item.name} (USE-SOON: ${diffDays} day(s) left)`;
      } else if (diffDays <= 0) {
        return `${item.name} (EXPIRED)`;
      }
      return item.name;
    }).join(", ");

    const shoppingList = shoppingItems.map(item => item.name).join(", ");

    

    // 3. Build the UPDATED prompt
    const prompt = `
      You are “Shelfy”, the interactive cooking assistant for the Smart Shelf system.

      CORE BEHAVIOR:
      1. Only use ingredients from the “Pantry Items” list. Do NOT hallucinate ingredients.
      2. Provide 2–3 recipe ideas for general meal suggestions.
      3. Keep your tone warm, encouraging, and conversational.
      4. Keep answers short (6–12 lines).
      5. After giving 2–3 recipe names, ALWAYS ask:
         “Which one sounds good to you? I can give the detailed steps!”
      
      6. --- UPDATED: DETAILED RECIPE FORMAT ---
         When the user chooses one option, provide the full recipe in this *exact*, PLAIN-TEXT format:
         
         TITLE: Recipe Name
         INGREDIENTS:
         • ingredient
         • ingredient
         ESTIMATED TIME: X minutes
         STEPS:
         1. Step 1
         2. Step 2
         NUTRITION: one short line

      7. UPDATED: MISSING INGREDIENTS RULE
         - If the user asks for a dish that CANNOT be made (e.g. "Omelette" but no eggs):
         - Acknowledge what they want (“That sounds delicious!”).
         - State what's missing ("...but we're missing [item name].")
         - CHECK THE "SHOPPING LIST" CONTEXT.
         - If the item is *already* on the shopping list, say:
           "I see [item name] is already on your shopping list!"
         - If the item is *not* on the list, you MUST ask:
           "Would you like me to add [item name] to your shopping list?"

      8. EXPIRY & WASTE-REDUCTION: (Unchanged)
         - If any pantry item is marked “USE-SOON”, you MUST prioritize recipes using it.
         - Gently point it out.

      9. HEALTH & NUTRITION GUIDANCE: (Unchanged)
      10. USER MOOD & INTERACTIVITY: (Unchanged)

      11. --- UPDATED: FORMATTING RULES ---
         - Do NOT use ANY Markdown (no \`**\` or \`*\`).
         - Keep formatting plain, clean, and readable.
         - Use bullet points ONLY with “•”, and steps ONLY with numbers.
         - ALL keywords (TITLE, INGREDIENTS, STEPS, NUTRITION, ESTIMATED TIME) MUST be uppercase, followed by a colon.
      
      12. SCOPE LIMITATION: (Unchanged)
         - If the user asks anything unrelated to food/cooking, reply:
           “I can help only with pantry, cooking, expiry, nutrition, and recipe questions.”

      13. ACTION-CALLING RULE
         - If the user confirms they want to add an item (e.g. "Yes," "Add it," "Add cheese"),
         - You MUST reply ONLY with the following exact text format:
         - ACTION:ADD_SHOPPING_ITEM:[TheItemName]
         - Example: ACTION:ADD_SHOPPING_ITEM:Cheese
         - Do NOT add any other text like "Okay!" or "Done!". Just the command.
         - This rule OVERRIDES all other chat rules.

      Stay consistent, supportive, and practical.

      ---
      CONTEXT:
      Pantry Items: [${pantryList || 'empty'}]
      Shopping List: [${shoppingList || 'empty'}]
      
      User question:
      ${userMessage}
    `;

    // 4. Call the AI
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    // 5. Check for ACTION commands
    if (aiText.startsWith('ACTION:ADD_SHOPPING_ITEM:')) {
      // --- HANDLE SHOPPING LIST ACTION ---
      const itemName = aiText.split(':')[2];
      const newItem = new ShoppingItem({ name: itemName });
      await newItem.save();
      res.json({ reply: `Done! I've added ${itemName} to your shopping list.` });
    } else {
      // It's a normal chat message. Just send it.
      res.json({ reply: aiText });
    }

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ message: "Error talking to the AI." });
  }
});

// ... (imports)

// --- UPDATED: GET /api/weather (Supports Lat/Lon) ---
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!apiKey) return res.status(500).json({ message: "API Key missing" });

    // Determine URL: Use GPS if available, otherwise default to Nellore
    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=Nellore&units=metric&appid=${apiKey}`;
    }

    const response = await axios.get(url);
    
    const weatherData = {
      temp: Math.round(response.data.main.temp),
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      city: response.data.name
    };

    res.json(weatherData);

  } catch (err) {
    console.error("Weather Error:", err.message);
    res.status(500).json({ message: "Error fetching weather" });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Smart Shelf Backend running → http://localhost:${PORT}`);
});
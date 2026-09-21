import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// --- MUI Imports ---
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Snackbar,
  Tooltip,
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';

// --- Backend URL ---
const API_URL = "https://smart-shelf-backend-lbmm.onrender.com/api";

// --- Recipe Parser ---
const parseRecipeText = (text) => {
  try {
    const titleMatch = text.match(/TITLE:(.*)/i);
    const ingredientsMatch = text.match(/INGREDIENTS:([\s\S]*?)ESTIMATED TIME:/i);
    const timeMatch = text.match(/ESTIMATED TIME:(.*)/i);
    const stepsMatch = text.match(/(STEPS:|INSTRUCTIONS:)([\s\S]*?)NUTRITION:/i);
    const nutritionMatch = text.match(/NUTRITION:(.*)/i);

    if (!titleMatch || !ingredientsMatch || !stepsMatch) return null;

    return {
      title: titleMatch[1].trim(),
      ingredients: ingredientsMatch[1].trim(),
      estimatedTime: timeMatch ? timeMatch[1].trim() : 'N/A',
      steps: stepsMatch[2].trim(),
      nutrition: nutritionMatch ? nutritionMatch[1].trim() : 'N/A',
    };
  } catch (err) {
    console.error("Parser Error:", err);
    return null;
  }
};

export default function AiChatBox({ largeMode = false }) {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hello! How can I help with your pantry today?" }
  ]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const scrollRef = useRef();

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // --- Send Message ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { role: 'user', text: chatMessage };
    setChatHistory((prev) => [...prev, userMsg]);

    const messageToSend = chatMessage;
    setChatMessage('');

    try {
      const response = await axios.post(`${API_URL}/ai/chat`, {
        message: messageToSend
      });

      const aiMsg = { role: 'ai', text: response.data.reply };
      setChatHistory((prev) => [...prev, aiMsg]);

    } catch (err) {
      console.error("AI Error:", err);
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', text: "Oops, I'm having trouble thinking right now." }
      ]);
    }
  };

  // --- Save Recipe ---
  const handleSaveRecipe = async (text) => {
    const recipe = parseRecipeText(text);
    if (!recipe) {
      setSnackbarMessage("Couldn't parse recipe.");
      setSnackbarOpen(true);
      return;
    }

    try {
      // Removed /api prefix to match your backend logic
      await axios.post(`${API_URL}/recipes`, recipe);
      setSnackbarMessage(`Saved: ${recipe.title}`);
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage("Error saving recipe.");
      setSnackbarOpen(true);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: "1px solid #e5e5e5",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid #eee", background: "#fff" }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          SmartShelf AI
        </Typography>
      </Box>

      {/* Chat Area */}
      <Box
        ref={scrollRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          bgcolor: "#fafafa",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {chatHistory.map((msg, idx) => {
          const isUser = msg.role === "user";
          // Simple check for recipe
          const upper = msg.text.toUpperCase();
          const isRecipe = upper.includes("TITLE:") && upper.includes("STEPS:");

          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                alignItems: "flex-end",
              }}
            >
              {/* Save icon */}
              {!isUser && isRecipe && (
                <Tooltip title="Save recipe">
                  <IconButton
                    size="small"
                    sx={{ mr: 0.5 }}
                    onClick={() => handleSaveRecipe(msg.text)}
                  >
                    <BookmarkAddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* Chat bubble with HARDCODED colors */}
              <Box
                sx={{
                  maxWidth: "80%",
                  // --- THE FIX: Hex codes instead of variables ---
                  bgcolor: isUser ? "#ff9800" : "#ffffff",
                  color: isUser ? "#ffffff" : "#333333", 
                  // ---------------------------------------------
                  p: 1.2,
                  px: 1.8,
                  borderRadius: 3,
                  borderBottomRightRadius: isUser ? 0 : 3,
                  borderBottomLeftRadius: isUser ? 3 : 0,
                  whiteSpace: "pre-wrap",
                  boxShadow: isUser ? 1 : 1,
                }}
              >
                {msg.text}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleChatSubmit}
        sx={{
          display: "flex",
          p: 1.5,
          borderTop: "1px solid #eee",
          background: "#fff",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="Ask me anything..."
        />

        <IconButton
          type="submit"
          sx={{ 
            // --- THE FIX: Hex codes ---
            bgcolor: "#ff9800", 
            color: "#fff",
            "&:hover": { bgcolor: "#f57c00" } 
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Paper>
  );
}
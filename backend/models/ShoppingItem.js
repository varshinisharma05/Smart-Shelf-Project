import mongoose from "mongoose";

const ShoppingItemSchema = new mongoose.Schema({
  name: String,
});

export default mongoose.model("ShoppingItem", ShoppingItemSchema);

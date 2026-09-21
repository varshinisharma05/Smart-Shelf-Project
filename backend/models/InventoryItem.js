import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema({
  name: String,
  expiryDate: String,
});

export default mongoose.model("InventoryItem", InventoryItemSchema);

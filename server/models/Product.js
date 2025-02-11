const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  condition: { type: String, required: true },
  price: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: String, required: true },
  category: { type: String, required: true }
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;

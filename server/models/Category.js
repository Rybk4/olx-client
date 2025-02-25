const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  photo: { type: String }, //фото товара
  title: { type: String, required: true }, //заголовок объявы 
  
});

const Product = mongoose.model("Category", CategorySchema);

module.exports = Product;

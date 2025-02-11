const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

 
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении товаров" });
  }
});

 
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: "Товар не найден" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении товара" });
  }
});
 
 
router.post("/", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: "Ошибка при добавлении товара" });
  }
});

 
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Товар не найден" });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: "Ошибка при обновлении товара" });
  }
});

 
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ id: req.params.id });
    if (!deletedProduct) return res.status(404).json({ error: "Товар не найден" });
    res.json({ message: "Товар удален" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении товара" });
  }
});

module.exports = router;

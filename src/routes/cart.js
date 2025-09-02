import { Router } from "express";
import Cart from "../models/cart.js";

export const routerCart = Router();

routerCart.get("/cart", async (req, res) => {
  try {
    const cart = await Cart.findOne({ owner: req.userId }).populate("products");
    res.status(200).json(cart.products);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});

routerCart.post("/cart", async (req, res) => {
  try {
    const { id } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { owner: req.userId },
      { $push: { products: id } },
      { new: true, upsert: true }
    ).populate("products");
    res.status(201).json(cart.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

routerCart.delete("/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findOne({ owner: req.userId });
    const index = cart.products.findIndex((el) => el == id);
    if (index != -1) {
      cart.products.splice(index, 1);
      await cart.save();
    }
    const updCart = await cart.populate("products");
    res.status(200).json(updCart.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

routerCart.delete("/cart/all/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findOneAndUpdate(
      { owner: req.userId },
      { $pull: { products: id } },
      { new: true }
    ).populate("products");

    res.status(200).json(cart.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

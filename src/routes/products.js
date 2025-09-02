import { Router } from "express";
import Product from "../models/product.js";

export const routerProduct = Router();

routerProduct.get("/product", async (req, res) => {
  try {
    let products = await Product.find();
    if (req.query?.min) {
      products = products.filter((product) => product.price >= req.query.min);
    }
    if (req.query?.max) {
      products = products.filter((product) => product.price <= req.query.max);
    }
    if (req.query?.category) {
      products = products.filter((product) => product.category == req.query.category);
    }
    if (req.query?.countOfChildren) {
      products = products.filter((product) => product.countOfChildren == req.query.countOfChildren);
    }
    res.send(products);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

routerProduct.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).send(product);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

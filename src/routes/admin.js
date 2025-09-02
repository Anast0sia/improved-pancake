import { Router } from "express";
import multer from "multer";
import { isAdmin } from "../middlewares/auth.js";
import Product from "../models/product.js";

export const routerAdmin = Router();
const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });

routerAdmin.post("/product", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const product = req.body;
    const newProduct = await Product.create({
      ...product,
      picture: `uploads/${req.file.filename}`,
    });
    res.status(201).send(newProduct);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

routerAdmin.patch("/product", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const product = req.body;
    const updateData = { ...product };
    if (req.file) {
      updateData.picture = `uploads/${req.file.filename}`;
    }
    const updProduct = await Product.findByIdAndUpdate(
      product._id,
      updateData,
      { new: true, runValidators: true }
    );
    res.status(200).send(updProduct);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

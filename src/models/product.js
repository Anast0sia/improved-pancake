import { model, Schema } from "mongoose";

const productSchema = new Schema({
  category: {
    type: String,
    required: [true, "Категория обязательна"],
    trim: true,
  },
  name: {
    type: String,
    required: [true, "Название товара обязательно"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Цена обязательна"],
  },
  countOfChildren: {
    type: Number,
    default: 0
  },
  picture: {
    type: String
  }
});

const Product = model("product", productSchema);
export default Product;

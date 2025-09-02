import { model, Schema } from "mongoose";

const cartSchema = new Schema({
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "product",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

const Cart = model("cart", cartSchema);
export default Cart;

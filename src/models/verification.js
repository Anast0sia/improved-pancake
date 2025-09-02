import { model, Schema } from "mongoose";

const verificationSchema = new Schema({
  email: {
    type: String,
    unique: [true, "Email должен быть уникальным"],
  },
  code: Number,
  createdAt: Date,
});

verificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const Verification = model("verification", verificationSchema);
export default Verification;

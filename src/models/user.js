import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email обязателен"],
      unique: [true, "Email должен быть уникальным"],
      trim: true,
      validate: {
        validator: (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
        message: "Email не валиден",
      },
    },
    password: {
      type: String,
      select: false,
      minlength: [6, "Пароль должен содержать не менее 6 символов"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    refresh: {
      type: String,
      default: null,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

export const User = model("user", userSchema);

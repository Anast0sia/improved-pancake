import mongoose from "mongoose";
import express from "express";
import "dotenv/config";
import { routerPost } from "./routes/posts.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { routerProduct } from "./routes/products.js";
import { verification } from "./middlewares/auth.js";
import { routerUser } from "./routes/user.js";
import { routerVer } from "./routes/verification.js";
import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { User } from "./models/user.js";
import { routerAdmin } from "./routes/admin.js";
import { routerCart } from "./routes/cart.js";

const app = express();

const { ADDRESS_DB } = process.env;

app.use("/api/uploads", express.static("uploads"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://192.168.1.65:5173", "http://localhost:5173", "https://special-doodle-pi.vercel.app"],
  })
);

passport.use(
  new Strategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, Profiler, done) => {
      try {
        const existUser = await User.findOne({ email: Profiler.emails[0].value });
        if (existUser) {
          return done(null, existUser);
        }
        const newUser = await User.create({
          email: Profiler.emails[0].valueч,
        });
        done(null, newUser);
      } catch (err) {
        done(err);
      }
    }
  )
);

app.use(passport.initialize());

app.use("/api", routerPost);
app.use("/api", routerProduct);
app.use("/api", routerUser);
app.use("/api", routerVer);
app.use(verification);
app.use("/api", routerCart);
app.use("/api", routerAdmin);

const { PORT } = process.env;

const run = async () => {
  try {
    await mongoose.connect(ADDRESS_DB);
    app.listen(PORT, () => {
      console.log("Started on", PORT);
    });
  } catch (error) {
    console.error(error);
  }
};

run();

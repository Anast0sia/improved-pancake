import { Router } from "express";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import { verification, verifyCode } from "../middlewares/auth.js";
import bcrypt from "bcryptjs";
import passport from "passport";

export const routerUser = Router();

routerUser.post("/users", verifyCode, async (req, res) => {
  try {
    const { JWT, REFRESH } = process.env;
    const user = req.body;
    const newUser = await User.create(user);
    const token = jwt.sign({ id: newUser._id }, JWT, { expiresIn: "1h" });
    const refresh = jwt.sign({ id: newUser._id }, REFRESH, { expiresIn: "30d" });
    newUser.refresh = refresh;
    await newUser.save();
    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .cookie("refreshToken", refresh, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .send(newUser);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

routerUser.post("/users/login", verifyCode, async (req, res) => {
  try {
    const { JWT, REFRESH } = process.env;
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .send({ error: "Такого пользователя не существует. Попробуйте зарегистрироваться" });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ error: "Пароль не совпадает" });
    }
    const token = jwt.sign({ id: user._id }, JWT, { expiresIn: "1h" });
    const refresh = jwt.sign({ id: user._id }, REFRESH, { expiresIn: "30d" });
    user.refresh = refresh;
    await user.save();
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .cookie("refreshToken", refresh, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .json(user);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

routerUser.post("/users/logout", async (req, res) => {
  try {
    res
      .clearCookie("token", { httpOnly: true })
      .clearCookie("refreshToken", { httpOnly: true })
      .send({ message: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Произошла ошибка выхода из аккаунта" });
  }
});

routerUser.get("/users/me", verification, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).send(user);
  } catch (err) {
    res.status(401).send();
  }
});

routerUser.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  async (req, res) => {
    const { JWT, REFRESH } = process.env;
    const user = req.user;
    const token = jwt.sign({ id: user._id }, JWT, { expiresIn: "1h" });
    const refresh = jwt.sign({ id: user._id }, REFRESH, { expiresIn: "30d" });
    user.refresh = refresh;
    await user.save();
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .cookie("refreshToken", refresh, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .redirect("https://special-doodle-pi.vercel.app/");
  }
);

routerUser.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

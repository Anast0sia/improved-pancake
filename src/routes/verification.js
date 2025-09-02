import { Router } from "express";
import Verification from "../models/verification.js";
import nodemailer from "nodemailer";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";

export const routerVer = Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.GOOGLE_PASSWORD,
  },
});

routerVer.post("/code", async (req, res) => {
  transporter.verify((error, success) => {
    if (error) console.log("SMTP ошибка:", error);
    else console.log("SMTP готов к отправке");
  });
  const { email, step, password } = req.body;
  if (step == "login") {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Аккаунта не существует, либо пароль не совпадает." });
    }
  }
  if (step == "register") {
    const user = await User.findOne({ email });
    if (user) return res.status(401).json({ error: "Такой аккаунт уже существует." });
  }
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  await Verification.findOneAndUpdate(
    { email },
    { code, createdAt: new Date() },
    { new: true, runValidators: true, upsert: true }
  );
  try {
    await transporter.sendMail({
      from: `"Деревце любви" <${process.env.EMAIL}>`,
      to: email,
      subject: "Код подтверждения",
      text: `${code} - ваш код подтверждения. Не сообщайте его никому.`,
    });
    res.json({ message: "ok" });
  } catch (err) {
    console.error(`Ошибка отправки на ${email}:`, err);
    res.status(500).json({ error: "Не удалось отправить письмо" });
  }
});

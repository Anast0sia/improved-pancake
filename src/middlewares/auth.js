import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import Verification from "../models/verification.js";

export async function verification(req, res, next) {
  try {
    const { JWT, REFRESH } = process.env;
    const token = req.cookies.token;
    jwt.verify(token, JWT, async (err, payload) => {
      if (err?.name == "JsonWebTokenError" || err?.name == "TokenExpiredError") {
        const refresh = req.cookies.refreshToken;
        if (!refresh) return res.status(401).send({ message: "Вам нужно войти в аккаунт" });
        const refreshPayload = jwt.verify(refresh, REFRESH);
        const user = await User.findById(refreshPayload.id);
        if (!user || !user.refresh || user.refresh !== refresh) {
          return res.status(403).send({ message: "Неверный refresh-токен" });
        }
        const newToken = jwt.sign({ id: user._id }, JWT, { expiresIn: "1h" });
        res.cookie("token", newToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        });
        req.userId = refreshPayload.id;
        return next();
      }
      req.userId = payload.id;
      return next();
    });
  } catch (err) {
    console.log(err.message);
    return res.send();
  }
}

export async function verifyCode(req, res, next) {
  const { email, code } = req.body;
  const record = await Verification.findOne({ email, code });
  if (!record) return res.status(401).json({ error: "Код неверный либо устарел" });
  await record.deleteOne();
  next();
}

export async function isAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Нет доступа" });
    }
    if (user.role != "admin") {
      return res.status(403).json({ error: "Нет доступа" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "" });
  }
}

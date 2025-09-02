import { Router } from "express";

export const routerPost = Router();
const { API_KEY_VK } = process.env;

routerPost.get("/posts", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.vk.ru/method/wall.get?domain=derevce_lubvi&count=2&access_token=${API_KEY_VK}&v=5.199`
    );
    const data = await response.json();
    res.send({
      photo1: data.response?.items[0].attachments[0]?.photo?.orig_photo.url || null,
      text1: data.response?.items[0].text || null,
      link1: `https://vk.com/wall${data.response?.items[0].attachments[0]?.photo?.owner_id}_${data.response?.items[0].id}`,
      photo2: data.response?.items[1].attachments[0]?.photo.orig_photo.url || null,
      text2: data.response?.items[1].text || null,
      link2: `https://vk.com/wall${data.response?.items[1].attachments[0]?.photo?.owner_id}_${data.response?.items[1].id}`,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

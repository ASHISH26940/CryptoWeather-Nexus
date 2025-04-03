import express from 'express';
import {getNews} from "../controllers/news/news"
const router= express.Router();
// ✅ Enable JSON body parsing
router.use(express.json());

router.get("/current_news",getNews);

export default router;
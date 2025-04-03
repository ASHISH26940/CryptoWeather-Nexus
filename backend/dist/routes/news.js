"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const news_1 = require("../controllers/news/news");
const router = express_1.default.Router();
// ✅ Enable JSON body parsing
router.use(express_1.default.json());
router.get("/current_news", news_1.getNews);
exports.default = router;

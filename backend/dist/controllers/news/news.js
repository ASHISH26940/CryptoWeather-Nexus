"use strict";
// https://newsdata.io/api/1/latest?apikey=pub_77991924f6da9c27215d6334eb8c52985f0d5&language=en
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNews = getNews;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
function getNews(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (process.env.NEWS_API === undefined) {
                throw new Error("API key not found");
            }
            const key = process.env.NEWS_API;
            if (!key) {
                res.status(400).json({ message: "API key not found" });
                throw new Error("API key not found");
            }
            console.log(key);
            const newsData = yield axios_1.default.get(`https://newsdata.io/api/1/latest?apikey=${key}&language=en`);
            if (!newsData) {
                res.status(400).json({ message: "News data not found" });
                throw new Error("News data not found");
            }
            const result = newsData.data;
            res.status(200).json({
                message: "News data found",
                data: result
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}

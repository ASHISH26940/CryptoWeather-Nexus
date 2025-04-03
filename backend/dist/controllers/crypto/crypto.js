"use strict";
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
exports.getCryptoPrice = getCryptoPrice;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
function getCryptoPrice(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (process.env.CRYPTO_API === undefined) {
                throw new Error("API key not found");
            }
            const key = process.env.CRYPTO_API;
            console.log(key);
            const crypto = yield axios_1.default.get(`https://rest.coincap.io/v3/assets?apiKey=${key}`);
            if (!crypto) {
                res.status(400).json({ message: "Crypto data not found" });
                throw new Error("Crypto data not found");
            }
            const data = crypto.data.data;
            console.log(typeof data);
            res.status(200).json({
                message: "Crypto data found",
                data: data
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}

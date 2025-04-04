"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = require("../controllers/crypto/crypto");
const router = express_1.default.Router();
// ✅ Enable JSON body parsing
router.use(express_1.default.json());
router.get("/currencies", crypto_1.getCryptoPrice);
exports.default = router;

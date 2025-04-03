"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const weather_1 = require("../controllers/weather/weather");
const router = express_1.default.Router();
router.post("/location/lat_lon", weather_1.geoLoaction);
exports.default = router;

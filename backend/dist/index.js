"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("./routes/crypto"));
const news_1 = __importDefault(require("./routes/news"));
const weather_1 = require("./controllers/weather/weather");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: '*',
}));
app.use("/crypto", crypto_1.default);
app.use("/news", news_1.default);
app.get('/', (req, res) => {
    res.send('Hello World!');
    console.log('Hello World!');
});
app.post("/weather/location/lat_lon", weather_1.geoLoaction);
app.listen(3001, () => {
    console.log('Server is running on port 3000');
});

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
exports.geoLoaction = geoLoaction;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
function geoLoaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { location, limit } = req.body;
            if (!location) {
                res.status(400).json({ message: "Location not found" });
                throw new Error("Location not found");
            }
            if (process.env.WEATHER_API === undefined) {
                throw new Error("API key not found");
            }
            const key = process.env.WEATHER_API;
            console.log(key);
            const exactLocation = yield axios_1.default.get(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${key}`);
            if (!exactLocation) {
                res.status(400).json({ message: "Location not found" });
                throw new Error("Location not found");
            }
            const data = exactLocation.data[0];
            const lat = data.lat;
            const lon = data.lon;
            console.log(lat, lon);
            const weatherData = yield axios_1.default.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`);
            if (!weatherData) {
                res.status(400).json({ message: "Weather data not found" });
                throw new Error("Weather data not found");
            }
            const weather = weatherData.data;
            console.log(weather);
            const weatherDetails = {
                weather: {
                    main: weather.weather[0].main,
                    description: weather.weather[0].description,
                    icon: weather.weather[0].icon
                },
                main: {
                    temp: weather.main.temp,
                    feels_like: weather.main.feels_like,
                    temp_min: weather.main.temp_min,
                    temp_max: weather.main.temp_max,
                    pressure: weather.main.pressure,
                    humidity: weather.main.humidity
                },
                wind: {
                    speed: weather.wind.speed,
                    deg: weather.wind.deg
                }
            };
            res.status(200).json({
                message: "Location found",
                weather: weatherDetails
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: "Internal server error"
            });
        }
    });
}

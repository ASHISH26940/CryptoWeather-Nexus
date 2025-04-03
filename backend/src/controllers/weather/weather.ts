import type { Response,Request } from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

interface geoLocationType{
    body:{
        location:string,
        limit?:number
    }
}
interface WeatherDetails {
    weather: {
        main: string;
        description: string;
        icon: string;
    };
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
    };
    wind: {
        speed: number;
        deg: number;
    };
}



export async function geoLoaction(req:geoLocationType,res:Response){
    try{
        const {location,limit} = req.body;
        if(!location){
            res.status(400).json({message:"Location not found"});
            throw new Error("Location not found");
        }
        if(process.env.WEATHER_API===undefined){
            throw new Error("API key not found");
        }
        const key= process.env.WEATHER_API;
        console.log(key);
        
        const exactLocation=await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${key}`) as unknown as any;
        if(!exactLocation){
            res.status(400).json({message:"Location not found"});
            throw new Error("Location not found");
        }
        const data=exactLocation.data[0];
        const lat= data.lat;
        const lon= data.lon;
        console.log(lat,lon);
        
        const weatherData=await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`) as unknown as any;
        if(!weatherData){
            res.status(400).json({message:"Weather data not found"});
            throw new Error("Weather data not found");
        }
        const weather=weatherData.data;
        console.log(weather);
        
        const weatherDetails:WeatherDetails={
            weather:{
                main:weather.weather[0].main,
                description:weather.weather[0].description,
                icon:weather.weather[0].icon
            },
            main:{
                temp:weather.main.temp,
                feels_like:weather.main.feels_like,
                temp_min:weather.main.temp_min,
                temp_max:weather.main.temp_max,
                pressure:weather.main.pressure,
                humidity:weather.main.humidity
            },
            wind:{
                speed:weather.wind.speed,
                deg:weather.wind.deg
            }
        }
        
        
        res.status(200).json({
            message:"Location found",
            weather:weatherDetails
        });
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal server error"
        });
    }
}
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import WeatherRouter from "./routes/weather";
import CryptoRouter from "./routes/crypto";
import getNews from "./routes/news"
import { geoLoaction } from './controllers/weather/weather';
const app = express();
app.use(express.json());
app.use(cors(
    {
        origin: '*',
    }
));

app.use("/crypto",CryptoRouter);
app.use("/news",getNews);
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
    console.log('Hello World!');
    
});


app.post("/weather/location/lat_lon",geoLoaction);



app.listen(3001, () => {
    console.log('Server is running on port 3000');
});
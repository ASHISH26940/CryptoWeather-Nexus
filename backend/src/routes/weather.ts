import express from 'express';
import {geoLoaction} from "../controllers/weather/weather"
const router= express.Router();
// ✅ Enable JSON body parsing
router.use(express.json());


router.post("/location/lat_lon",geoLoaction);

export default router;
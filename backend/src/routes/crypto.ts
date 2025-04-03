import express from 'express';
import {getCryptoPrice} from "../controllers/crypto/crypto"
const router= express.Router();
// ✅ Enable JSON body parsing
router.use(express.json());


router.get("/currencies",getCryptoPrice);

export default router;
import type { Response,Request } from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();



export async function getCryptoPrice(req:Request,res:Response){
    try{
        if(process.env.CRYPTO_API===undefined){
            throw new Error("API key not found");
        } 
        const key= process.env.CRYPTO_API;
        console.log(key);
        const crypto=await axios.get(`https://rest.coincap.io/v3/assets?apiKey=${key}`) as unknown as any;    
        if(!crypto){
            res.status(400).json({message:"Crypto data not found"});
            throw new Error("Crypto data not found");
        }
        const data=crypto.data.data;
        console.log(typeof data);
        res.status(200).json({
            message:"Crypto data found",
            data:data
        });
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
}
// https://newsdata.io/api/1/latest?apikey=pub_77991924f6da9c27215d6334eb8c52985f0d5&language=en

import type { Response,Request } from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

interface NewsArticle {
    article_id: string;
    title: string;
    link: string;
    keywords: string[] | null;
    creator: string[] | null;
    video_url: string | null;
    description: string;
    content: string;
    pubDate: string;
    pubDateTZ: string;
    image_url: string | null;
    source_id: string;
    source_priority: number;
    source_name: string;
    source_url: string;
    source_icon: string | null;
    language: string;
    country: string[];
    category: string[];
    ai_tag?: string;
    sentiment?: string;
    sentiment_stats?: string;
    ai_region?: string;
    ai_org?: string;
    duplicate: boolean;
}


type NewsResponse =NewsArticle[];


export async function getNews(req:Request,res:Response){
    try{
        if(process.env.NEWS_API===undefined){
            throw new Error("API key not found");
        }
        const key= process.env.NEWS_API;
        if(!key){
            res.status(400).json({message:"API key not found"});
            throw new Error("API key not found");
        }
        console.log(key);
        const newsData=await axios.get(`https://newsdata.io/api/1/latest?apikey=${key}&language=en`) as unknown as any;
        if(!newsData){
            res.status(400).json({message:"News data not found"});
            throw new Error("News data not found");
        }
        const result=newsData.data as NewsResponse;
        res.status(200).json({
            message:"News data found",
            data:result
        });
        
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal server error"});
    }
}
import gemini_ai from "../config/ai.js";
import Thumbs from "../models/thumbnail.js"
// import {GenerateContentConfig} from '@google/genai'
import path from 'path';
import fs from 'fs'
import {v2 as cloudinary} from 'cloudinary'

import { getDummyGeminiImageResponse } from "./dummy_thumbnail.js";

export const generate_thumbs=async (req,resp)=>{
    try {
        console.log("starting of gen call ok")
         
        const userid=req.session.userId;

        const {title, description, style, aspectRatio, colorScheme, textOverlay, userPrompt}=req.body;

        const thumbnail= await Thumbs.create({
            userID:userid ,title, description, style,
            aspectRatio, colorScheme, textOverlay, userPrompt
        });

        console.log("upto db call ok")

        // image generation work...............................................
        const gemini_model='gemini-3-pro-image-preview';

        const generateConfig={
            maxOutputTokens:32768,
            temperature:1,
            topP:0.95,
            responseModalities:['IMAGE'],
            imageConfig:{
                aspectRatio:aspectRatio || "16:9",
                imageSize:'1K'
            }
        }

        let prompt= `create a ${style} thumbnail for ${title}`;

        if(colorScheme) prompt+=` use a ${colorScheme} as color scheme`;
        if(userPrompt) prompt+=` additional details: ${userPrompt}`;
        prompt+=` .The thumbnail should be ${aspectRatio} , visually stunnning, and designed
        to maximize click through rate. Make it bold, proffessional,
        and impossible to ignore. `;

        //..............LLM Call........................................

        const response = await gemini_ai.models.generateContent({
            model:gemini_model,
            contents:[prompt],
            config:generateConfig
        })

        // const response = gemini_ai.models.generateImages({
        //     model: 'imagen-4.0-generate-001',
        //     prompt: 'Robot holding a red skateboard',
        //     config: {
        //         numberOfImages: 1,
        //         includeRaiReason: true,
        //     }
        // });


        // //..........dummy image to test other function while api does not work
        // const response = getDummyGeminiImageResponse();

        console.log("upto llm call ok")


        // Check if the response is valid
        if (!response?.candidates?.[0]?.content?.parts) {
            throw new Error("Unexpected response");
        }

        const parts = response.candidates[0].content.parts;

        let finalBuffer = null;

        for (const part of parts) {
            if (part.inlineData) {
                finalBuffer = Buffer.from(part.inlineData.data, "base64");
            }
        }

        const filename = `final-output-${Date.now()}.png`;
        const filePath = path.join("images", filename);

        fs.mkdirSync("images", { recursive: true });

        // Write the final image to the file
        fs.writeFileSync(filePath, finalBuffer);

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "image"
        });

        thumbnail.imageUrl = uploadResult.url;
        thumbnail.isGenerating = false;
        await thumbnail.save();

        resp.json({
            message: "Thumbnail Generated",
            thumbnail:thumbnail
        });

        // remove image file from disk
        fs.unlinkSync(filePath);

    } catch (error) {
        console.log(error.message)
        resp.status(500).json({message: error.message});
    }
}


export const delete_thumbs=async (req,resp)=>{

    try {
        const {id}= req.params;
        const {userID}=req.session;

        await Thumbs.findByIdAndDelete({_id: id,userID});

        resp.json({
            'message':" thumbnail is deleted "
        })

    } catch (error) {
        console.log(error.message)
        resp.status(500).json({
            'message': error.message
        })
    }
}
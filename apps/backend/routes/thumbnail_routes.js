import express from 'express';
import { generate_thumbs, delete_thumbs } from '../controllers/thumbs.js';


const thumbnail_router=express.Router();

thumbnail_router.post('/generate',generate_thumbs);
thumbnail_router.delete('/delete/:id',delete_thumbs);

export default thumbnail_router;
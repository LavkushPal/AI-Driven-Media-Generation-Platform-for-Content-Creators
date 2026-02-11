import express from 'express';
import { generate_thumbs, delete_thumbs } from '../controllers/thumbs.js';
import protect from '../midddlewares/auth_middles.js'
import thumbnailRateLimit from '../midddlewares/thumbnail_limiter.js'


const thumbnail_router=express.Router();

thumbnail_router.post('/generate',thumbnailRateLimit, generate_thumbs);
thumbnail_router.delete('/delete/:id',protect, delete_thumbs);

export default thumbnail_router;
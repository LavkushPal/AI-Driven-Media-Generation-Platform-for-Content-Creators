import express from 'express'
import { register_user, login_user, logout_user, verify_user } from "../controllers/auth";
import  protect from '../controllers/auth'

const auth_router=express.Router();

auth_router.post('/register',register_user);
auth_router.post('/login',login_user);
auth_router.post('/logout',protect,logout_user);

router.get('/verify',protect,verify_user);


export default auth_router;
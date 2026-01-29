import express from 'express'
import 'dotenv/config'
import {connectDB} from './config/db.js'

const app=express();
await connectDB();


app.get('/',(req,resp)=>{
    resp.send("fine: server is running ");
})

const port=process.env.PORT || 3000;
app.listen(port,()=>console.log("server is running on :"+port));
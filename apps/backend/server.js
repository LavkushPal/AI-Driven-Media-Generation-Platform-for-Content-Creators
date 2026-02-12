import express from 'express'
import 'dotenv/config'
import {connectDB} from './config/db.js'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import auth_router from './routes/auth_routes.js'
import cors from 'cors'
import thumbnail_router from './routes/thumbnail_routes.js'

const app=express();
await connectDB();

//............middlewares.................


app.use(cors({
    origin: ['http://localhost:5173',"https://media-theta-five.vercel.app"],
    credentials:true
}));


// app.options("*", cors({
//   origin: ["https://media-gen-ai.vercel.app"],
//   credentials: true,
// }));

app.set("trust proxy", 1);

app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'node' : 'lax',
    path: "/"
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions"
  })
}));



app.get("/api/auth/me", (req, res) => {
  res.json({
    hasSession: !!req.session,
    session: req.session,
  });
});

app.use(express.json());


//............api's.................

app.use('/api/auth',auth_router); //authentication apis
// server --> routes --> middlewares --> controllers --> models


app.use('/api/thumbnail',thumbnail_router);  //thumbnail apis
// server --> routes --> controllers --> models


app.get("/api/auth/me", (req, res) => {
  res.json({
    hasSession: !!req.session,
    session: req.session,
  });
});


app.get('/',(req,resp)=>{
    resp.send(`<h1> Server is live on vercel </h1>`)
})

const port=process.env.PORT || 3000;
app.listen(port,()=>console.log("server is running on :"+ port));


//for vercel deployement
// export default app;
import mongoose from "mongoose";

export async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("mongo db is connected now");
    }
    catch(error){
        console.log("mongo db connection failed ");
        console.log(error.message)
    }
}


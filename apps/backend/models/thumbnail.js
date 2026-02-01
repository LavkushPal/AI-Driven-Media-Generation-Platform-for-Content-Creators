import mongoose from "mongoose";

const schema_thumbs= new mongoose.Schema({
    userID:{type:String,required:true},
    title:{type:String, required:true, trim:true},
    description:{type:String, trim:true},
    style:{type:String},
    aspectRatio:{type:String, enum : ["16:9","1:1","9:16"]},
    colorScheme:{type:String ,enum : ["forest","sunset","purple","neon"]},
    textOverlay:{type:Boolean, default:false},
    imageUrl:{type:String, default:''},
    userPrompt:{type:String},
    isGenerating:{type:Boolean, default:true}
})

const Thumbs=mongoose.models.Thumbs || mongoose.model("thumbnails",schema_thumbs)

export default Thumbs;
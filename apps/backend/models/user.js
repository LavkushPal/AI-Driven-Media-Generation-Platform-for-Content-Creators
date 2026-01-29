import mongoose from "mongoose";

const schema_user=new mongoose.Schema({
    name: {type:String, required:true, trim:true},
    email: {type:String, required:true, unique:true, lowercase:true},
    password:{type: String, require:true}
}, {timestamps:true} );

const User= mongoose.models.User || mongoose.model("user",schema_user);

export default User;
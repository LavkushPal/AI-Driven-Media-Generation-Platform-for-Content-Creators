import User from '../models/user.js'
import bcrypt from 'bcrypt'


//..........user registration.................
export const register_user= async (req,resp)=>{
    try{
        const {name,email,password}=req.body;
        const user=await User.findOne({email});
        if(user){
            return resp.status(400).json({
                message:'user already exists'
            })
        }

        const salt=await bcrypt.genSalt(10);
        const hashed_password= await bcrypt.hash(password,salt);

        const new_user=new User({
            name,email,password:hashed_password
        })

        console.log(new_user);

        await new_user.save();

        req.session.isLoggedIn=true;
        req.session.userId=new_user._id;

        return resp.json({
            message:"user registered successfully",
            user:{
                _id:new_user._id,
                name:new_user.name,
                email:new_user.email
            }
        })
    }
    catch(error){
        console.log(error.message)
        return resp.status(500).json({
            error:"user registration failed due to : ",
            message:error.message
        })
    }
}


//............user login............

export const login_user= async(req,resp)=>{
    try {
        const {email,password}=req.body;
        const user=await User.findOne({email});

        if(user==null){
            return resp.status(400).json({
                message:'email is not found'
            })
        }

        const check_password=await bcrypt.compare(password,user.password);
        if(!check_password){
            return resp.status(400).json({
                message:'password is not correct'
            })
        }

        req.session.isLoggedIn=true;
        req.session.userId=user._id;

        return resp.json({
            message:"user logged-in successfully",
            user:{
                _id:user._id,
                name:user.name,
                email:user.email
            }
        })

    } catch (error) {
        console.log(error.message)
        return resp.status(500).json({
            message:error.message
        })
    }
}


//............user logout............

export const logout_user= async(req,resp)=>{
    if(!req.session || !req.session.isLoggedIn) return resp.json({"message":"user is not logged in"})

    req.session.destroy((error)=>{
        if(error){
            console.log(error.message)
            return resp.status(500).json({message:error.message})
        }
    })

    return resp.json({
        message:"logged out successfully"
    })
}

//............ verify user ............

export const verify_user= async(req,resp)=>{
    try {
        const userid=req.session.userId;
        const user= await User.findById(userid).select('-password');

        if(!user) return resp.status(500).json({message:'invalid user'})

        return resp.json({user});
        
    } catch (error) {
        console.log(error.message)
        return resp.status(500).json({
            message:error.message
        })
    }
}



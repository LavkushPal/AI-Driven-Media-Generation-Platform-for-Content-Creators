
export default protect=async (req,resp,next)=>{

    const {isLoggedIn,userId}=req.session;

    if(!isLoggedIn || !userId){
        return resp.status(401).json({message:"usser is not logged in"})
    }

    next();
}



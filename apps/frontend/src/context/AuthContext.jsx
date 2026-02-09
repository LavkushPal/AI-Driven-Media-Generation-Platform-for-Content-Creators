import { createContext, useContext , useEffect, useState} from "react";
import api from '../config/api.jsx'
import toast from 'react-hot-toast'

const AuthContext= createContext()

export const AuthProvider= ({children})=>{

    const [isLoggedIn, setIsLoggedIn] =useState(false);
    const [user, setUser]=useState(null)


    const signup =async (name,email,password)=>{
        try {
            const {data} =await api.post(
                '/api/auth/register',
                {
                    'name':name,
                    'email':email,
                    'password':password
                }
            )

            if(data.user){
                setUser(data.user);
                setIsLoggedIn(true);
            }
            toast.success(data.message)

        } catch (error) {
            console.log(error.message)
            toast.error(error.message)
        }
    }

    const login =async (email,password)=>{

        try {
            const {data} =await api.post(
                '/api/auth/login',
                {
                    'email':email,
                    'password':password
                }
            )

            if(data.user){
                setUser(data.user);
                setIsLoggedIn(true);
            }
            toast.success(data.message)
            
        } catch (error) {
            console.log(error.message)
            toast.error(error.message)
        }
    }

    const logout =async ()=>{
        try {
            
            const {data} =await api.post(
                '/api/auth/logout'
            )

            setUser(null);
            setIsLoggedIn(false);
            
            toast.success(data.message)
            
        } catch (error) {
            console.log(error.message)
            toast.error(error.message)
        }
    }

    const fetchuser = async ()=>{
        try {
            const {data} =await api.get(
                '/api/auth/verify'
            )

            if(data.user){
                setUser(data.user);
                setIsLoggedIn(true);
            }
            
        } catch (error) {
            console.log(error.message)
            // toast.error(error.message)
        }
    }

    useEffect(() => {
       fetchuser();
    },[])


    const value={
        isLoggedIn, setIsLoggedIn,
        user,setUser,
        login,signup,logout
    }

    return(
        <AuthContext.Provider value={ value }>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () =>{ return useContext(AuthContext)}
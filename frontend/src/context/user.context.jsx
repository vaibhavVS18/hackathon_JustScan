import React, { createContext, useState, useEffect } from "react";
import axios from "../config/axios.js";


export const UserContext = createContext();

export const UserProvider = ({children}) =>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const token = localStorage.getItem("token");

        if(token){
            axios.get("/api/users/profile")
                .then((res)=>{
                    console.log(res.data.user);
                    setUser(res.data.user)
                })
                .catch((err)=>{
                    localStorage.removeItem("token");
                    console.log(err);
                })
                .finally(()=>{
                    setLoading(false);
                })
        }
        else{
            setLoading(false);
        }
    }, [])

    return(
        <UserContext.Provider value={{user, setUser, loading}}>
            {children}
        </UserContext.Provider>
    ); 
};
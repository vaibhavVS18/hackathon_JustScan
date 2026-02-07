import React, {createContext, useState} from "react";

export const ModalContext = createContext();

export const ModalProvider = ({children})=>{
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
        <ModalContext.Provider value={{isRegisterOpen, setIsRegisterOpen, isLoginOpen, setIsLoginOpen}}>
                {children}
        </ModalContext.Provider>
    )
}


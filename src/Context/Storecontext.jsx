import { createContext, useState } from "react";

export const Storecontext = createContext(null);

const StoreContextProvider = (props) => {

    const [size, setSize] = useState("");

    const contextValue = {
        size,
        setSize
    }

    return (
        <Storecontext.Provider value={contextValue}>
            {props.children}
        </Storecontext.Provider>
    )
}


export default StoreContextProvider;
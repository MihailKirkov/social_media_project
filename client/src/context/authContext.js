import axios from "axios";
import { createContext, useState, useEffect} from "react";

export const AuthContext = createContext()

export const AuthContextProvider = ({children})=>{
    // const [currentUser, setCurrentUser] = useState(
    //     JSON.parse(localStorage.getItem("user") || null)
    // );
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                // console.log("authContext.js fetch cur user")
                const res = await axios.get('http://localhost:8800/api/auth/current-user', {
                    withCredentials: true,
                });
                setCurrentUser(res.data);
            } catch (error) {
                console.error('Error fetching current user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const login = async(inputs)=>{
        const res = await axios.post('http://localhost:8800/api/auth/login', inputs, {
                withCredentials: true,
            });
        console.log('login authcontext');
        console.log(res.data);
        setCurrentUser(res.data);
    }

    const logout = async()=>{
        localStorage.removeItem("user");
        setCurrentUser(null);
        await axios.post("http://localhost:8800/api/auth/logout", {}, {
            withCredentials: true,
        });
        window.location.href = "/login";
    }

    // useEffect(()=>{
    //     localStorage.setItem("user", JSON.stringify(currentUser));
    // },[currentUser])

    return (
        <AuthContext.Provider value={{currentUser, login, logout, loading}}>
            {children}
        </AuthContext.Provider>
    )
};
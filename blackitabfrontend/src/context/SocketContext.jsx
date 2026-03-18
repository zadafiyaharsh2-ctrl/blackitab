import { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";
import API_URL from "../config";

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children, authUser }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (authUser) {
            const token = localStorage.getItem('token');
            if (!token) return;

            const newSocket = io(API_URL, {
                auth: { token }
            });

            setSocket(newSocket);

            newSocket.on("connect", () => {
                console.log("SocketContext: Socket connected successfully. ID:", newSocket.id);
            });

            newSocket.on("connect_error", (err) => {
                console.error("SocketContext: Connection error:", err.message);
            });

            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            return () => {
                newSocket.close();
                setSocket(null);
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

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
            console.log("SocketContext: Initializing socket for user:", authUser);
            // Some users might have _id (mongo) or id (normalized). adapt as needed.
            const userId = authUser._id || authUser.id; 
            
            console.log("SocketContext: Connecting with userId:", userId);

            const newSocket = io(API_URL, {
                query: {
                    userId: userId,
                },
            });

            setSocket(newSocket);

            newSocket.on("connect", () => {
                console.log("SocketContext: Socket connected successfully. ID:", newSocket.id);
            });

            newSocket.on("connect_error", (err) => {
                console.error("SocketContext: Connection error:", err);
            });

            newSocket.on("getOnlineUsers", (users) => {
                console.log("SocketContext: Received online users list:", users);
                setOnlineUsers(users);
            });

            return () => {
                console.log("SocketContext: Closing socket connection.");
                newSocket.close();
                setSocket(null);
            };
        } else {
            console.log("SocketContext: No authUser provided, skipping/closing socket.");
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

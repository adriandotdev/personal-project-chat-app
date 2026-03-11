import { URL } from "@/constants/url";
import { useAuthStore } from "@/store/authStore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
	socket: Socket | undefined;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketConnectionProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	// Stores
	const { userId } = useAuthStore((state) => state);

	const [socket, setSocket] = useState<Socket>();

	useEffect(() => {
		console.log(`[Socket Connection Context]: useEffect run`);

		const socketInstance = io(`http://${URL}:3000`, {
			transports: ["websocket"],
			query: {
				userId,
			},
		});

		setSocket(socketInstance);

		return () => {
			console.log("[Socket Connection Context Cleanup]: Socket Disconnected");
			socketInstance.disconnect();
		};
	}, [userId]);

	return (
		<SocketContext.Provider value={{ socket }}>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocket = () => {
	const context = useContext(SocketContext);

	if (!context) {
		throw new Error("useSocket must be used inside SocketProvider");
	}

	return context;
};

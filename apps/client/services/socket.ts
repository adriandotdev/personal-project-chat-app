import { URL } from "@/constants/url";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export const connectSocket = (userId: number) => {
	socket = io(`http://${URL}:3000`, {
		transports: ["websocket"],
		query: {
			userId,
		},
	});

	socket.on("connect", () => {
		console.log("Connected:", socket.id);
	});

	socket.on("disconnect", () => {
		console.log("Disconnected");
	});

	return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
	}
};

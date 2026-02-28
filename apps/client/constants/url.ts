import { Platform } from "react-native";

export const URL = Platform.OS === "android" ? "192.168.18.208" : "localhost";

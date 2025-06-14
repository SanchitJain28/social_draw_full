import { AuthContext } from "@/Contexts/AuthContext";
import { useContext } from "react";

export function useAuth() {
    const authContext = useContext(AuthContext);
    if(!authContext) {
        throw new Error("useAuth must be used within an AuthContext provider");
    }
    return authContext;
}
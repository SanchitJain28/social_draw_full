import { Axios } from "@/ApiFormat";
import { createContext, useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  profilePic: string;
  PhoneNo: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  refreshAccessToken: () => Promise<void>;
  getUser: () => Promise<void>;
}

// Create context with default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  authLoading: false,
  refreshAccessToken: async () => {},
  getUser: async () => {},
});

// Custom hook to use auth context


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const refreshAccessToken = async () => {
    try {
      const response = await Axios.post("/api/refresh-access-token");
      console.log(response);
      console.log("token refreshed");
    } catch (error) {
      console.log(error);
      console.log("error in refreshing token");
      throw error; // Re-throw to handle in calling function
    }
  };

  const getUser = async () => {
    setAuthLoading(true);
    try {
      const response = await Axios.get("/api/get-user");
      console.log(response.data.data)
      setUser(response.data.data);
    } catch (error) {
      console.log(error);
      try {
        await refreshAccessToken();
        const response = await Axios.get("/api/get-user");
        setUser(response.data.data);
      } catch (refreshError) {
        console.log(refreshError);
        // Clear user on authentication failure
        setUser(null);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const contextValue: AuthContextType = {
    user,
    authLoading,
    refreshAccessToken,
    getUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
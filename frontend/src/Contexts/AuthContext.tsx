import { Axios } from "@/ApiFormat";
import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

// Define user structure
type BaseUser = {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  PhoneNo?: string;
  createdAt: Date;
};

type GoogleUser = BaseUser & {
  authType: "google";
  password?: never; // Not allowed
};

type EmailUser = BaseUser & {
  authType: "email";
  password: string;
};

type HybridUser = BaseUser & {
  authType: "hybrid";
  password: string;
};

export type User = GoogleUser | EmailUser | HybridUser;

// Define context type
interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  refreshAccessToken: () => Promise<void>;
  getUser: () => Promise<void>;
  setUser: Dispatch<SetStateAction<User | null>>;
}

// Create context with a placeholder
export const AuthContext = createContext<AuthContextType>({
  user: null,
  authLoading: false,
  refreshAccessToken: async () => {},
  getUser: async () => {},
  setUser: () => {}, // ✅ dummy default function to make TS happy
});

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const refreshAccessToken = async () => {
    try {
      const response = await Axios.post("/api/refresh-access-token");
      console.log("✅ Token refreshed:", response);
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      throw error;
    }
  };

  const getUser = async () => {
    setAuthLoading(true);
    try {
      const response = await Axios.get("/api/get-user");
      setUser(response.data.data);
      console.log("👤 User fetched:", response.data.data);
    } catch (error) {
      console.log(error);
      console.warn("⚠️ Error fetching user, trying to refresh token...");
      try {
        await refreshAccessToken();
        const response = await Axios.get("/api/get-user");
        setUser(response.data.data);
      } catch (refreshError) {
        console.error("❌ Failed to refresh token:", refreshError);
        setUser(null); // Log out user
      }
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, authLoading, refreshAccessToken, getUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

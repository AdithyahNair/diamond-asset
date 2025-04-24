import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { getUser, signIn, signOut, signUp } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  walletAddress: string | undefined;
  isWalletConnected: boolean;
  isFullyAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  connectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const isWalletConnected = !!address;
  const isFullyAuthenticated = !!user && isWalletConnected;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getUser();
        setUser(currentUser || null);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await signIn(email, password);
      if (data.user) {
        setUser(data.user);
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { data, error } = await signUp(email, password);
      if (data.user) {
        setUser(data.user);
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  const connectWallet = () => {
    if (!user) {
      alert("Please login first to connect your wallet.");
      return;
    }

    if (openConnectModal) {
      openConnectModal();
    }
  };

  const value = {
    user,
    isLoading,
    walletAddress: address,
    isWalletConnected,
    isFullyAuthenticated,
    login,
    signup,
    logout,
    connectWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

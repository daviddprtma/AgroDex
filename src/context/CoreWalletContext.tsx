import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  isCoreWalletInstalled,
  connectCoreWallet,
  listenToWalletChanges,
} from "@/lib/coreWallet";

interface CoreWalletContextType {
  status: "disconnected" | "connecting" | "connected" | "error";
  address: string | null;
  chainId: string | null;
  errorMessage: string | null;
  isInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const CoreWalletContext = createContext<CoreWalletContextType | undefined>(undefined);

export function CoreWalletProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isCoreWalletInstalled());
  }, []);

  // Listen for account/chain changes when connected
  useEffect(() => {
    if (status !== "connected") return;

    const unsubscribe = listenToWalletChanges(
      (accounts) => {
        if (accounts.length === 0) {
          // Wallet disconnected or locked
          disconnect();
        } else {
          setAddress(accounts[0].toLowerCase());
        }
      },
      (newChainId) => {
        setChainId(newChainId);
      },
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const connect = useCallback(async () => {
    setErrorMessage(null);
    setStatus("connecting");

    try {
      const result = await connectCoreWallet();
      setAddress(result.address);
      setChainId(result.chainId);
      setStatus("connected");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect Core wallet");
      setStatus("error");
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setErrorMessage(null);
    setStatus("disconnected");
  }, []);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  const value: CoreWalletContextType = {
    status,
    address,
    chainId,
    errorMessage,
    isInstalled,
    isConnected,
    isConnecting,
    connect,
    disconnect,
  };

  return (
    <CoreWalletContext.Provider value={value}>
      {children}
    </CoreWalletContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCoreWallet(): CoreWalletContextType {
  const context = useContext(CoreWalletContext);
  if (context === undefined) {
    throw new Error("useCoreWallet must be used within a CoreWalletProvider");
  }
  return context;
}

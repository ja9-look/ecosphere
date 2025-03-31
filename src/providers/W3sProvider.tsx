"use client";

import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { useSession } from "next-auth/react";
import { createContext, useContext, useState, useEffect } from "react";

interface W3sContextType {
  client: W3SSdk | null;
  isInitialized: boolean;
}

const W3sContext = createContext<W3sContextType>({
  client: null,
  isInitialized: false,
});

export const useW3sContext = () => useContext(W3sContext);

export function W3sProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [client, setClient] = useState<W3SSdk | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || client) return;

    console.log("app id: ", process.env.NEXT_PUBLIC_CIRCLE_APP_ID);
    try {
      const sdk = new W3SSdk({
        appSettings: {
          appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || "",
        },
      });

      setClient(sdk);
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize W3S SDK:", error);
    }
  }, [client]);

  return (
    <W3sContext.Provider value={{ client, isInitialized }}>
      {children}
    </W3sContext.Provider>
  );
}

"use client";

import { SessionProvider } from "next-auth/react";
import { W3sProvider } from "./W3sProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <SessionProvider>
      <W3sProvider>{children}</W3sProvider>
    </SessionProvider>
  );
};

"use client";

import { useEffect, useState } from "react";
import Navbar from "../../../components/navbar/Navbar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import WalletCard from "../../../components/wallets/WalletCard";
import { WalletCardProps } from "../../../components/wallets/WalletCard";
import { Card, Sheet } from "@mui/joy";
import { CircularProgress } from "@mui/material";

export default function wallets() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<WalletCardProps[]>([]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user.userToken) {
      redirect("/marketplace");
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/wallets");

        if (response.ok) {
          const data = await response.json();
          setWallets(data.wallets);
        }
      } catch (error) {
        console.error("Error fetching wallets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  return (
    <div>
      <Navbar />
      <Sheet
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 4,
          padding: 8,
          justifyContent: "center",
          height: "100vh",
        }}
      >
        {loading && <CircularProgress size={20} />}
        {wallets.length > 0 &&
          wallets.map((wallet) => (
            <div key={wallet.id}>
              <WalletCard
                id={wallet.id}
                address={wallet.address}
                blockchain={wallet.blockchain}
                balances={wallet.balances}
                isLoading={loading}
              />
            </div>
          ))}
      </Sheet>
      {wallets.length === 0 && !loading && (
        <div>
          <h4>No wallets found</h4>
        </div>
      )}
    </div>
  );
}

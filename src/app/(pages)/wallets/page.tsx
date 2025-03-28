"use client";

import { useEffect, useState } from "react";
import Navbar from "../../../components/navbar/Navbar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import WalletCard from "../../../components/wallets/WalletCard";
import { WalletCardProps } from "../../../components/wallets/WalletCard";

export default function wallets() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<WalletCardProps[]>([]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      redirect("/");
      return;
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

  console.table(wallets);

  return (
    <div>
      <Navbar />
      <h1>Wallets</h1>
      {loading && <h4>Loading...</h4>}
      {wallets.length > 0 &&
        wallets.map(
          (wallet) => (
            console.log(typeof wallet.balances.native.amount),
            (
              <div key={wallet.walletId}>
                <WalletCard
                  key={wallet.walletId}
                  walletId={wallet.walletId}
                  address={wallet.address}
                  blockchain={wallet.blockchain}
                  balances={wallet.balances}
                  isLoading={loading}
                />
              </div>
            )
          )
        )}
    </div>
  );
}

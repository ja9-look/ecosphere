"use client";

import { redirect } from "next/navigation";
import Navbar from "../../../components/navbar/Navbar";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Sheet } from "@mui/joy";
import { CircularProgress } from "@mui/material";
import CarbonCreditCard from "../../../components/carbon-credits/CarbonCreditCard";
import { CarbonCredit } from "../../../types/types";

export default function Marketplace() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [carbonCredits, setCarbonCredits] = useState<CarbonCredit[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/marketplace");
        if (!response.ok) {
          throw new Error("Failed to fetch marketplace data");
        }
        const data = await response.json();
        setCarbonCredits(data.carbonCredits);
      } catch (error) {
        console.error("Error fetching marketplace data: ", error);
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
          flexWrap: "wrap",
          gap: 4,
          padding: 8,
          justifyContent: "center",
          height: "100vh",
        }}
      >
        {loading && <CircularProgress size={20} />}
        {carbonCredits.length > 0 &&
          [...carbonCredits].reverse().map((credit) => (
            <div key={credit.tokenId}>
              <CarbonCreditCard
                id={credit.tokenId}
                projectName={credit.metadata.projectName}
                location={credit.metadata.location}
                amount={credit.metadata.amount}
                vintage={credit.metadata.vintage}
                verificationStandard={credit.metadata.verificationStandard}
                price={credit.metadata.price}
                isVerified={credit.metadata.isVerified}
                isLoading={loading}
              />
            </div>
          ))}
        {carbonCredits.length === 0 && !loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h3>No carbon credits found</h3>
          </div>
        )}
      </Sheet>
    </div>
  );
}

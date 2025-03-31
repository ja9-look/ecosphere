"use client";

import { useSession } from "next-auth/react";
import Navbar from "../../../components/navbar/Navbar";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { CircularProgress } from "@mui/material";
import { Button, Sheet } from "@mui/joy";
import CarbonCreditCard, {
  CarbonCreditCardProps,
} from "../../../components/carbon-credits/CarbonCreditCard";
import { CarbonCredit } from "../../../types/types";

export default function CarbonCredits() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [carbonCredits, setCarbonCredits] = useState<CarbonCredit[]>([]);

  useEffect(() => {
    if (status === "unauthenticated" || !session?.user) {
      redirect("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/carbon-credits");

        if (!response.ok) {
          throw new Error("Failed to fetch carbon credits");
        }
        const data = await response.json();
        setCarbonCredits(data.carbonCredits);
      } catch (error) {
        console.error("Error fetching carbon credits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, status]);

  console.log("PAGE - carbon credits: ", carbonCredits);
  console.log(session?.user.email);
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
        {session?.user.email === "admin@carboncredit.com" && (
          <Button
            variant="solid"
            color="success"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
            }}
            onClick={() => {
              redirect("/carbon-credits/mint");
            }}
          >
            Mint Carbon Credits
          </Button>
        )}
        {loading && <CircularProgress size={20} />}
        {carbonCredits.length > 0 &&
          [...carbonCredits].map((credit) => (
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
            <p>Explore all carbon credits our Marketplace!</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

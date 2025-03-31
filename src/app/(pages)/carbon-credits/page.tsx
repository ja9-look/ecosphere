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

interface CarbonCredit {
  tokenId: string;
  metadata: {
    projectName: string;
    location: string;
    amount: number;
    vintage: number;
    verificationStandard: string;
    price: number;
    isVerified: boolean;
  };
  originalMetadataUrl: string;
}

export default function CarbonCredits() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [carbonCredits, setCarbonCredits] = useState<CarbonCredit[]>([]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
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
          gap: 4,
          padding: 8,
          justifyContent: "center",
          height: "100vh",
        }}
      >
        {session?.user.email === "mintadmin@carboncredit.com" && (
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
          carbonCredits.map((credit) => (
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
      </Sheet>
    </div>
  );
}

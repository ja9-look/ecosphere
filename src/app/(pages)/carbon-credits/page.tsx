"use client";

import { useSession } from "next-auth/react";
import Navbar from "../../../components/navbar/Navbar";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { CircularProgress } from "@mui/material";
import { Button, Sheet } from "@mui/joy";
import CarbonCreditCard from "../../../components/carbon-credits/CarbonCreditCard";
import { CarbonCredit } from "../../../types/types";
import { useW3sContext } from "../../../providers/W3sProvider";
import { NextResponse } from "next/server";

export default function CarbonCredits() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [carbonCredits, setCarbonCredits] = useState<CarbonCredit[]>([]);
  const { client, isInitialized } = useW3sContext();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
    if (status === "authenticated") {
      fetchData();
    }
  }, [session, status]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/carbon-credits");

      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch carbon credits" },
          { status: 500 }
        );
      }
      const data = await response.json();
      setCarbonCredits(data.carbonCredits);
    } catch (error) {
      console.error("Error fetching carbon credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveNFT = async (tokenId: string) => {
    try {
      setApprovingId(tokenId);
      setApprovalStatus((prev) => ({ ...prev, [tokenId]: "pending" }));

      const response = await fetch("/api/carbon-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenId,
          action: "approve",
        }),
      });

      if (!response.ok) {
        console.error("Failed to approve carbon credit");
        return;
      }

      const data = await response.json();

      if (
        data.challengeId &&
        client &&
        session?.user.userToken &&
        session?.user.encryptionKey
      ) {
        await client.setAuthentication({
          userToken: session.user.userToken,
          encryptionKey: session.user.encryptionKey,
        });

        await client.execute(data.challengeId, async (error, result) => {
          if (error) {
            console.error("Challenge execution error:", error);
            setApprovalStatus((prev) => ({ ...prev, [tokenId]: "failed" }));
            return;
          }

          if (result) {
            setApprovalStatus((prev) => ({ ...prev, [tokenId]: "success" }));
          }
        });
      }
    } catch (error) {
      setApprovalStatus((prev) => ({ ...prev, [tokenId]: "failed" }));
    } finally {
      setApprovingId(null);
    }
  };

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
                onApprove={handleApproveNFT}
                approvingId={approvingId}
                approvalStatus={approvalStatus}
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

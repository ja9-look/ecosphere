"use client";

import { redirect, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { use, useEffect, useState } from "react";
import { Button, Sheet, Typography } from "@mui/joy";
import { CircularProgress } from "@mui/material";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { useW3sContext } from "../../../../../providers/W3sProvider";
import Navbar from "../../../../../components/navbar/Navbar";

export default function Purchase() {
  const pathName = usePathname();
  const id = pathName.split("/").slice(-2)[0];
  const { data: session, status } = useSession();
  const { client, isInitialized } = useW3sContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [session, client, isInitialized]);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const fetchSwapDetails = await fetch(
        `/api/carbon-credits/${id}/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "getDetails",
          }),
        }
      );
      const swapData = await fetchSwapDetails.json();
      if (swapData?.challengeId) {
        await client?.execute(swapData.challengeId, async (error, result) => {
          if (error) {
            setError(`Error: ${error.message || "PIN setup failed"}`);
            return;
          }

          if (result) {
            console.log("challengeId: ", swapData.challengeId);
            // await fetch(`/api/carbon-credits/${id}/purchase`, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify({
            //         action: "executeSwap",
            //         tokenId: id,
            //         price: swapData.price,
            //         seller: swapData.seller,
            //     })
            // }).then((response) => {
            //     if(response.ok) {
            //         redirect("/carbon-credits");
            //     } else {
            //         setError("Failed to execute swap");
            //     }
            // });
            // setLoading(false);
          }
          setLoading(false);
        });
      }
    } catch (error) {
      console.error("Error fetching swap details:", error);
      setError("Failed to fetch swap details");
      setLoading(false);
    }
  };
  return (
    <div>
      <Navbar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "md",
            boxShadow: "md",
            p: 4,
            maxWidth: "500px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            level="h3"
            sx={{ mb: 3 }}
          >
            Mint Carbon Credits
          </Typography>

          <Button
            variant="solid"
            color="primary"
            sx={{ width: "50%", mb: 2 }}
            onClick={handlePurchase}
            disabled={loading}
            endDecorator={loading ? <CircularProgress size={24} /> : null}
          >
            {loading ? "Processing..." : "Purchase Carbon Credit"}
          </Button>
        </Sheet>
      </div>
    </div>
  );
}

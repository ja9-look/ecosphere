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
    if (
      status === "unauthenticated" ||
      !client ||
      !session?.user?.userToken ||
      !session?.user?.encryptionKey
    ) {
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
      console.log("swapData: ", swapData.challengeId);
      if (swapData.challengeId && client && session) {
        await client.setAuthentication({
          userToken: session.user.userToken as string,
          encryptionKey: session.user.encryptionKey as string,
        });

        await client.execute(swapData.challengeId, async (error, result) => {
          if (error) {
            setError(`Error: ${error.message || "PIN setup failed"}`);
            return;
          }

          if (result) {
            await fetch(`/api/carbon-credits/${id}/purchase`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "executeSwap",
                tokenId: id,
                price: swapData.price,
                seller: swapData.seller,
              }),
            }).then((response) => {
              if (response.ok) {
                redirect("/carbon-credits");
              } else {
                setError("Failed to execute swap");
              }
            });
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
            Purchase Carbon Credit
          </Typography>

          <Button
            variant="solid"
            color="success"
            sx={{ width: "50%", mb: 2 }}
            onClick={handlePurchase}
            disabled={loading}
            endDecorator={loading ? <CircularProgress size={24} /> : null}
          >
            {loading ? "Processing..." : "Buy"}
          </Button>
        </Sheet>
      </div>
    </div>
  );
}

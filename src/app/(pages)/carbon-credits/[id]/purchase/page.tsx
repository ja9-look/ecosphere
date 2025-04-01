"use client";

import { redirect, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button, Sheet, Typography } from "@mui/joy";
import { CircularProgress } from "@mui/material";
import { useW3sContext } from "../../../../../providers/W3sProvider";
import Navbar from "../../../../../components/navbar/Navbar";

export default function Purchase() {
  const pathName = usePathname();
  const id = pathName.split("/").slice(-2)[0];
  const { data: session, status } = useSession();
  const { client, isInitialized } = useW3sContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swapDetails, setSwapDetails] = useState<{
    tokenId: string;
    price: string;
    sellerAddress: string;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [session, client, isInitialized]);

  const handleInitiateSwap = async () => {
    try {
      setLoading(true);

      const detailsResponse = await fetch(
        `/api/carbon-credits/${id}/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "initiateSwap",
          }),
        }
      );

      const swapData = await detailsResponse.json();
      console.log("Swap data:", swapData);
      setSwapDetails(swapData);

      const executeResponse = await fetch(
        `/api/carbon-credits/${id}/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "executeSwap",
            price: swapData.price,
            sellerAddress: swapData.sellerAddress,
          }),
        }
      );

      console.log("Execute response status:", executeResponse.status);
      const executeData = await executeResponse.json();
      console.log("Execute response data:", executeData);
      if (
        executeData.challengeId &&
        client &&
        session?.user.userToken &&
        session?.user.encryptionKey
      ) {
        await client.setAuthentication({
          userToken: session.user.userToken,
          encryptionKey: session.user.encryptionKey,
        });

        console.log("Challenge ID:", executeData.challengeId);
        await client?.execute(
          executeData.challengeId,
          async (error, result) => {
            if (error) {
              setError(`Error: ${error.message}`);
              return;
            }

            if (result) {
              console.log("Swap executed successfully:", result);
              const status = result.status;
              console.log("Transaction Hash:", status);
              redirect("/carbon-credits");
            }
          }
        );
      }
    } catch (error) {
      console.error("Swap error:", error);
      setError("Failed to complete swap");
    } finally {
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

          {error && (
            <Typography
              color="danger"
              sx={{ mb: 2 }}
            >
              {error}
            </Typography>
          )}

          <Button
            variant="solid"
            color="success"
            sx={{ width: "50%", mb: 2 }}
            onClick={handleInitiateSwap}
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

"use client";

import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/joy";
import { Typography } from "@mui/material";
import { useSession } from "next-auth/react";

interface CarbonCreditCardProps {
  id: string;
  projectName: string;
  location: string;
  amount: number;
  vintage: number;
  verificationStandard: string;
  price: number;
  isVerified: boolean;
  isLoading: boolean;
  onApprove?: (tokenId: string) => Promise<void>;
  approvingId?: string | null;
  approvalStatus?: { [key: string]: string };
}

export default function CarbonCreditCard({
  id,
  projectName,
  location,
  amount,
  vintage,
  verificationStandard,
  price,
  isVerified,
  isLoading,
  onApprove,
  approvingId,
  approvalStatus = {},
}: CarbonCreditCardProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === "admin@carboncredit.com";

  const handlePurchase = () => {
    redirect(`/carbon-credits/${id}/purchase`);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        width: 320,
        height: 350,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ mb: 1 }}
          >
            {projectName}
          </Typography>

          <Box sx={{ mb: 1 }}>
            <Typography variant="body2">
              <strong>Location:</strong> {location}
            </Typography>
            <Typography variant="body2">
              <strong>Amount:</strong> {amount}{" "}
              {amount > 1 ? "tonnes" : "tonne"}
            </Typography>
            <Typography variant="body2">
              <strong>Vintage:</strong> {vintage}
            </Typography>
            <Typography variant="body2">
              <strong>Standard:</strong> {verificationStandard}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: isVerified ? "success.100" : "warning.100",
              color: isVerified ? "success.700" : "warning.700",
              py: 0.5,
              px: 1,
              borderRadius: "sm",
              width: "fit-content",
              mb: 1,
            }}
          >
            <Typography
              variant="body1"
              fontWeight="bold"
            >
              {isVerified ? "Verified" : "Unverified"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              textAlign: "right",
              fontWeight: "bold",
              mb: 0.5,
            }}
          >
            {price} USDC
          </Typography>
          {!isAdmin && (
            // the following line will be enabled when the purchase function is implemented
            // && approvalStatus[id] === "success"
            <Button
              variant="solid"
              color="success"
              onClick={handlePurchase}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? <CircularProgress size="sm" /> : "Purchase"}
            </Button>
          )}
          {isAdmin && onApprove && (
            <>
              <Button
                color="primary"
                variant="solid"
                onClick={() => onApprove(id)}
                disabled={
                  approvingId === id || approvalStatus[id] === "success"
                }
                startDecorator={
                  approvingId === id ? <CircularProgress size="sm" /> : null
                }
                fullWidth
              >
                {approvalStatus[id] === "success"
                  ? "Approved ✓"
                  : approvingId === id
                  ? "Approving..."
                  : "Approve for Sale"}
              </Button>

              {approvalStatus[id] === "failed" && (
                <Alert
                  color="danger"
                  size="sm"
                >
                  Approval failed. Try again.
                </Alert>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { CardContent, Divider, CircularProgress, Box } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Sheet, Button, IconButton, Typography } from "@mui/joy";

export interface WalletCardProps {
  id: string;
  address: string;
  blockchain: string;
  balances: {
    native: {
      amount: string;
      symbol: string;
    };
    usdc: {
      amount: string;
      symbol: string;
    };
  };
  isLoading: boolean;
}

export default function WalletCard({
  id,
  address,
  blockchain,
  balances,
  isLoading,
}: WalletCardProps) {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const networkName =
    blockchain === "AVAX-FUJI" ? "Avalanche Fuji" : "Ethereum Sepolia";

  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: "md",
        boxShadow: "md",
        width: 400,
        height: 450,
        marginBottom: 2,
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          padding: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          level="h3"
          sx={{ mb: 2, textAlign: "center" }}
        >
          {networkName}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AccountBalanceWalletIcon
                sx={{ ml: -0.3, mr: 0.8, color: "action.active", fontSize: 18 }}
              />
              <Typography level="body-md">{truncatedAddress}</Typography>
            </Box>
            <IconButton
              variant="outlined"
              color="neutral"
              size="sm"
              onClick={handleCopyAddress}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography
            level="body-sm"
            sx={{ color: "text.secondary" }}
          >
            ID: {id}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Typography
            level="title-md"
            sx={{ mb: 2 }}
          >
            Wallet Balance
          </Typography>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Sheet
                variant="soft"
                sx={{
                  p: 2,
                  borderRadius: "md",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography level="body-md">Native Token</Typography>
                <Typography level="title-md">
                  {parseFloat(balances.native.amount) === 0
                    ? "0"
                    : parseFloat(balances.native.amount).toFixed(4)}{" "}
                  <Typography
                    level="body-sm"
                    sx={{ color: "text.secondary" }}
                  >
                    {balances.native.symbol}
                  </Typography>
                </Typography>
              </Sheet>

              <Sheet
                variant="soft"
                sx={{
                  p: 2,
                  borderRadius: "md",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography level="body-md">USDC</Typography>
                <Typography level="title-md">
                  {balances.usdc.amount}{" "}
                  <Typography
                    level="body-sm"
                    sx={{ color: "text.secondary" }}
                  >
                    {balances.usdc.symbol}
                  </Typography>
                </Typography>
              </Sheet>
            </Box>
          )}
        </Box>
      </CardContent>
    </Sheet>
  );
}

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";

export interface WalletCardProps {
  key: string;
  walletId: string;
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
  key,
  walletId,
  address,
  blockchain,
  balances,
  isLoading,
}: WalletCardProps) {
  return (
    <Card key={key}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          Wallet Id: {walletId}
        </Typography>
        <Typography
          variant="body2"
          gutterBottom
        >
          Wallet Address: {address}
        </Typography>
        <Typography
          variant="body2"
          gutterBottom
        >
          Blockchain Network:{" "}
          {blockchain === "AVAX-FUJI" ? "Avalanche Fuji" : "Ethereum Sepolia"}
        </Typography>
        <Divider />
        <Typography
          variant="body2"
          gutterBottom
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              {balances.native.amount} {balances.native.symbol}
              <br />
              {balances.usdc.amount} {balances.usdc.symbol}
            </>
          )}
        </Typography>
        <Button variant="contained">View Details</Button>
      </CardContent>
    </Card>
  );
}

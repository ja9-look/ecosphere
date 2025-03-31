import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { redirect } from "next/navigation";

export interface CarbonCreditCardProps {
  id: string;
  projectName: string;
  location: string;
  amount: number;
  vintage: number;
  verificationStandard: string;
  price: number;
  isVerified: boolean;
  isLoading?: boolean;
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
}: CarbonCreditCardProps) {
  return (
    <Card sx={{ width: 400, height: 500, marginBottom: 2 }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          {projectName}
        </Typography>
        <Typography
          variant="subtitle1"
          color="textSecondary"
          gutterBottom
        >
          {location}
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
              Amount: {amount}
              <br />
              Vintage: {vintage}
              <br />
              Verification Standard: {verificationStandard}
              <br />
              Price: {price}
            </>
          )}
        </Typography>
        <Button
          variant="contained"
          onClick={() => redirect(`/carbon-credit/${id}/purchase`)}
        >
          Purchase
        </Button>
      </CardContent>
    </Card>
  );
}

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
import { VERIFICATION_STANDARDS } from "../../types/types";

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
    <Card sx={{ width: 400, height: 250, marginBottom: 2 }}>
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
          variant="body1"
          gutterBottom
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <br />
              Amount: {amount}
              <br />
              Vintage: {vintage}
              <br />
              Verification Standard:{" "}
              {verificationStandard in VERIFICATION_STANDARDS}
              <br />
              Price: {price}
            </>
          )}
        </Typography>
        {/* <br />
        <Button
          variant="contained"
          color="secondary"
          onClick={() => redirect(`/carbon-credit/${id}/purchase`)}
        >
          Purchase
        </Button> */}
      </CardContent>
    </Card>
  );
}

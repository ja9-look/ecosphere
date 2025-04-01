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
  showPurchaseButton?: boolean;
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
  showPurchaseButton = false,
}: CarbonCreditCardProps) {
  return (
    <Card
      sx={{
        width: 400,
        height: showPurchaseButton ? 300 : 250,
        marginBottom: 2,
      }}
    >
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
              Verification Standard: {verificationStandard}
              <br />
              Price: {price}
            </>
          )}
        </Typography>
        {showPurchaseButton && (
          <>
            <br />
            <Button
              style={{ float: "right" }}
              variant="contained"
              color="success"
              onClick={() => redirect(`/carbon-credits/${id}/purchase`)}
            >
              Purchase
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

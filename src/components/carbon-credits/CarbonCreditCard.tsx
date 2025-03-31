import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";

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
          {projectName}, {location}
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
        <Button variant="contained">View Details</Button>
      </CardContent>
    </Card>
  );
}

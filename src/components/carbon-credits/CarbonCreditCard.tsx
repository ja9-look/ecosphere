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
  key: string;
  id: string;
  address: string;
  standard: string;
  vintage: string;
  project: string;
  quantity: string;
  amount: string;
  price: string;
  updatedAt: string;
  isLoading: boolean;
}

export default function CarbonCreditCard({
  key,
  id,
  address,
  standard,
  vintage,
  project,
  quantity,
  amount,
  price,
  updatedAt,
  isLoading,
}: CarbonCreditCardProps) {
  return (
    <Card
      key={key}
      sx={{ width: 400, height: 500, marginBottom: 2 }}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          Carbon Credit Id: {id}
        </Typography>
        <Typography
          variant="body2"
          gutterBottom
        >
          Wallet Address: {address}
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
              {quantity} {standard} Credits
              <br />
              Vintage: {vintage}
              <br />
              Project: {project}
              <br />
              Amount: {amount} {standard}
              <br />
              Price: {price} USDC
              <br />
              Updated At: {updatedAt}
            </>
          )}
        </Typography>
        <Button variant="contained">View Details</Button>
      </CardContent>
    </Card>
  );
}

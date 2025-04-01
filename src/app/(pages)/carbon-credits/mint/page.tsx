"use client";

import Navbar from "../../../../components/navbar/Navbar";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { CircularProgress, Snackbar, Alert } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useW3sContext } from "../../../../providers/W3sProvider";
import {
  Sheet,
  Typography,
  Button,
  Select,
  Option,
  FormControl,
  FormLabel,
} from "@mui/joy";
import { TextField } from "../../../../components/TextField";
import { VERIFICATION_STANDARDS } from "../../../../types/types";

const validationSchema = yup.object().shape({
  projectName: yup
    .string()
    .required("Project name is required")
    .min(3, "Project name must be at least 3 characters"),
  location: yup
    .string()
    .required("Location is required")
    .min(3, "Location must be at least 3 characters"),
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  vintage: yup
    .number()
    .required("Vintage is required")
    .positive("Vintage must be positive")
    .min(1990, "Vintage year must be after 1990")
    .max(new Date().getFullYear(), "Vintage year cannot be in the future"),
  verificationStandard: yup
    .string()
    .required("Verification standard is required"),
  price: yup
    .number()
    .required("Price is required")
    .positive("Price must be positive"),
});

type FormValues = yup.InferType<typeof validationSchema>;

export default function MintPage() {
  const { data: session, status } = useSession();
  const { client, isInitialized } = useW3sContext();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      projectName: "",
      location: "",
      amount: 0,
      vintage: 0,
      verificationStandard: "",
      price: 0,
    },
  });

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      !session?.user?.userToken ||
      !session?.user?.encryptionKey ||
      !client ||
      !isInitialized
    ) {
      return;
    }

    client.setAuthentication({
      userToken: session.user.userToken,
      encryptionKey: session.user.encryptionKey,
    });
  }, [session, client, isInitialized, status]);

  const onSubmit = async (data: FormValues) => {
    if (!session?.user) {
      setSnackbar({
        open: true,
        message: "Please sign in to mint carbon credits",
        severity: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      const metadataResponse = await fetch("/api/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: data.projectName,
          location: data.location,
          amount: data.amount,
          vintage: data.vintage,
          verificationStandard: data.verificationStandard,
          price: data.price.toString(),
          isVerified: true,
        }),
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        setSnackbar({
          open: true,
          message: errorData.message,
          severity: "error",
        });
        return;
      }

      const { id: metadataId } = await metadataResponse.json();
      const baseUrl = process.env.NEXTAUTH_URL;
      const metadataURI = `${baseUrl}/api/metadata/${metadataId}`;

      const mintResponse = await fetch("/api/carbon-credits/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          metadataURI,
        }),
      });

      if (!mintResponse.ok) {
        const errorData = await mintResponse.json();
        setSnackbar({
          open: true,
          message: errorData.message,
          severity: "error",
        });
        return;
      }

      const { state } = await mintResponse.json();
      setSnackbar({
        open: true,
        message: `Minting Carbon credit - Transaction Status: ${state}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error minting carbon credits:", error);
      setSnackbar({
        open: true,
        message: "Failed to mint carbon credits",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (status === "unauthenticated") {
    redirect("/signin");
  }

  if (session?.user?.email !== "admin@carboncredit.com") {
    redirect("/carbon-credits");
  }

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
          }}
        >
          <Typography
            level="h3"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Mint Carbon Credits
          </Typography>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <FormControl error={!!errors.projectName}>
              <FormLabel required>Project Name</FormLabel>
              <TextField
                placeholder="Enter project name"
                error={!!errors.projectName}
                helperText={errors.projectName?.message}
                {...register("projectName")}
              />
            </FormControl>

            <FormControl error={!!errors.location}>
              <FormLabel required>Location</FormLabel>
              <TextField
                placeholder="Enter location"
                error={!!errors.location}
                helperText={errors.location?.message}
                {...register("location")}
              />
            </FormControl>

            <FormControl error={!!errors.amount}>
              <FormLabel required>Amount (tonnes of CO2)</FormLabel>
              <TextField
                placeholder="Enter amount"
                type="number"
                error={!!errors.amount}
                helperText={errors.amount?.message}
                {...register("amount")}
              />
            </FormControl>

            <FormControl error={!!errors.vintage}>
              <FormLabel required>Vintage Year</FormLabel>
              <TextField
                placeholder="YYYY"
                type="number"
                error={!!errors.vintage}
                helperText={errors.vintage?.message}
                {...register("vintage")}
              />
            </FormControl>

            <FormControl error={!!errors.verificationStandard}>
              <FormLabel required>Verification Standard</FormLabel>
              <Controller
                name="verificationStandard"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select standard"
                    onChange={(_, value) => field.onChange(value)}
                  >
                    {VERIFICATION_STANDARDS.map((standard) => (
                      <Option
                        key={standard}
                        value={standard}
                      >
                        {standard}
                      </Option>
                    ))}
                  </Select>
                )}
              />
              {errors.verificationStandard && (
                <Typography
                  level="body-xs"
                  color="danger"
                >
                  {errors.verificationStandard.message}
                </Typography>
              )}
            </FormControl>

            <FormControl error={!!errors.price}>
              <FormLabel required>Price/Tonne (USDC)</FormLabel>
              <TextField
                placeholder="Enter price"
                type="number"
                error={!!errors.price}
                helperText={errors.price?.message}
                {...register("price")}
              />
            </FormControl>

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
              sx={{ mt: 2 }}
              color="success"
              size="lg"
            >
              {isSubmitting ? "Minting..." : "Mint Carbon Credits"}
            </Button>
          </form>

          {loading && (
            <div>
              <CircularProgress size={20} />
            </div>
          )}
        </Sheet>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={8000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

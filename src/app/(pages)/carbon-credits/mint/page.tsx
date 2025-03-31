"use client";
import Navbar from "../../../../components/navbar/Navbar";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Paper, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useW3sContext } from "../../../../providers/W3sProvider";

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
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      projectName: "",
      location: "",
      amount: undefined,
      vintage: undefined,
      verificationStandard: "",
      price: undefined,
    },
  });

  useEffect(() => {
    if (
      status !== "authenticated" ||
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
  }, [session, client]);

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
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://your-production-url.com"; // update to deployed url when ready
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

      // const { challengeId } = await mintResponse.json();
      console.log("page - mintResponse:", mintResponse);
      setLoading(false);

      // client?.execute(challengeId, async (error, result) => {
      //   if (error) {
      //     setSnackbar({
      //       open: true,
      //       message: `Error: ${error.message || "Minting failed"}`,
      //       severity: "error",
      //     });
      //     throw new Error(
      //       `Error executing challenge: ${error.message || "Unknown error"}`
      //     );
      //   }

      //   // if (result) {
      //   //   console.log(
      //   //     "Page - Full Minting Result:",
      //   //     JSON.stringify(result, null, 2)
      //   //   );

      //   setSnackbar({
      //     open: true,
      //     message: "Minting Carbon credit - Transaction Pending",
      //     severity: "success",
      //   });
      //   // }
      //   setLoading(false);
      // });
    } catch (error) {
      console.error("Error minting carbon credits:", error);
      setSnackbar({
        open: true,
        message: "Failed to mint carbon credits",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 4,
          padding: 8,
          justifyContent: "center",
          height: "100vh",
          alignItems: "center",
        }}
      >
        {loading && <CircularProgress size={20} />}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label>Project Name</label>
            <input {...register("projectName")} />
            {errors.projectName && <span>{errors.projectName.message}</span>}
          </div>
          <div>
            <label>Location</label>
            <input {...register("location")} />
            {errors.location && <span>{errors.location.message}</span>}
          </div>
          <div>
            <label>Amount</label>
            <input
              type="number"
              {...register("amount")}
            />
            {errors.amount && <span>{errors.amount.message}</span>}
          </div>
          <div>
            <label>Vintage</label>
            <input
              type="year"
              {...register("vintage")}
            />
            {errors.vintage && <span>{errors.vintage.message}</span>}
          </div>
          <div>
            <label>Verification Standard</label>
            <select {...register("verificationStandard")}>
              <option value="VERRA">Verra</option>
              <option value="GoldStandard">Gold Standard</option>
              <option value="PlanVivo">Plan Vivo</option>
              <option value="ClimateActionReseve">
                Climate Action Reserve
              </option>
              <option value="AmericanCarbonRegistry">
                American Carbon Registry
              </option>
              <option value="VerifiedCarbonStandard">
                Verified Carbon Standard
              </option>
            </select>
            {errors.verificationStandard && (
              <span>{errors.verificationStandard.message}</span>
            )}
          </div>
          <div>
            <label>Price</label>
            <input
              type="number"
              {...register("price")}
            />
            {errors.price && <span>{errors.price.message}</span>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Minting..." : "Mint Carbon Credits"}
          </button>
          {snackbar.open && <div>{snackbar.message}</div>}
        </form>
      </Paper>
    </div>
  );
}

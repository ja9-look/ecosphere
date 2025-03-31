"use client";

import { useSession } from "next-auth/react";
import Navbar from "../../../components/navbar/Navbar";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { CircularProgress } from "@mui/material";
import { Sheet } from "@mui/joy";
import CarbonCreditCard from "../../../components/carbon-credits/CarbonCreditCard";

export default function CarbonCredits() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [carbonCredits, setCarbonCredits] = useState([]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      redirect("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/carbon-credits");

        if (response.ok) {
          const data = await response.json();
          setCarbonCredits(data.carbonCredits);
        }
      } catch (error) {
        console.error("Error fetching carbon credits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, status]);

  console.log("carbon credits: ", carbonCredits);

  return (
    <div>
      <Navbar />
      <Sheet
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 4,
          padding: 8,
          justifyContent: "center",
          height: "100vh",
        }}
      >
        {loading && <CircularProgress size={20} />}
        {/* {carbonCredits.length > 0 &&
          carbonCredits.map((credit) => 
          <CarbonCreditCard
            key={credit.token.id}
            tokenId={credit.token.id}
            amount={credit.amount}
            )} */}
      </Sheet>
    </div>
  );
}

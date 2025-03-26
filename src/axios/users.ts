"use client";
import { axios } from "@/app/axios";
import { useMutation } from "react-query";

export const restorePinHelper = async () => {
  const response = await axios.post<{ challengeId: string }>(
    "/users/pin/restore"
  );

  return response.data.challengeId;
};

export const useRestorePinMutation = () => {
  return useMutation({
    mutationKey: ["restorePin"],
    mutationFn: () => restorePinHelper(),
  });
};

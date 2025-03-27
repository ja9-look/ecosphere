// src/app/setup-pin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useW3sContext } from "../../../providers/W3sProvider";

export default function SetupPinPage() {
  const { data: session, status } = useSession();
  const { client, isInitialized } = useW3sContext();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait until everything is ready
    if (
      status !== "authenticated" ||
      !session?.user?.userToken ||
      !session?.user?.encryptionKey ||
      !session?.user?.challengeId ||
      !client ||
      !isInitialized
    ) {
      return;
    }

    client.setAuthentication({
      userToken: session.user.userToken,
      encryptionKey: session.user.encryptionKey,
    });

    client.execute(session.user.challengeId, (error, result) => {
      if (error) {
        console.error("PIN setup error:", error);
        setError(`Error: ${error.message || "PIN setup failed"}`);
        return;
      }

      if (result?.status === "COMPLETE") {
        router.push("/dashboard");
      }
    });
  }, [session, status, client, isInitialized, router]);

  if (status === "loading" || !isInitialized) {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/signin");
    return null;
  }

  return (
    <div>
      <h1>Set Up Your PIN</h1>
      <p>Please follow the instructions to set up your secure PIN.</p>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useW3sContext } from "../../../providers/W3sProvider";
import styles from "./page.module.css";
import Link from "next/link";

export default function SetupPinPage() {
  const { data: session, status } = useSession();
  const { client, isInitialized } = useW3sContext();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      } else if (result) {
        router.push("/dashboard");
      }
    });
  }, [session, status, client, isInitialized, router]);

  if (status === "loading" || !isInitialized) {
    return (
      <div>
        <h4>Loading...</h4>
      </div>
    );
  }

  if (!session) {
    router.push("/signin");
    return null;
  }

  return (
    <div className={styles.setupPinContainer}>
      <Link href={session ? "/dashboard" : "/"}>
        <Image
          src="/ecosphere_logo.png"
          alt="Ecosphere"
          width={200}
          height={200}
        />
      </Link>
      {error ? (
        <div>
          <h4>{error}</h4>
        </div>
      ) : (
        <div>
          <h4>Setting up your PIN...</h4>
        </div>
      )}
    </div>
  );
}

import Image from "next/image";
import styles from "./page.module.css";
import Typography from "@mui/material/Typography";
import { AuthForm } from "../components/auth/AuthForm";
import { Button } from "@mui/joy";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <Image
          className={styles.logo}
          src="/ecosphere_logo.png"
          alt="ecosphere logo"
          width={200}
          height={200}
        />
        <Typography variant="h4">
          sustainable · transparent · decentralized
        </Typography>
        <div className={styles.ctas}>
          <Button
            className={styles.signin}
            variant="solid"
            size="lg"
          >
            Sign In
          </Button>
          <Button
            className={styles.signup}
            variant="plain"
            size="lg"
          >
            Sign Up
          </Button>
        </div>
      </div>
      <footer className={styles.footer}>
        <Typography variant="body2">
          © 2025 ecosphere. All rights reserved.
        </Typography>
      </footer>
    </div>
  );
}

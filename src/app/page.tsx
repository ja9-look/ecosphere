import Image from "next/image";
import styles from "./page.module.css";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/joy";
import Link from "next/link";

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
        <h4>sustainable · transparent · decentralized</h4>
        <div className={styles.ctas}>
          <Link href="/signin">
            <Button
              className={styles.signin}
              variant="solid"
              size="lg"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              className={styles.signup}
              variant="plain"
              size="lg"
            >
              Sign Up
            </Button>
          </Link>
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

import Image from "next/image";
import styles from "./page.module.css";
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
          <Button
            className={styles.signin}
            variant="solid"
            size="lg"
            component="a"
            href="/signin"
          >
            Sign In
          </Button>
          <Button
            className={styles.signup}
            variant="plain"
            size="lg"
            component="a"
            href="/signup"
          >
            Sign Up
          </Button>
        </div>
      </div>
      <footer className={styles.footer}>
        <h6>© 2025 ecosphere. All rights reserved.</h6>
      </footer>
    </div>
  );
}

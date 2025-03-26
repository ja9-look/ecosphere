import Image from "next/image";
import styles from "./page.module.css";
import Typography from "@mui/material/Typography";
import Login from "../components/auth/AuthForm";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Login />
      </main>
      <footer className={styles.footer}>
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
        >
          © 2025 ecosphere - carbon credit marketplace
        </Typography>
      </footer>
    </div>
  );
}

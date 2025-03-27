import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./ProtectedRoute.module.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

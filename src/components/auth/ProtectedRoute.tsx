// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import { useAuth } from "../../contexts/AuthContext";
// import { CircularProgress } from "@mui/material";

// interface ProtectedRouteProps {
//   children: React.ReactNode;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
//   const { isAuthenticated, isLoading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isAuthenticated && !isLoading) {
//       router.push("/signin");
//     }
//   }, [isAuthenticated, isLoading, router]);

//   if (isLoading) {
//     return <CircularProgress size={20} />;
//   }

//   if (!isAuthenticated) {
//     return <div>Redirecting...</div>;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;

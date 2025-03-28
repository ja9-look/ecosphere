"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Box, Button, Container, Sheet, Typography, useTheme } from "@mui/joy";

interface NavItem {
  label: string;
  href: string;
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const authenticatedItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "My Wallets", href: "/wallets" },
  ];

  return (
    <div>
      <Sheet
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          boxShadow: "sm",
        }}
      >
        <Container>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: "64px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Link
                href={status === "authenticated" ? "/dashboard" : "/"}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Image
                  src="/ecosphere_logo_no_text.png"
                  alt="Ecosphere Logo"
                  width={50}
                  height={40}
                />
                <Image
                  src="/ecosphere_logo_text.png"
                  alt="Ecosphere"
                  width={110}
                  height={20}
                />
              </Link>
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 4,
              }}
            >
              {status === "authenticated" &&
                authenticatedItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "md",
                        color:
                          pathname === item.href
                            ? "primary.500"
                            : "text.secondary",
                        borderBottom:
                          pathname === item.href ? "2px solid" : "none",
                        borderColor: "primary.500",
                        pb: 0.5,
                        "&:hover": {
                          color: "primary.400",
                        },
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Link>
                ))}
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 2,
              }}
            >
              {status === "authenticated" && (
                <>
                  <Typography
                    level="body-sm"
                    sx={{ mr: 2 }}
                  >
                    {session?.user?.email}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Sheet>
    </div>
  );
};

export default Navbar;

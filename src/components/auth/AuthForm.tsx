"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import * as yup from "yup";
import { useW3sContext } from "../../providers/W3sProvider";
import { TextField } from "../TextField";
import { Typography, Button, IconButton } from "@mui/joy";
import styles from "./AuthForm.module.css";
import Link from "next/link";

const formSchema = yup.object({
  email: yup
    .string()
    .email("Please provide a valid email")
    .required("Email required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password required"),
});

type FormInputs = yup.InferType<typeof formSchema>;

interface AuthFormProps {
  isSignIn?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isSignIn = true }) => {
  const { register, handleSubmit, formState } = useForm<FormInputs>({
    resolver: yupResolver(formSchema),
  });

  const [loading, setLoading] = useState(false);
  const [isMasked, setIsMasked] = useState(true);
  const [formMessage, setFormMessage] = useState<string | undefined>(undefined);
  const [redirect, setRedirect] = useState<boolean>(false);
  const router = useRouter();
  const { client, isInitialized } = useW3sContext();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (redirect && session && client && sessionStatus === "authenticated") {
      if (session.user?.challengeId) {
        router.push("/setup-pin");
      } else {
        router.push("/marketplace");
      }
      setLoading(false);
    }
  }, [redirect, session, client, sessionStatus, router]);

  const onSubmit: SubmitHandler<FormInputs> = async (data: any) => {
    setLoading(true);
    setFormMessage(undefined);

    try {
      if (!isSignIn) {
        const response = await signIn("SignUp", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (response?.ok) {
          setRedirect(true);
        } else if (response?.error) {
          console.log(response);
          console.log(client);

          setFormMessage(response.error);
        } else {
          setFormMessage("Error occurred on sign up - please try again.");
        }
      } else {
        const response = await signIn("SignIn", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (response?.ok) {
          setRedirect(true);
        } else {
          setFormMessage("Invalid credentials");
        }
      }
    } catch (error: any) {
      setFormMessage(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <div className={styles.authForm}>
        <Link href="/">
          <Image
            src="/ecosphere_logo.png"
            alt="ecosphere logo"
            width={200}
            height={200}
          />
        </Link>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            placeholder="Email"
            type="email"
            error={formState.errors.email ? true : false}
            helperText={formState.errors.email?.message}
            {...register("email")}
          />
          <TextField
            placeholder="Password"
            type={isMasked ? "password" : "text"}
            error={formState.errors.password ? true : false}
            helperText={formState.errors.password?.message}
            endDecorator={
              <IconButton onClick={() => setIsMasked(!isMasked)}>
                {isMasked ? "Show" : "Hide"}
              </IconButton>
            }
            {...register("password")}
          />
          <Button
            className={styles.authFormButton}
            type="submit"
            variant="solid"
            size="md"
            loading={loading}
            disabled={loading}
          >
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
          {formMessage && (
            <Typography
              color="danger"
              mt={2}
            >
              {formMessage}
            </Typography>
          )}
          <Typography mt={2}>
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
            <Button
              className={styles.authFormButtonLink}
              variant="plain"
              onClick={() => router.push(isSignIn ? "/signup" : "/signin")}
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </Button>
          </Typography>
        </form>
      </div>
    </div>
  );
};

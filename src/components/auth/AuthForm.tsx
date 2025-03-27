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
import "./AuthForm.css";

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
  const { client } = useW3sContext();
  const { data: session } = useSession();

  useEffect(() => {
    if (redirect && session && client) {
      if (session.user.challengeId) {
        client.execute(session.user.challengeId, (error: any, result: any) => {
          if (error) {
            setFormMessage("Error occurred on PIN setup - please try again.");
          } else if (result) {
            router.push("/dashboard");
          }
        });
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    }
  }, [redirect, session, client]);

  const onSubmit: SubmitHandler<FormInputs> = async (data: any) => {
    setLoading(true);
    if (!isSignIn) {
      const response = await signIn("SignUp", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (response?.ok) {
        setRedirect(true);
      } else if (response?.error) {
        setFormMessage(response.error);
      } else {
        setFormMessage("Error occurred on sign up - please try again.");
      }
      setLoading(false);
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
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <Image
          src="/ecosphere_logo.png"
          alt="ecosphere logo"
          width={200}
          height={200}
        />
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
            className="auth-form-button"
            type="submit"
            variant="solid"
            size="md"
            loading={loading}
            disabled={loading}
          >
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
          {formMessage && <p>{formMessage}</p>}
          <Typography>
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
            <Button
              className="auth-form-button-link"
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

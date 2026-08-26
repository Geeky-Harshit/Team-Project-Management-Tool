import { SignInForm } from "@/components/auth/sign-in-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | TMT",
  description: "Sign in to your account",
};

export default function SignInPage() {
  return <SignInForm />;
}

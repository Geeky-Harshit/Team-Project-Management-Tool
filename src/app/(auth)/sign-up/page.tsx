import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Account | TMT",
  description: "Get started with TMT workspace",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}

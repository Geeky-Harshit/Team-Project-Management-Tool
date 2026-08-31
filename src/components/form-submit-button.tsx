"use client";

import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

export function FormSubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: ComponentProps<typeof Button> & { pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

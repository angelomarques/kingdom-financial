"use client";

import { useActionState, type ReactNode } from "react";
import {
  idleActionState,
  type ActionState,
} from "@/app/actions";

export function ActionForm({
  action,
  children,
  className,
  id,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const [state, formAction] = useActionState(action, idleActionState);

  return (
    <form id={id} action={formAction} className={className}>
      {children}
      {state.status === "error" ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

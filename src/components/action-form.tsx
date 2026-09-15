"use client";

import { useActionState, type ReactNode } from "react";

export type BaseActionState =
  | { status: "idle" }
  | { status: "ok" | "success"; message?: string }
  | { status: "error"; message: string };

const defaultIdleState: BaseActionState = { status: "idle" };

export function ActionForm<T extends BaseActionState = BaseActionState>({
  action,
  children,
  className,
  id,
  initialState = defaultIdleState as Awaited<T>,
}: {
  action: (state: Awaited<T>, formData: FormData) => T | Promise<T>;
  children: ReactNode;
  className?: string;
  id?: string;
  initialState?: Awaited<T>;
}) {
  const [state, formAction] = useActionState(action, initialState);

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

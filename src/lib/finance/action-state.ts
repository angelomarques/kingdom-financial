export type ActionState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string };

export const idleActionState: ActionState = { status: "idle" };

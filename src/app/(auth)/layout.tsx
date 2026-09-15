import type { ReactNode } from "react";
import { AuthHeader } from "@/components/auth-header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AuthHeader />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

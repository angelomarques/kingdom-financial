import Link from "next/link";
import { User, ShieldCheck, Mail, Calendar, Key } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function SessionPage() {
  const authState = await getSession();

  if (authState.status === "unauthenticated") {
    return (
      <Card className="border-border/60 shadow-lg text-center p-6">
        <CardHeader className="pb-4">
          <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2">
            <User className="size-6" />
          </div>
          <CardTitle className="text-xl">No active session</CardTitle>
          <CardDescription>
            You are currently not signed in. Sign in or create an account to view your session.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center gap-3 pt-2">
          <Link
            href="/sign-in"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted text-foreground"
          >
            Sign up
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const { user, session } = authState;

  return (
    <Card className="border-border/60 shadow-lg" id="session-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
            Active Session
          </Badge>
          <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
            {session.id.slice(0, 8)}...
          </span>
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight mt-2 flex items-center gap-2">
          <span>{user.name}</span>
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <Mail className="size-3.5" />
          <span>{user.email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div className="rounded-lg bg-muted/40 p-3.5 space-y-2 border border-border/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-400" /> User ID
            </span>
            <span className="font-mono text-[11px] select-all">{user.id}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Key className="size-3.5 text-amber-400" /> Session Token
            </span>
            <span className="font-mono text-[11px] select-all">
              {session.token.slice(0, 16)}...
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3.5 text-blue-400" /> Session Expires
            </span>
            <span className="font-mono text-[11px]">
              {new Date(session.expiresAt).toLocaleString("pt-PT")}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
          <Link href="/" className="underline hover:text-foreground">
            &larr; Return to Budget Pizza
          </Link>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/40 pt-4 flex justify-between items-center">
        <form action={signOutAction} className="w-full">
          <SubmitButton variant="destructive" className="w-full flex items-center justify-center gap-2">
            Sign out
          </SubmitButton>
        </form>
      </CardFooter>
    </Card>
  );
}

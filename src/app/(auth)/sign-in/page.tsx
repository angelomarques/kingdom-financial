import Link from "next/link";
import { signInAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/lib/auth/domain";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Sign in to Kingdom Financial
        </CardTitle>
        <CardDescription>
          Enter your email and password to access your monthly finances and budget pizza.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ActionForm<AuthActionResult> action={signInAction} className="grid gap-4" id="sign-in-form">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <SubmitButton className="w-full mt-2">Sign in</SubmitButton>
        </ActionForm>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t border-border/40 pt-4 text-center text-xs text-muted-foreground">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium underline hover:text-foreground">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

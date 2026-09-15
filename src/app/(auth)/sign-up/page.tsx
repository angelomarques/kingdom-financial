import Link from "next/link";
import { signUpAction } from "@/lib/auth/actions";
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

export default function SignUpPage() {
  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription>
          Enter your details below to create your Kingdom Financial account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ActionForm<AuthActionResult> action={signUpAction} className="grid gap-4" id="sign-up-form">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              required
              autoComplete="name"
            />
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <SubmitButton className="w-full mt-2">Create account</SubmitButton>
        </ActionForm>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t border-border/40 pt-4 text-center text-xs text-muted-foreground">
        <p>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium underline hover:text-foreground">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

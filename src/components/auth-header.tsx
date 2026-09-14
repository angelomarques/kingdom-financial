import Link from "next/link";
import { User, LogIn, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AuthHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border/40 py-3.5 px-4 sm:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-7 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs tracking-wider">
            KF
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-base font-bold tracking-tight text-foreground group-hover:text-amber-400 transition-colors">
              Kingdom Financial
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              Personal Finance & Budget Pizza
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <nav className="flex items-center gap-2 text-xs">
          <Link
            href="/sign-in"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogIn className="size-3.5" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/sign-up"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <KeyRound className="size-3.5" />
            <span>Sign Up</span>
          </Link>
          <Link
            href="/session"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="size-3.5" />
            <span>Session</span>
          </Link>
        </nav>
        <Badge variant="outline" className="hidden sm:inline-flex text-[11px]">
          Auth
        </Badge>
      </div>
    </header>
  );
}

"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextLoader } from "@/components/ui/text-loader";
import { Boxes } from "@/components/ui/background-boxes";
import { authApi } from "@/api/services";
import { useAuth } from "@/providers/AuthProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      toast.success(res.message || "Logged in successfully!");
      login(res.token, res.user);
      router.replace(redirectUrl);
    } catch (err: any) {
      const msg = err?.message || "Invalid credentials. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background Interactive Boxes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto">
        <Boxes />
        {/* Subtle radial vignette gradient to soften the edges */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_80%)]" />
      </div>

      {/* Main Login Card (Above Boxes) */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Logo */}
          <div className="flex size-14 items-center justify-center rounded-md bg-card/80 p-1.5 shadow-md border border-border backdrop-blur-md">
            <Image
              src="/assets/logo/logo.png"
              alt="Super Manager Logo"
              width={56}
              height={56}
              className="size-full object-contain"
              priority
            />
          </div>

          <div className="flex items-center gap-1.5 justify-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Super Manager
            </h1>
            <span className="inline-flex items-center gap-1 rounded-xs bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
              <ShieldCheck className="size-3" /> Admin
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            System Creator & Master Control Console
          </p>
        </div>

        <Card className="border-border bg-card/95 shadow-xl backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold">Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter credentials to access the master platform administration
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-sm border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="fardin1.codezzi@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  icon={Lock}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full font-medium"
                disabled={isLoading}
              >
                {isLoading ? <TextLoader text="Authenticating" /> : "Access Admin Console"}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Need an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Register here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <TextLoader text="Loading Super Manager..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

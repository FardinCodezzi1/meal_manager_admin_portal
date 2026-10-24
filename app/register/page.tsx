"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User, Phone, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextLoader } from "@/components/ui/text-loader";
import { Boxes } from "@/components/ui/background-boxes";
import { authApi } from "@/api/services";
import { useAuth } from "@/providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      toast.success("Account created successfully!");
      login(res.token, res.user);
      router.replace("/");
    } catch (err: any) {
      const msg = err?.message || "Registration failed. Please try again.";
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
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_80%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
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
              <ShieldCheck className="size-3" /> Admin Portal
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Register administrator account
          </p>
        </div>

        <Card className="border-border bg-card/95 shadow-xl backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold">Create Account</CardTitle>
            <CardDescription className="text-xs">
              Enter your details to create an administrator profile
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3.5">
              {error && (
                <div className="flex items-center gap-2 rounded-sm border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Full Name"
                icon={User}
                placeholder="Fardin Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="fardin1.codezzi@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Phone Number (Optional)"
                icon={Phone}
                placeholder="+880 1700 000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  icon={Lock}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              <Input
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                icon={Lock}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full font-medium"
                disabled={isLoading}
              >
                {isLoading ? <TextLoader text="Creating account" /> : "Complete Registration"}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

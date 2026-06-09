"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validators/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    console.log("Registration payload verified on client:", data);
    // This payload is perfectly sanitized and ready to be posted to your Deno backend!
  };

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Daftar Akun
        </CardTitle>
        <CardDescription className="text-center">
          Masukkan informasi Anda untuk daftar akun
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name Input Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Profil</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Input Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Input Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-zinc-500 text-center w-full">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </CardFooter>
    </>
  );
}
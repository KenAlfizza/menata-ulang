"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validators/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    console.log("Form data parsed via v4 setup:", data);
    // Ready for your backend API fetch request!
  };

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Selamat Datang
        </CardTitle>
        <CardDescription className="text-center">
          Masukkan email dan kata sandi untuk mengakses akun Anda
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Standard HTML form wrapper managed by react-hook-form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email Input Field Block */}
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

          {/* Password Input Field Block */}
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

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Memasukkan Anda..." : "Masuk"}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-zinc-500 text-center w-full">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Daftar
          </Link>
        </p>
      </CardFooter>
    </>
  );
}
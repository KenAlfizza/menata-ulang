"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validators/auth";

import { useAuth } from "@/context/auth-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuth();

  const [apiSuccess, setApiSuccess] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched", // Validates on blur/touch to give instant registration-style feedback
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    console.log("Form data verified on client side:", data);
    setGlobalError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const response = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (response.status === 500) {
        setGlobalError("Terjadi kesalahan pada server internal. Silakan coba lagi nanti.");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        // Handle nested field validation map from backend (e.g., lowercase letters check)
        if (result.error && typeof result.error === "object") {
          Object.keys(result.error).forEach((field) => {
            setError(field as keyof LoginInput, {
              type: "server",
              message: result.error[field],
            });
          });
          return;
        }

        // Fallback for flat string responses
        switch (response.status) {
          case 404:
            setError("email", {
              type: "server",
              message: typeof result.error === "string" ? result.error : "Akun tidak ditemukan.",
            });
            break;
            
          case 401:
            setError("password", {
              type: "server",
              message: typeof result.error === "string" ? result.error : "Kata sandi salah atau tidak valid.",
            });
            break;
            
          default:
            setGlobalError(
              typeof result.error === "string" 
                ? result.error 
                : "Gagal masuk. Silakan periksa kembali data Anda."
            );
        }
        return;
      }

      setApiSuccess(true);
      const accessToken = result.token;
      setToken(accessToken);

      setTimeout(() => {
        router.push("/home"); 
      }, 1500);

    } catch (error: any) {
      console.error("Login request crashed:", error);
      setGlobalError("Tidak dapat terhubung ke server backend.");
    }
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
        {globalError && (
          <div className="p-3 mb-4 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {globalError}
          </div>
        )}
        
        {apiSuccess && (
          <div className="p-3 mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30">
            Login berhasil! Membuka halaman utama...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email Input Field Block */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={isSubmitting || apiSuccess}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email?.message && (
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
              disabled={isSubmitting || apiSuccess}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password?.message && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting || apiSuccess}>
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
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

// Interface mapping your Hono error shapes directly to our frontend inputs
interface BackendLoginErrors {
  email?: string;
  password?: string;
  global?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const { setToken } = useAuth();

  const [apiSuccess, setApiSuccess] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<BackendLoginErrors>({});

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

const onSubmit = async (data: LoginInput) => {
    console.log("Form data parsed via v4 setup:", data);
    setApiErrors({}); // Clear previous states

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const response = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        switch (response.status) {
          case 404: // Account not found
            setApiErrors({ 
              email: result.error || "Akun tidak ditemukan." 
            });
            break;
            
          case 401: // Invalid credentials / Unauthorized
            setApiErrors({ 
              password: result.error || "Kata sandi salah atau tidak valid." 
            });
            break;
            
          case 500: // Database crash / Prisma engine failures
            setApiErrors({ 
              global: "Terjadi kesalahan pada server internal. Silakan coba lagi nanti." 
            });
            break;
            
          default: // Catch-all fallback for other statuses (e.g., 400 Bad Request)
            setApiErrors({ 
              global: result.error || "Gagal masuk. Silakan periksa kembali data Anda." 
            });
        }
        return;
      }

      // SUCCESS (HTTP 200)
      setApiSuccess(true);

      const accessToken = result.token;
      console.log("Access Token received:", accessToken);
      
      // Save token to context
      setToken(accessToken);

      setTimeout(() => {
        router.push("/home"); 
      }, 1500);

    } catch (error: any) {
      console.error("Login request crashed:", error);
      setApiErrors({ global: "Tidak dapat terhubung ke server backend." });
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
        {/* Core System / Runtime Catch-All Banners */}
        {apiErrors.global && (
          <div className="p-3 mb-4 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {apiErrors.global}
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
              aria-invalid={!!errors.email || !!apiErrors.email}
              {...register("email")}
            />
            {(errors.email || apiErrors.email) && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.email?.message || apiErrors.email}
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
              aria-invalid={!!errors.password || !!apiErrors.password}
              {...register("password")}
            />
            {(errors.password || apiErrors.password) && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.password?.message || apiErrors.password}
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
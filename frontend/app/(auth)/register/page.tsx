"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/validators/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

// Interface mapping your Hono backend error payload structure
interface BackendErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  global?: string;
}

// Inline Password Checklist Component
function PasswordChecklist({ value }: { value: string }) {
  const requirements = [
    { label: "Minimal 8 karakter", test: (val: string) => val.length >= 8 },
    { label: "Huruf besar (A-Z)", test: (val: string) => /[A-Z]/.test(val) },
    { label: "Huruf kecil (a-z)", test: (val: string) => /[a-z]/.test(val) },
    { label: "Angka (0-9)", test: (val: string) => /[0-9]/.test(val) },
    { label: "Karakter spesial (!@#$%^&*)", test: (val: string) => /[^A-Za-z0-9]/.test(val) },
  ];

  if (!value) return null;

  return (
    <div className="p-3 mt-2 space-y-1.5 bg-white/50 border border-zinc-200 rounded-lg text-xs dark:bg-zinc-900/50 dark:border-zinc-800 animate-in fade-in slide-in-from-top-1 duration-200">
      <p className="font-medium text-zinc-500 dark:text-zinc-400 mb-1">Keamanan Kata Sandi:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {requirements.map((req, index) => {
          const isPassed = req.test(value);
          return (
            <div
              key={index}
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {isPassed ? (
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              ) : (
                <X className="h-3.5 w-3.5 stroke-[3] text-zinc-300 dark:text-zinc-700" />
              )}
              <span className={isPassed ? "font-medium" : ""}>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [apiSuccess, setApiSuccess] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<BackendErrors>({});

  const {
    register,
    handleSubmit,
    watch,
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

  // Track password input values for the checklist component
  const passwordValue = watch("password", "");

  const onSubmit = async (data: RegisterInput) => {
    console.log("Registration payload verified on client:", data);
    setApiErrors({}); // Reset previous errors

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const response = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      
      // HANDLE BACKEND REGISTRATION ERRORS BASED ON HTTP STATUS CODES
      if (!response.ok) {
        switch (response.status) {
          case 409: // Conflict: Email already exists (P2002)
            setApiErrors({ 
              email: "Email ini sudah terdaftar. Silakan gunakan email lain." 
            });
            break;
            
          case 500: // Database crash or internal errors
            setApiErrors({ 
              global: "Terjadi kesalahan pada server internal. Silakan coba lagi nanti." 
            });
            break;
            
          default: // Catch-all fallback for other unhandled error statuses
            setApiErrors({ 
              global: result.error || "Registrasi gagal. Silakan periksa kembali data Anda." 
            });
        }
        return;
      }

      // SUCCESS (HTTP 201)
      setApiSuccess(true);

      // Redirect workflow to standard login platform
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error) {
      console.error("Submission failed:", error);
      setApiErrors({ global: "Tidak dapat terhubung ke server backend." });
    }
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
        {/* Connection Failure / Core Engine Crash Banner */}
        {apiErrors.global && (
          <div className="p-3 mb-4 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {apiErrors.global}
          </div>
        )}
        
        {apiSuccess && (
          <div className="p-3 mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30">
            Akun berhasil didaftarkan! Mengalihkan...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Profile Name Input Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Profil</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              disabled={isSubmitting || apiSuccess}
              aria-invalid={!!errors.name || !!apiErrors.name}
              {...register("name")}
            />
            {(errors.name || apiErrors.name) && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.name?.message || apiErrors.name}
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

          {/* Password Input Field */}
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
            
            {/* Dynamic Checklist Component Insertion */}
            <PasswordChecklist value={passwordValue} />

            {(errors.password || apiErrors.password) && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.password?.message || apiErrors.password}
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
              disabled={isSubmitting || apiSuccess}
              aria-invalid={!!errors.confirmPassword || !!apiErrors.confirmPassword}
              {...register("confirmPassword")}
            />
            {(errors.confirmPassword || apiErrors.confirmPassword) && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.confirmPassword?.message || apiErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting || apiSuccess}>
            {isSubmitting ? "Mendaftar akun..." : "Daftar"}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-zinc-500 text-center w-full">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Masuk
          </Link>
        </p>
      </CardFooter>
    </>
  );
}
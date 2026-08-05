"use client";

import { ServerCrash, FileQuestion, ShieldAlert, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
    statusCode: number | null;
    error: {
        error: {
            message: string;
            code: string;
        };
    } | null;
    redirect: string;
}

export function Error({ statusCode, error, redirect}: ErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center w-screen min-h-screen space-y-4">
            <div className="flex flex-row gap-4 items-center">
                {/* Icon Selection based on Status Code */}
                {statusCode && statusCode >= 500 ? (
                    <ServerCrash className="text-zinc-300" size={128} strokeWidth={1.75} />
                ) : statusCode === 404 ? (
                    <FileQuestion className="text-zinc-300" size={128} strokeWidth={1.75} />
                ) : statusCode === 403 || statusCode === 401 ? (
                    <ShieldAlert className="text-zinc-300" size={128} strokeWidth={1.75} />
                ) : (
                    <AlertTriangle className="text-zinc-300" size={128} strokeWidth={1.75} />
                )}

                <div className="text-left">
                    {/* HTTP Status Code */}
                    <span className="text-6xl font-bold tracking-tight text-zinc-300">
                        {statusCode}
                    </span>

                    <div className="space-y-1">
                        {/* Backend Error Message */}
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                            {error?.error?.message}
                        </h1>

                        {/* Backend Error Code */}
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                            Error Code: {error?.error?.code}
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <Link
                    href={redirect}
                    className="inline-flex items-center justify-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 px-4 py-2 rounded-md shadow-sm transition"
                >
                    Return to Workspace
                </Link>
            </div>
        </div>
    );
}

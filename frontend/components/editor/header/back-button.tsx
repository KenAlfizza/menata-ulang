"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUsePuck } from "@puckeditor/core";
import { Button } from "../../ui/button.tsx";
import { ArrowLeft, X } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../ui/alert-dialog.tsx";

interface BackButtonProps {
    hasUnsavedChanges: boolean
}

export function BackButton({hasUnsavedChanges}: BackButtonProps) {
    const router = useRouter();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleBackClick = () => {
        if (hasUnsavedChanges) {
            setShowConfirmDialog(true);
        } else {
            router.back();
        }
    };

    return (
        <>
            <Button
                onClick={handleBackClick}
                aria-label="Back"
                className="text-zinc-600 bg-zinc-100 h-8 w-8 flex items-center justify-center rounded-md transition hover:bg-zinc-200"
            >
                <ArrowLeft size={16} />
            </Button>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Unsaved Changes
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.back()}>
                            Leave
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
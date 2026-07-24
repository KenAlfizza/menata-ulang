import { useRouter } from "next/navigation";
import { Button } from "../../ui/button.tsx";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
    const router = useRouter();
    return (
        <Button
            onClick={() => router.back()}
            aria-label="Back"
            className="text-zinc-600 bg-zinc-100 h-8 w-8 flex items-center justify-center rounded-md transition hover:bg-zinc-200"
        >
            <ArrowLeft size={16} />
        </Button>
    );
}
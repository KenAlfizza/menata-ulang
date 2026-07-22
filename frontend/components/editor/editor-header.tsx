// components/editor/EditorHeader.tsx
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Undo2, Redo2, Save, ArrowUpRight, ArrowLeft } from "lucide-react";
import { createContext, useContext } from "react";
import { createUsePuck } from "@puckeditor/core";
import { Button } from "@/components/ui/button";

const usePuck = createUsePuck();

// Export these so the parent can wrap them in Providers
export const SavingContext = createContext(false);
export const PublishingContext = createContext(false);

function HistoryControls() {
  const back = usePuck((s) => s.history.back);
  const forward = usePuck((s) => s.history.forward);
  const hasPast = usePuck((s) => s.history.hasPast);
  const hasFuture = usePuck((s) => s.history.hasFuture);

  return (
    <div className="flex items-center gap-1">
      <Button onClick={back} disabled={!hasPast} variant="ghost" className="h-8 w-8 p-0">
        <Undo2 size={16} />
      </Button>
      <Button onClick={forward} disabled={!hasFuture} variant="ghost" className="h-8 w-8 p-0">
        <Redo2 size={16} />
      </Button>
    </div>
  );
}

function SaveButton({ onSave }: { onSave: () => void }) {
  const isSaving = useContext(SavingContext);
  return (
    <Button disabled={isSaving} onClick={onSave} variant="ghost" className="h-8 w-8 p-0 text-blue-500">
      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
    </Button>
  );
}

function PublishButton({ onPublish }: { onPublish: () => void }) {
  const isPublishing = useContext(PublishingContext);
  return (
    <Button disabled={isPublishing} onClick={onPublish} variant="ghost" className="h-8 w-8 p-0 text-green-500">
      {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
    </Button>
  );
}

function handleEditorHeaderName(role: string) {
    switch (role) {
        case "author":
            return "Story Editor"
        case "researcher":
            return "Research Editor"
    }
}

export function EditorHeader({ onSave, onPublish, role }: { onSave: () => void; onPublish: () => void; role: string }) {
  const router = useRouter();
  
  return (
    <div className="bg-white px-2 h-12 flex justify-between items-center border-b border-zinc-200">
      <div className="flex items-center gap-2">
        <Button onClick={() => router.back()} variant="ghost" className="h-8 w-8 p-0"><ArrowLeft size={16} /></Button>
        <Image src="/logo-text.svg" alt="Logo" width={100} height={24} className="brightness-0" />
        <span className="text-zinc-300 font-semibold">|</span>
        <span className="tracking-tight font-semibold text-zinc-500">{handleEditorHeaderName(role)}</span>
      </div>
      <div className="flex items-center gap-1">
        <HistoryControls />
        <SaveButton onSave={onSave} />
        <PublishButton onPublish={onPublish} />
      </div>
    </div>
  );
}